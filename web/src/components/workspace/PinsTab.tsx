import type { PinInfo } from '@shared'

const directionColors: Record<string, string> = {
  OUTPUT: 'text-blue-400',
  INPUT: 'text-green-400',
  I2C: 'text-purple-400',
  SPI: 'text-yellow-400',
  UART: 'text-orange-400',
  POWER: 'text-red-400',
  GROUND: 'text-gray-400',
}

interface PinsTabProps {
  pins: PinInfo[]
}

export function PinsTab({ pins }: PinsTabProps) {
  if (pins.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-white/30 text-sm">
        Pin assignments will appear here once you describe your project.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-white/50 text-left">
            <th className="pb-2 pr-4 font-medium">Pin</th>
            <th className="pb-2 pr-4 font-medium">Component</th>
            <th className="pb-2 pr-4 font-medium">Role</th>
            <th className="pb-2 pr-4 font-medium">Direction</th>
            <th className="pb-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {pins.map((pin, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-2 pr-4 font-mono text-white font-semibold">{pin.pin}</td>
              <td className="py-2 pr-4 text-white/80">{pin.component}</td>
              <td className="py-2 pr-4 text-white/70">{pin.role}</td>
              <td
                className={`py-2 pr-4 font-mono text-xs font-semibold ${directionColors[pin.direction] ?? 'text-white/60'}`}
              >
                {pin.direction}
              </td>
              <td className="py-2 text-white/50 text-xs">{pin.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
