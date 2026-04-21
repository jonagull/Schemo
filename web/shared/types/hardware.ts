export type Language = 'arduino' | 'micropython' | 'circuitpython' | 'platformio' | 'rust'

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'arduino', label: 'Arduino C++' },
  { value: 'micropython', label: 'MicroPython' },
  { value: 'circuitpython', label: 'CircuitPython' },
  { value: 'platformio', label: 'PlatformIO C++' },
  { value: 'rust', label: 'Rust Embedded' },
]

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface MicrocontrollerInfo {
  name: string
  reason: string
}

export interface DiagramNode {
  id: string
  type: string
  label: string
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label: string
}

export interface DiagramData {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export interface PinInfo {
  pin: string
  component: string
  role: string
  direction: string
  notes: string
}

export interface CodeInfo {
  language: string
  filename: string
  content: string
}

export interface BomItem {
  part: string
  qty: number
  price: number
  description: string
}

export interface HardwareDesign {
  needsClarification: boolean
  clarifyingQuestion: string | null
  message: string
  microcontroller: MicrocontrollerInfo
  diagram: DiagramData
  pins: PinInfo[]
  code: CodeInfo
  bom: BomItem[]
}

export interface HardwareChatPayload {
  messages: ChatMessage[]
  language: Language
}
