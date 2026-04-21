import type { HardwareChatPayload, HardwareDesign } from '../types/hardware'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5157'

function parseFullResponse(rawText: string): HardwareDesign | null {
  let json = rawText.trim()

  // Extract JSON section from THINKING:/JSON: format
  const jsonIdx = json.indexOf('\nJSON:\n')
  if (jsonIdx >= 0) json = json.slice(jsonIdx + 7).trim()

  // Strip markdown code fences
  if (json.startsWith('```')) {
    const firstNewline = json.indexOf('\n')
    const lastFence = json.lastIndexOf('```')
    if (firstNewline >= 0 && lastFence > firstNewline) json = json.slice(firstNewline + 1, lastFence).trim()
  }

  try {
    return JSON.parse(json) as HardwareDesign
  } catch {
    return null
  }
}

/**
 * Stream a hardware chat request. Calls `onThinking` with the accumulated
 * THINKING section as it arrives so the UI can show it typing in real-time.
 * Resolves with the parsed HardwareDesign once the stream is complete.
 */
export async function streamHardwareChat(
  payload: HardwareChatPayload,
  onThinking: (text: string) => void
): Promise<HardwareDesign | null> {
  let response: Response
  try {
    response = await fetch(`${API_URL}/api/hardware/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
  } catch {
    return null
  }

  if (!response.ok || !response.body) return null

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Process complete SSE lines
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? '' // keep the incomplete last line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') break

      try {
        const parsed = JSON.parse(data) as { text?: string; error?: string }
        if (parsed.error) return null
        if (parsed.text) {
          fullText += parsed.text

          // Stream only the THINKING section (before JSON:)
          const jsonSep = fullText.indexOf('\nJSON:')
          const thinkingRaw = jsonSep === -1 ? fullText : fullText.slice(0, jsonSep)
          const thinking = thinkingRaw.replace(/^THINKING:\n?/, '')
          if (thinking) onThinking(thinking)
        }
      } catch {
        // skip malformed events
      }
    }
  }

  return parseFullResponse(fullText)
}
