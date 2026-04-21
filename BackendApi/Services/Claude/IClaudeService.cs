using BackendApi.Models.Hardware;

namespace BackendApi.Services.Claude;

public interface IClaudeService
{
    Task<(bool success, HardwareChatSdto? response, string? error)> ChatAsync(List<ChatMessageDto> messages, string language);
    Task StreamChatAsync(List<ChatMessageDto> messages, string language, Stream outputStream, CancellationToken ct);
}
