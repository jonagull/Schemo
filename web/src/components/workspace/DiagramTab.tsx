'use client'

import { ReactFlow, Background, Controls, type Node, type Edge, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { DiagramData } from '@shared'

const nodeTypeColors: Record<string, string> = {
  microcontroller: '#1d4ed8',
  sensor: '#15803d',
  actuator: '#b45309',
  power: '#991b1b',
  display: '#6d28d9',
  module: '#374151',
}

function buildNodes(data: DiagramData): Node[] {
  const others = data.nodes.filter(n => n.type !== 'microcontroller')
  const total = others.length

  return data.nodes.map(n => {
    let x = 0
    let y = 0

    if (n.type === 'microcontroller') {
      x = 80
      y = Math.max(0, total - 1) * 60
    } else {
      const idx = others.indexOf(n)
      x = 400
      y = idx * 120
    }

    const color = nodeTypeColors[n.type] ?? '#374151'

    return {
      id: n.id,
      position: { x, y },
      data: { label: n.label },
      style: {
        background: color,
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: n.type === 'microcontroller' ? 700 : 400,
        minWidth: 140,
      },
    }
  })
}

function buildEdges(data: DiagramData): Edge[] {
  return data.edges.map(e => ({
    id: e.id || `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1.5 },
    labelStyle: { fill: 'rgba(255,255,255,0.6)', fontSize: 11 },
    labelBgStyle: { fill: '#111', fillOpacity: 0.8 },
  }))
}

interface DiagramTabProps {
  diagram: DiagramData | null
}

export function DiagramTab({ diagram }: DiagramTabProps) {
  if (!diagram || diagram.nodes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-white/30 text-sm">
        Circuit diagram will appear here once you describe your project.
      </div>
    )
  }

  const nodes = buildNodes(diagram)
  const edges = buildEdges(diagram)

  return (
    <div className="flex-1" style={{ background: '#000' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.08)" gap={20} size={1} />
        <Controls
          style={{
            background: '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  )
}
