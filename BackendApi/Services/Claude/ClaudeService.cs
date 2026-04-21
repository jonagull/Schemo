using System.Text;
using System.Text.Json;
using BackendApi.Models.Hardware;

namespace BackendApi.Services.Claude;

public class ClaudeService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<ClaudeService> logger) : IClaudeService
{
    private static readonly Dictionary<string, string> LanguageNames = new()
    {
        ["arduino"]      = "Arduino C++ (.ino files, using Arduino framework)",
        ["micropython"]  = "MicroPython (.py files, using machine/utime modules)",
        ["circuitpython"]= "CircuitPython (.py files, using adafruit libraries)",
        ["platformio"]   = "C++ with PlatformIO (.cpp files, using Arduino or ESP-IDF framework)",
        ["rust"]         = "Rust Embedded (.rs files, using embedded-hal traits)",
    };

    private static string BuildSystemPrompt(string language)
    {
        var langName = LanguageNames.GetValueOrDefault(language, LanguageNames["arduino"]);

        // $$""" raw string: {{ expr }} = interpolation, { } = literal braces
        return $$"""
            You are a hardware design assistant specializing in embedded systems and electronics.

            RESPONSE FORMAT — always respond in EXACTLY this structure, with nothing outside it:

            THINKING:
            [1-3 sentences describing what you're doing or asking, in a natural conversational tone]

            JSON:
            [your complete JSON response]

            ───────────────────────────────────────
            WHEN TO ASK A CLARIFYING QUESTION:

            If the request is ambiguous on a detail that would SIGNIFICANTLY change the design
            (e.g. power source, indoor/outdoor, number of channels, connectivity requirements),
            ask ONE focused question. Return this JSON shape:

            {
              "needsClarification": true,
              "clarifyingQuestion": "The one question you need answered",
              "message": "Same question, phrased as a chat message",
              "microcontroller": {"name": "", "reason": ""},
              "diagram": {"nodes": [], "edges": []},
              "pins": [],
              "code": {"language": "", "filename": "", "content": ""},
              "bom": []
            }

            ───────────────────────────────────────
            WHEN TO RETURN A FULL DESIGN:

            Return "needsClarification": false and fill all fields completely.

            {
              "needsClarification": false,
              "clarifyingQuestion": null,
              "message": "Friendly summary of what you designed and why",
              "microcontroller": {
                "name": "e.g. Arduino Uno",
                "reason": "Why this board was chosen"
              },
              "diagram": {
                "nodes": [
                  {"id": "snake_case_id", "type": "microcontroller|sensor|actuator|power|display|module", "label": "Component Name"}
                ],
                "edges": [
                  {"id": "e1", "source": "node_id", "target": "node_id", "label": "Pin / bus label"}
                ]
              },
              "pins": [
                {"pin": "D4", "component": "Relay", "role": "Control signal", "direction": "INPUT|OUTPUT|I2C|SPI|UART|POWER|GROUND", "notes": "Active HIGH"}
              ],
              "code": {
                "language": "{{language}}",
                "filename": "project.ino",
                "content": "// Complete, compilable code — no placeholders"
              },
              "bom": [
                {"part": "Part name", "qty": 1, "price": 9.99, "description": "What it does"}
              ]
            }

            ───────────────────────────────────────
            LANGUAGE:
            Write ALL code in {{langName}}.
            The code.language field must be "{{language}}" and the filename extension must match.

            DESIGN GUIDELINES:
            - Choose the right microcontroller: Uno for simple I/O, ESP32 for WiFi/BT, Pico for more logic.
            - When the user says "add logic later", pick a board with room to grow (ESP32 or Pico).
            - Include ALL passive components: current-limiting resistors, pull-ups, bypass caps, etc.
            - Write complete working code — all #includes, setup(), loop(), no TODO placeholders.
            - For follow-up messages, the previous design JSON will be in the conversation history.
              Update the COMPLETE design every time — always return all fields, not just the changed ones.
            - Node IDs: lowercase with underscores, e.g. "rtc_module", "relay_board".
            """;
    }

    public async Task<(bool success, HardwareChatSdto? response, string? error)> ChatAsync(List<ChatMessageDto> messages, string language)
    {
        var apiKey = configuration["Anthropic:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return (false, null, "Anthropic API key not configured.");

        var client = httpClientFactory.CreateClient("Claude");

        var requestBody = new
        {
            model = "claude-sonnet-4-6",
            max_tokens = 4096,
            system = BuildSystemPrompt(language),
            messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToList()
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("x-api-key", apiKey);
        client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

        HttpResponseMessage httpResponse;
        try
        {
            httpResponse = await client.PostAsync("https://api.anthropic.com/v1/messages", content);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to reach Claude API");
            return (false, null, "Failed to reach Claude API.");
        }

        var responseBody = await httpResponse.Content.ReadAsStringAsync();

        if (!httpResponse.IsSuccessStatusCode)
        {
            logger.LogError("Claude API error {Status}: {Body}", httpResponse.StatusCode, responseBody);
            return (false, null, $"Claude API error: {httpResponse.StatusCode}");
        }

        string rawText;
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            rawText = doc.RootElement.GetProperty("content")[0].GetProperty("text").GetString() ?? "";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to parse Claude API response");
            return (false, null, "Failed to parse Claude API response.");
        }

        return ParseResponse(rawText);
    }

    public async Task StreamChatAsync(List<ChatMessageDto> messages, string language, Stream outputStream, CancellationToken ct)
    {
        var apiKey = configuration["Anthropic:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            await WriteChunk(outputStream, null, "Anthropic API key not configured.", ct);
            await WriteDone(outputStream, ct);
            return;
        }

        var requestBody = new
        {
            model = "claude-sonnet-4-6",
            max_tokens = 4096,
            stream = true,
            system = BuildSystemPrompt(language),
            messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToList()
        };

        var client = httpClientFactory.CreateClient("Claude");
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("x-api-key", apiKey);
        client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages")
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        };

        HttpResponseMessage response;
        try
        {
            response = await client.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to reach Claude API");
            await WriteChunk(outputStream, null, "Failed to reach Claude API.", ct);
            await WriteDone(outputStream, ct);
            return;
        }

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Claude API error {Status}: {Body}", response.StatusCode, errorBody);
            await WriteChunk(outputStream, null, $"Claude API error: {response.StatusCode}", ct);
            await WriteDone(outputStream, ct);
            return;
        }

        var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream && !ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);
            if (line == null || !line.StartsWith("data: ")) continue;

            var data = line[6..];
            if (data == "[DONE]") break;

            try
            {
                using var doc = JsonDocument.Parse(data);
                var type = doc.RootElement.GetProperty("type").GetString();

                if (type == "content_block_delta")
                {
                    var delta = doc.RootElement.GetProperty("delta");
                    if (delta.GetProperty("type").GetString() == "text_delta")
                    {
                        var text = delta.GetProperty("text").GetString() ?? "";
                        await WriteChunk(outputStream, text, null, ct);
                    }
                }
                else if (type == "message_stop")
                {
                    break;
                }
            }
            catch (JsonException) { }
        }

        await WriteDone(outputStream, ct);
    }

    private static async Task WriteChunk(Stream stream, string? text, string? error, CancellationToken ct)
    {
        var payload = error != null
            ? JsonSerializer.Serialize(new { error })
            : JsonSerializer.Serialize(new { text });

        var bytes = Encoding.UTF8.GetBytes($"data: {payload}\n\n");
        await stream.WriteAsync(bytes, ct);
        await stream.FlushAsync(ct);
    }

    private static async Task WriteDone(Stream stream, CancellationToken ct)
    {
        var bytes = Encoding.UTF8.GetBytes("data: [DONE]\n\n");
        await stream.WriteAsync(bytes, ct);
        await stream.FlushAsync(ct);
    }

    private (bool success, HardwareChatSdto? response, string? error) ParseResponse(string rawText)
    {
        rawText = rawText.Trim();

        // Extract JSON section from THINKING:/JSON: format
        var jsonIdx = rawText.IndexOf("\nJSON:\n");
        if (jsonIdx >= 0)
            rawText = rawText[(jsonIdx + 7)..].Trim();

        // Strip markdown code fences
        if (rawText.StartsWith("```"))
        {
            var firstNewline = rawText.IndexOf('\n');
            var lastFence = rawText.LastIndexOf("```");
            if (firstNewline >= 0 && lastFence > firstNewline)
                rawText = rawText[(firstNewline + 1)..lastFence].Trim();
        }

        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var result = JsonSerializer.Deserialize<HardwareChatSdto>(rawText, options);
            return result == null
                ? (false, null, "Empty response from Claude.")
                : (true, result, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to deserialize Claude response: {Raw}", rawText);
            return (false, null, "Claude returned invalid JSON.");
        }
    }
}
