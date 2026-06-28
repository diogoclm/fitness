import { useEffect, useRef, useState } from 'react'

// Toca um beep curto via WebAudio (não precisa de arquivo de áudio).
function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
    osc.onended = () => void ctx.close()
  } catch {
    // áudio bloqueado pelo navegador — ignora silenciosamente
  }
}

const DEFAULT_SEG = 60

export default function RestTimer({ onClose }: { onClose: () => void }) {
  const [restante, setRestante] = useState(DEFAULT_SEG)
  const [rodando, setRodando] = useState(true)
  const dispararRef = useRef(false)

  useEffect(() => {
    if (!rodando) return
    const id = setInterval(() => {
      setRestante((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [rodando])

  useEffect(() => {
    if (restante === 0 && !dispararRef.current) {
      dispararRef.current = true
      setRodando(false)
      beep()
      navigator.vibrate?.([200, 100, 200])
    }
  }, [restante])

  function ajustar(delta: number) {
    dispararRef.current = false
    setRestante((s) => Math.max(0, s + delta))
    if (delta > 0) setRodando(true)
  }

  const fim = restante === 0

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-8 bg-bg/95 px-6 backdrop-blur">
      <p className="text-sm uppercase tracking-widest text-muted">Intervalo</p>

      <div
        className={`text-7xl font-extrabold tabular-nums ${
          fim ? 'text-accent' : 'text-white'
        }`}
      >
        {String(Math.floor(restante / 60)).padStart(2, '0')}:
        {String(restante % 60).padStart(2, '0')}
      </div>

      {fim && <p className="text-accent">Descanso concluído! 💪</p>}

      <div className="flex items-center gap-4">
        <button
          onClick={() => ajustar(-15)}
          className="min-h-14 min-w-20 rounded-xl bg-card text-lg font-bold ring-1 ring-white/10 active:scale-95"
        >
          −15s
        </button>
        <button
          onClick={() => setRodando((r) => !r)}
          className="min-h-14 min-w-24 rounded-xl bg-cardalt text-lg font-bold ring-1 ring-white/10 active:scale-95"
        >
          {rodando ? 'Pausar' : 'Retomar'}
        </button>
        <button
          onClick={() => ajustar(15)}
          className="min-h-14 min-w-20 rounded-xl bg-card text-lg font-bold ring-1 ring-white/10 active:scale-95"
        >
          +15s
        </button>
      </div>

      <button
        onClick={onClose}
        className="min-h-14 w-full max-w-xs rounded-xl bg-accent text-lg font-bold text-bg active:scale-[0.99]"
      >
        Fechar
      </button>
    </div>
  )
}
