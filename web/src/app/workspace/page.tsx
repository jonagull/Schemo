'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatPanel } from '@/components/workspace/ChatPanel'
import { DiagramTab } from '@/components/workspace/DiagramTab'
import { CodeTab } from '@/components/workspace/CodeTab'
import { PinsTab } from '@/components/workspace/PinsTab'
import { streamHardwareChat, useAuthStore, LANGUAGES } from '@shared'
import type { ChatMessage, HardwareDesign, Language } from '@shared'

type Tab = 'diagram' | 'code' | 'pins'

export default function WorkspacePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Two message arrays: what Claude sees (full JSON) vs what the user sees (readable text)
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([])
  const [apiMessages, setApiMessages] = useState<ChatMessage[]>([])

  const [streamingText, setStreamingText] = useState<string>('')
  const [design, setDesign] = useState<HardwareDesign | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('diagram')
  const [language, setLanguage] = useState<Language>('arduino')

  async function handleSend(userMessage: string) {
    const userMsg: ChatMessage = { role: 'user', content: userMessage }
    const nextApiMessages = [...apiMessages, userMsg]

    setDisplayMessages(prev => [...prev, userMsg])
    setApiMessages(nextApiMessages)
    setIsLoading(true)
    setStreamingText('')

    try {
      const result = await streamHardwareChat({ messages: nextApiMessages, language }, text => setStreamingText(text))

      if (!result) {
        setDisplayMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
        return
      }

      // Store full JSON in API history so Claude has perfect context on next turn
      setApiMessages(prev => [...prev, { role: 'assistant', content: JSON.stringify(result) }])

      // Show human-readable message in chat
      const displayContent = result.needsClarification ? (result.clarifyingQuestion ?? result.message) : result.message
      setDisplayMessages(prev => [...prev, { role: 'assistant', content: displayContent }])

      // Only update design + switch tab if we got a real design back
      if (!result.needsClarification) {
        setDesign(result)
        setActiveTab('diagram')
      }
    } finally {
      setStreamingText('')
      setIsLoading(false)
    }
  }

  // Pre-fill from ?prompt= query param (e.g. from Academy "Try in Designer" links)
  const [initialInput] = useState(() => {
    if (typeof window === 'undefined') return ''
    return decodeURIComponent(new URLSearchParams(window.location.search).get('prompt') ?? '')
  })

  if (authLoading || !isAuthenticated) return null

  const tabMeta: { id: Tab; label: string; badge?: string }[] = [
    {
      id: 'diagram',
      label: 'Diagram',
      badge: design ? `${design.diagram.nodes.length} components` : undefined,
    },
    { id: 'code', label: 'Code', badge: design?.code?.filename },
    { id: 'pins', label: 'Pins', badge: design ? `${design.pins.length} pins` : undefined },
  ]

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden bg-black">
      <ChatPanel
        messages={displayMessages}
        bom={design?.bom ?? []}
        isLoading={isLoading}
        streamingText={streamingText}
        initialInput={initialInput}
        onSend={handleSend}
      />

      {/* Right panel */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-black shrink-0">
          {/* Language selector */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            className="text-xs bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white/60 hover:border-white/25 focus:outline-none focus:border-white/40 transition-colors mr-2 cursor-pointer"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value} className="bg-black text-white">
                {l.label}
              </option>
            ))}
          </select>

          {/* MCU badge */}
          {design?.microcontroller?.name && (
            <span className="text-xs text-white/20 font-mono border border-white/10 px-2 py-0.5 rounded-full mr-1">
              {design.microcontroller.name}
            </span>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 ml-auto">
            {tabMeta.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-black font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] font-mono ${activeTab === tab.id ? 'text-black/40' : 'text-white/25'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-black">
          {activeTab === 'diagram' && <DiagramTab diagram={design?.diagram ?? null} />}
          {activeTab === 'code' && <CodeTab code={design?.code ?? null} />}
          {activeTab === 'pins' && <PinsTab pins={design?.pins ?? []} />}
        </div>
      </div>
    </div>
  )
}
