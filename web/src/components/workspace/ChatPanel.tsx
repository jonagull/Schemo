'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChatMessage, BomItem } from '@shared'

interface ChatPanelProps {
  messages: ChatMessage[]
  bom: BomItem[]
  isLoading: boolean
  streamingText: string
  initialInput?: string
  onSend: (message: string) => void
}

const STARTER_PROMPTS = [
  {
    title: 'Timed lamp',
    prompt: 'I want a lamp that turns on at a set time each day. Use a microcontroller so I can add more logic later.',
  },
  {
    title: 'Motion alarm',
    prompt:
      'Build me a motion-triggered alarm with a buzzer and LED indicator. I want to be able to adjust the sensitivity.',
  },
  {
    title: 'Temperature logger',
    prompt:
      'I want to log temperature and humidity to an SD card every 10 minutes and display the current reading on a small screen.',
  },
  {
    title: 'Plant watering',
    prompt: 'Automatic plant watering system that checks soil moisture and activates a pump when dry. Battery powered.',
  },
]

function BomCard({ items }: { items: BomItem[] }) {
  const [open, setOpen] = useState(false)
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <div className="mt-3 border border-white/10 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <span className="text-white/70 font-medium">Parts list</span>
        <span className="text-white/50">
          ${total.toFixed(2)} &nbsp;{open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="divide-y divide-white/5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-white/80">{item.part}</p>
                <p className="text-white/35 text-[10px] mt-0.5">{item.description}</p>
              </div>
              <div className="flex items-center gap-3 text-white/50 shrink-0 ml-3">
                <span>×{item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChatPanel({ messages, bom, isLoading, streamingText, initialInput, onSend }: ChatPanelProps) {
  const [input, setInput] = useState(initialInput ?? '')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isLoading])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const showStreaming = isLoading && streamingText.length > 0
  const showDots = isLoading && streamingText.length === 0

  return (
    <div className="flex flex-col w-[380px] shrink-0 border-r border-white/10 bg-black min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="text-sm font-semibold text-white">Hardware Designer</h2>
        <p className="text-xs text-white/40 mt-0.5">Describe what you want to build</p>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="py-4 space-y-3">
            <p className="text-white/25 text-xs text-center">Try one of these to get started</p>
            <div className="space-y-2">
              {STARTER_PROMPTS.map(s => (
                <button
                  key={s.title}
                  onClick={() => onSend(s.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/20 transition-all group"
                >
                  <p className="text-white/75 text-xs font-medium group-hover:text-white transition-colors">
                    {s.title}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5 leading-relaxed line-clamp-2">{s.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          const isLastAssistant = !isUser && i === messages.length - 1

          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  isUser ? 'bg-white text-black' : 'bg-white/8 text-white/90 border border-white/10'
                }`}
              >
                {msg.content}
                {isLastAssistant && bom.length > 0 && !isLoading && <BomCard items={bom} />}
              </div>
            </div>
          )
        })}

        {/* Streaming text — shows Claude typing in real time */}
        {showStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed bg-white/8 text-white/80 border border-white/10">
              {streamingText}
              <span className="inline-block w-0.5 h-3.5 bg-white/50 ml-0.5 align-middle animate-pulse" />
            </div>
          </div>
        )}

        {/* Dots — only shows before any text arrives */}
        {showDots && (
          <div className="flex justify-start">
            <div className="bg-white/8 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Claude is thinking…' : 'Describe your hardware project…'}
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 disabled:opacity-40 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-white/20 mt-1.5 px-1">Enter to send · Shift+Enter for newline</p>
      </form>
    </div>
  )
}
