import type { CodeInfo } from '@shared'

interface CodeTabProps {
  code: CodeInfo | null
}

export function CodeTab({ code }: CodeTabProps) {
  if (!code) {
    return (
      <div className="flex flex-1 items-center justify-center text-white/30 text-sm">
        Generated firmware will appear here once you describe your project.
      </div>
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(code!.content)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
        <span className="text-xs text-white/50 font-mono">{code.filename}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/30"
        >
          Copy
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <pre className="p-4 text-sm font-mono text-green-300 leading-relaxed whitespace-pre-wrap">
          <code>{code.content}</code>
        </pre>
      </div>
    </div>
  )
}
