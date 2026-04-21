'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
type Category = 'Fundamentals' | 'Microcontrollers' | 'Sensors' | 'Actuators' | 'Communication' | 'Power'

interface Concept {
  icon: string
  title: string
  description: string
  detail: string
  difficulty: Difficulty
  category: Category
  tryPrompt: string
}

interface Template {
  icon: string
  title: string
  description: string
  difficulty: Difficulty
  components: string[]
  prompt: string
}

const CONCEPTS: Concept[] = [
  // Fundamentals
  {
    icon: '⚡',
    title: "Ohm's Law",
    description: 'The relationship between voltage, current, and resistance. Every circuit starts here.',
    detail:
      'V = IR. Voltage (V) equals current (I) times resistance (R). This single equation explains how much current flows through any component and how voltage drops across resistors.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    tryPrompt:
      'I want to build a simple LED circuit with a current limiting resistor. Explain the resistor value choice.',
  },
  {
    icon: '🔌',
    title: 'Resistors',
    description: 'Limit current, divide voltage, and pull signals high or low.',
    detail:
      "Resistors are passive components that oppose current flow. They're used for current limiting (protecting LEDs), voltage dividers (reading sensors), and pull-up/pull-down configurations.",
    difficulty: 'Beginner',
    category: 'Fundamentals',
    tryPrompt:
      'Design a circuit with a push button, pull-down resistor, and LED that lights when the button is pressed.',
  },
  {
    icon: '🫙',
    title: 'Capacitors',
    description: 'Store and release charge. Essential for filtering power supply noise.',
    detail:
      'Capacitors block DC and pass AC. A 100nF ceramic capacitor across every IC power pin suppresses high-frequency switching noise. Electrolytic capacitors bulk-store energy for sudden load spikes.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    tryPrompt: 'Build a simple RC delay circuit that turns on an LED a few seconds after power is applied.',
  },
  {
    icon: '💡',
    title: 'LEDs',
    description: 'Your first output device. Always needs a current-limiting resistor.',
    detail:
      'LEDs have a forward voltage drop (~2V for red, ~3.3V for blue/white). Calculate the resistor: R = (Vsupply - Vf) / If. A typical forward current is 10–20mA.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    tryPrompt:
      'I want to control 3 LEDs with different colors using a microcontroller, each with proper current limiting.',
  },
  {
    icon: '📐',
    title: 'Voltage Dividers',
    description: 'Two resistors that scale down a voltage — how most analog sensors work.',
    detail:
      'Vout = Vin × R2 / (R1 + R2). Thermistors, photoresistors, and flex sensors all change resistance. A fixed resistor in series creates a voltage divider you can read with an analog pin.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    tryPrompt: 'Design a light sensor circuit using a photoresistor and voltage divider, read by an Arduino.',
  },
  // Microcontrollers
  {
    icon: '🟦',
    title: 'Arduino Uno',
    description: 'The classic beginner board. 14 digital I/O pins, 6 analog inputs, 5V logic.',
    detail:
      'ATmega328P running at 16MHz. 32KB flash, 2KB SRAM. Perfect for learning — huge community, simple IDE, 5V logic tolerant. Not suitable for battery projects (high idle current ~50mA).',
    difficulty: 'Beginner',
    category: 'Microcontrollers',
    tryPrompt:
      'I want to build something with an Arduino Uno — a simple temperature alarm that beeps when it gets too hot.',
  },
  {
    icon: '📡',
    title: 'ESP32',
    description: 'WiFi + Bluetooth built in. Dual-core 240MHz. The go-to for IoT projects.',
    detail:
      'The ESP32 has WiFi 802.11 b/g/n and BLE 4.2. 34 GPIO pins, two I2C buses, three SPI buses, built-in hall sensor. 3.3V logic. Deep sleep draws only 10µA — ideal for battery-powered IoT.',
    difficulty: 'Intermediate',
    category: 'Microcontrollers',
    tryPrompt: 'I want an ESP32-based temperature sensor that posts readings to a web dashboard every 5 minutes.',
  },
  {
    icon: '🟢',
    title: 'Raspberry Pi Pico',
    description: 'Dual-core ARM Cortex-M0+ at 133MHz. Programmable in MicroPython or C.',
    detail:
      'RP2040 chip with 264KB SRAM and 2MB flash. 26 multi-function GPIO, 3 ADCs, 2 SPI, 2 I2C, 2 UART. The PIO state machines allow custom serial protocols. $4 per board.',
    difficulty: 'Intermediate',
    category: 'Microcontrollers',
    tryPrompt:
      'Build a Raspberry Pi Pico project that reads a sensor over I2C and displays values on an OLED screen using MicroPython.',
  },
  {
    icon: '🔷',
    title: 'ATtiny85',
    description: '8-pin MCU for when you need a microcontroller that fits anywhere.',
    detail:
      '8KB flash, 512 bytes SRAM. 5 I/O pins, one 8-bit ADC. Programs via Arduino IDE with the right board package. Ideal for final production when you know exactly what your sketch does.',
    difficulty: 'Advanced',
    category: 'Microcontrollers',
    tryPrompt:
      'Design a minimal ATtiny85 circuit that fades an LED using PWM — fit everything in the smallest possible footprint.',
  },
  // Sensors
  {
    icon: '🌡️',
    title: 'DHT22',
    description: 'Reads temperature (–40 to 80°C) and humidity (0–100%) over a single data wire.',
    detail:
      'Single-wire protocol, 2-second sampling interval. Needs a 10K pull-up resistor on the data line. More accurate than the DHT11. Add a 100nF decoupling cap between VCC and GND.',
    difficulty: 'Beginner',
    category: 'Sensors',
    tryPrompt: 'I want to read temperature and humidity with a DHT22 and display the values on a small OLED screen.',
  },
  {
    icon: '👁️',
    title: 'PIR Motion Sensor',
    description: 'Detects infrared heat from moving bodies. Digital HIGH output on motion.',
    detail:
      'HC-SR501 has adjustable sensitivity and delay time. Logic HIGH for 3–300 seconds when triggered. Supply 5–12V, outputs 3.3V. Add a 10K series resistor before a 3.3V MCU input pin.',
    difficulty: 'Beginner',
    category: 'Sensors',
    tryPrompt: 'Build a motion-activated alarm with a PIR sensor, buzzer, and LED indicator using Arduino.',
  },
  {
    icon: '📏',
    title: 'HC-SR04 Ultrasonic',
    description: 'Measures distance 2cm–400cm by timing the echo of a 40kHz pulse.',
    detail:
      'Trigger pin: 10µs HIGH pulse. Echo pin goes HIGH for the duration sound takes to return. Distance = (echo duration × 343m/s) / 2. 5V powered but output needs a voltage divider for 3.3V MCUs.',
    difficulty: 'Beginner',
    category: 'Sensors',
    tryPrompt:
      'I want a parking assistant that beeps faster as an object gets closer, using an HC-SR04 ultrasonic sensor.',
  },
  {
    icon: '🌱',
    title: 'Soil Moisture Sensor',
    description: 'Resistive or capacitive probe that reads how wet soil is via analog voltage.',
    detail:
      'Capacitive sensors are preferred (no corrosion). Outputs 0–3.3V or 0–5V analog. Dry soil = high voltage, wet soil = low voltage. Calibrate by reading dry and saturated values, then map them.',
    difficulty: 'Beginner',
    category: 'Sensors',
    tryPrompt:
      'Automatic plant watering system with a soil moisture sensor that activates a water pump when the soil is dry.',
  },
  {
    icon: '🧭',
    title: 'MPU-6050 IMU',
    description: '6-axis accelerometer + gyroscope over I2C. Used in drones and gesture detection.',
    detail:
      'Combines a 3-axis accelerometer (±2g to ±16g) and 3-axis gyroscope (±250 to ±2000°/s) in one chip. The built-in DMP handles sensor fusion. Address 0x68 (AD0 low) or 0x69 (AD0 high).',
    difficulty: 'Intermediate',
    category: 'Sensors',
    tryPrompt:
      'I want to detect if a package is being tilted or dropped during shipping using an MPU-6050 and trigger an alert.',
  },
  // Actuators
  {
    icon: '⚙️',
    title: 'Servo Motor',
    description: 'Precisely control angle (0–180°) with PWM. No driver board needed.',
    detail:
      "50Hz PWM signal, pulse width 1ms (0°) to 2ms (180°). Most servos draw 200–500mA at load — don't power from a microcontroller's 5V pin. Use a separate 5V rail for anything over one servo.",
    difficulty: 'Beginner',
    category: 'Actuators',
    tryPrompt: 'I want to build an automatic door lock using a servo motor controlled by a keypad.',
  },
  {
    icon: '🔁',
    title: 'DC Motor + L298N',
    description: 'H-bridge driver for bidirectional control of up to two DC motors.',
    detail:
      'L298N handles up to 2A per channel, 46V max. Two digital pins control direction, one PWM pin controls speed. Loses 2V across the H-bridge — supply 7–12V for 5V motors. Add a heatsink.',
    difficulty: 'Intermediate',
    category: 'Actuators',
    tryPrompt:
      'Build a two-wheeled robot car with DC motors, L298N driver, and obstacle avoidance using an ultrasonic sensor.',
  },
  {
    icon: '🔀',
    title: 'Relay Module',
    description: "Switch mains voltage (AC or high DC) from a microcontroller's 3.3/5V pin.",
    detail:
      'A 5V relay module has an onboard transistor driver — control it with any GPIO pin. ALWAYS isolate the mains side. Use a snubber circuit (100Ω + 100nF) across the relay contacts to suppress arcing.',
    difficulty: 'Beginner',
    category: 'Actuators',
    tryPrompt: 'I want a timer-controlled relay that switches a mains lamp on at 18:00 and off at 23:00 every day.',
  },
  {
    icon: '🪜',
    title: 'Stepper Motor',
    description: 'Precise positional control in discrete steps — used in 3D printers and CNC.',
    detail:
      'A NEMA17 has 200 steps/rev (1.8°/step). Driver boards like A4988 or DRV8825 handle microstepping up to 1/32 steps. Always decelerate before stopping — cutting current while spinning can damage the driver.',
    difficulty: 'Intermediate',
    category: 'Actuators',
    tryPrompt: 'Design a motorised camera slider using a stepper motor and A4988 driver controlled by an Arduino.',
  },
  // Communication
  {
    icon: '🔗',
    title: 'I2C',
    description: 'Address up to 127 devices on just two wires: SDA (data) and SCL (clock).',
    detail:
      'Master-slave protocol at 100kHz (standard) or 400kHz (fast). Requires 4.7kΩ pull-ups on both lines to VCC. Long cables pick up noise — keep I2C runs under 30cm. Use logic analyser to debug.',
    difficulty: 'Intermediate',
    category: 'Communication',
    tryPrompt: 'I want to connect an OLED display and a temperature sensor to the same I2C bus on an Arduino.',
  },
  {
    icon: '⚡',
    title: 'SPI',
    description: 'Four-wire full-duplex bus. Faster than I2C, used for SD cards, displays, ADCs.',
    detail:
      'MOSI, MISO, SCK, and one SS pin per device. Can run at 10MHz+. No addressing — SS pin selects the device. Easier to implement than I2C but uses more GPIO. Great for displays and flash memory.',
    difficulty: 'Intermediate',
    category: 'Communication',
    tryPrompt: 'I want to log sensor data to a micro SD card over SPI using an Arduino.',
  },
  {
    icon: '📟',
    title: 'UART / Serial',
    description: 'The simplest two-wire protocol: TX and RX. Used for GPS, Bluetooth, debug output.',
    detail:
      'Asynchronous — no clock wire. Both devices agree on baud rate (9600, 115200, etc.). TX on one device connects to RX on the other. A USB-to-serial adapter lets you read output in a terminal.',
    difficulty: 'Beginner',
    category: 'Communication',
    tryPrompt: 'I want to parse NMEA sentences from a NEO-6M GPS module over UART and display coordinates on screen.',
  },
  // Power
  {
    icon: '🔋',
    title: 'LiPo + BMS',
    description: 'Lithium polymer cells need a BMS to prevent overcharge, overdischarge, and shorts.',
    detail:
      'A single LiPo cell is 3.7V nominal, 4.2V full, 3.0V cutoff. Never discharge below 3.0V. A BMS (Battery Management System) handles all of this. A TP4056 module handles USB charging + protection.',
    difficulty: 'Intermediate',
    category: 'Power',
    tryPrompt:
      'I want a battery-powered ESP32 sensor node with a LiPo battery, TP4056 charger, and deep sleep to last months.',
  },
  {
    icon: '⬇️',
    title: 'Buck Converter',
    description: 'Step down voltage with high efficiency (85–95%). Better than linear regulators.',
    detail:
      'A linear regulator (like 7805) wastes excess voltage as heat. A buck converter (like MT3608 or LM2596) switches at high frequency to step down efficiently. Always add output capacitors to reduce ripple.',
    difficulty: 'Intermediate',
    category: 'Power',
    tryPrompt:
      'I need to power an Arduino from a 12V lead-acid battery using a buck converter — design the power supply circuit.',
  },
]

const TEMPLATES: Template[] = [
  {
    icon: '🌿',
    title: 'Smart Plant Watering',
    description: 'Monitors soil moisture and automatically activates a water pump. Runs on battery with deep sleep.',
    difficulty: 'Beginner',
    components: ['Arduino Uno', 'Capacitive Soil Sensor', '5V Relay', 'Mini Water Pump', 'LiPo Battery'],
    prompt:
      'Build me an automatic plant watering system. Use a capacitive soil moisture sensor to trigger a small 5V water pump via a relay. It should run on battery so use deep sleep when idle. I want to add a display and scheduling later so choose a microcontroller with room to grow.',
  },
  {
    icon: '🌤️',
    title: 'WiFi Weather Station',
    description: 'Reads temp, humidity, and pressure. Publishes to a web dashboard every 5 minutes.',
    difficulty: 'Intermediate',
    components: ['ESP32', 'BME280 Sensor', 'OLED Display', 'LiPo Battery', 'TP4056 Charger'],
    prompt:
      'I want a WiFi weather station using an ESP32 that reads temperature, humidity, and barometric pressure from a BME280 sensor over I2C. Show current readings on a small OLED display and POST the data to a web endpoint every 5 minutes. Run on LiPo with deep sleep between readings to save battery.',
  },
  {
    icon: '🚨',
    title: 'Motion Security Alarm',
    description: 'PIR-triggered alarm with LED flash and buzzer. Sends an alert when triggered.',
    difficulty: 'Beginner',
    components: ['Arduino Uno', 'PIR Sensor', 'Passive Buzzer', 'Red LED', 'Push Button'],
    prompt:
      'Build a motion-triggered security alarm using a PIR sensor. When motion is detected, flash a red LED rapidly and sound a buzzer in an alarm pattern. A push button should arm and disarm the system. Add a 10-second countdown LED when arming so I have time to leave the room.',
  },
  {
    icon: '🌡️',
    title: 'Temperature Logger',
    description: 'Logs temp and humidity to SD card every 10 minutes with timestamps from an RTC.',
    difficulty: 'Intermediate',
    components: ['Arduino Uno', 'DHT22', 'DS3231 RTC', 'Micro SD Card', 'SSD1306 OLED'],
    prompt:
      'I want to log temperature and humidity data to a micro SD card every 10 minutes. Use a DHT22 sensor, a DS3231 RTC for accurate timestamps, and an SSD1306 OLED to show current readings. Write data as CSV to the SD card so I can open it in Excel.',
  },
  {
    icon: '🚗',
    title: 'Obstacle-Avoiding Robot',
    description: 'Two-wheeled robot that steers away from obstacles detected by an ultrasonic sensor.',
    difficulty: 'Intermediate',
    components: ['Arduino Uno', 'L298N Motor Driver', '2× DC Motors', 'HC-SR04', 'LiPo Battery'],
    prompt:
      'Build a two-wheeled obstacle-avoiding robot. Use an HC-SR04 ultrasonic sensor at the front to detect objects within 20cm. When an obstacle is detected, stop, reverse briefly, then turn right or left to avoid it. Use an L298N driver for two DC motors. Power from a LiPo battery.',
  },
  {
    icon: '🔒',
    title: 'Keypad Door Lock',
    description: '4×4 keypad-controlled servo lock with a green/red LED indicator.',
    difficulty: 'Beginner',
    components: ['Arduino Uno', '4×4 Matrix Keypad', 'Servo Motor', 'Green LED', 'Red LED'],
    prompt:
      'Design a keypad door lock with a 4x4 matrix keypad and a servo motor. When the correct 4-digit PIN is entered, turn the servo to unlock (90°) for 5 seconds then lock again. Show green LED for access granted, red LED for wrong PIN. After 3 wrong attempts, lock out for 30 seconds.',
  },
]

const CATEGORIES: Category[] = ['Fundamentals', 'Microcontrollers', 'Sensors', 'Actuators', 'Communication', 'Power']

const LEARNING_PATH = [
  {
    step: 1,
    label: "Ohm's Law & LEDs",
    category: 'Fundamentals',
    description: 'Understand voltage, current, and your first circuit',
  },
  {
    step: 2,
    label: 'Your First MCU',
    category: 'Microcontrollers',
    description: 'Blink an LED, read a button with Arduino Uno',
  },
  {
    step: 3,
    label: 'Read the World',
    category: 'Sensors',
    description: 'Wire up sensors and read analog + digital signals',
  },
  {
    step: 4,
    label: 'Control Things',
    category: 'Actuators',
    description: 'Drive motors, relays, and servos from your code',
  },
  {
    step: 5,
    label: 'Build a Project',
    category: 'Fundamentals',
    description: 'Combine everything into something that does a real job',
  },
]

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
  Intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Advanced: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AcademyPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')

  const filtered = CONCEPTS.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory
    return matchesSearch && matchesCategory
  })

  function tryInDesigner(prompt: string) {
    window.location.href = `/workspace?prompt=${encodeURIComponent(prompt)}`
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-black text-white">
      <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-16">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Academy</h1>
          <p className="text-white/50 text-base max-w-xl">
            Learn the building blocks of electronics. Each concept links directly to the designer so you can go from
            reading to building in one click.
          </p>
        </div>

        {/* Learning Path */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">
            Recommended path for beginners
          </h2>
          <div className="flex flex-col sm:flex-row gap-0">
            {LEARNING_PATH.map((step, i) => (
              <div key={step.step} className="flex sm:flex-col flex-1 items-start sm:items-stretch">
                <div className="flex sm:flex-col flex-1 items-start sm:items-stretch">
                  <div className="flex-1 p-4 border border-white/8 bg-white/3 hover:bg-white/6 transition-colors sm:rounded-none first:rounded-l-xl last:rounded-r-xl sm:first:rounded-tl-xl sm:first:rounded-bl-xl sm:last:rounded-tr-xl sm:last:rounded-br-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-white/25 font-mono">{step.step}</span>
                      <span className="text-xs font-semibold text-white">{step.label}</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {i < LEARNING_PATH.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center w-0 relative">
                    <span className="absolute text-white/15 text-xs z-10">›</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Project Templates */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Project Templates</h2>
            <p className="text-white/40 text-sm mt-1">
              Ready-made projects — click to open in the designer with everything pre-filled.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(t => (
              <div
                key={t.title}
                className="flex flex-col border border-white/8 rounded-xl p-4 bg-white/2 hover:bg-white/5 hover:border-white/15 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[t.difficulty]}`}
                      >
                        {t.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-xs leading-relaxed flex-1 mb-3">{t.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {t.components.map(c => (
                    <span key={c} className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => tryInDesigner(t.prompt)}
                  className="w-full py-2 text-xs font-medium rounded-lg border border-white/10 text-white/60 hover:bg-white hover:text-black hover:border-white transition-all"
                >
                  Build in Designer →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Concepts */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Concepts</h2>
            <p className="text-white/40 text-sm mt-1">The fundamentals behind every circuit.</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search concepts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
            />
            <div className="flex flex-wrap gap-1.5">
              {(['All', ...CATEGORIES] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activeCategory === cat
                      ? 'bg-white text-black font-medium'
                      : 'text-white/40 border border-white/10 hover:text-white hover:border-white/25'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 && (
            <p className="text-white/30 text-sm py-8 text-center">No concepts match your search.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div
                key={c.title}
                className="flex flex-col border border-white/8 rounded-xl p-4 bg-white/2 hover:bg-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[c.difficulty]}`}
                      >
                        {c.difficulty}
                      </span>
                      <span className="text-[10px] text-white/25">{c.category}</span>
                    </div>
                  </div>
                </div>
                <p className="text-white/55 text-xs leading-relaxed flex-1 mb-2">{c.description}</p>
                <p className="text-white/30 text-xs leading-relaxed mb-4">{c.detail}</p>
                <button
                  onClick={() => tryInDesigner(c.tryPrompt)}
                  className="w-full py-2 text-xs font-medium rounded-lg border border-white/10 text-white/50 hover:bg-white hover:text-black hover:border-white transition-all"
                >
                  Try in Designer →
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
