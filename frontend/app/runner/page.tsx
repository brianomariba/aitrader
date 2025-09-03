'use client'
import { useEffect } from 'react'
import { useDerivStore } from '@/state/derivStore'
import { RiskManagementPanel } from '../(components)/ui/RiskManagementPanel'

export default function RunnerPage() {
  const { bot, setBot, startBot, stopBot, symbols, fetchActiveSymbols, subscribeTicks, selectedSymbol, botStats } = useDerivStore()
  useEffect(() => { if (symbols.length === 0) fetchActiveSymbols() }, [symbols.length, fetchActiveSymbols])

  return (
    <main className="container space-y-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="mb-2 text-xl font-semibold">Bot Runner</h2>
            <p className="text-sm opacity-70">Configure and run your automated trading strategy with integrated risk management.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div><label className="text-sm opacity-80">Symbol</label><select className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2" value={selectedSymbol || bot.symbol || ''} onChange={(e)=>{ setBot({ symbol: e.target.value }); subscribeTicks(e.target.value) }}><option value="" disabled>Select a symbol</option>{symbols.map((s)=> <option key={s.symbol} value={s.symbol}>{s.display_name}</option>)}</select></div>
              <div><label className="text-sm opacity-80">Amount</label><input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2" type="number" min={0.35} value={bot.amount} onChange={(e)=>setBot({ amount: Number(e.target.value) })} /></div>
              <div><label className="text-sm opacity-80">Duration</label><input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2" type="number" min={1} value={bot.duration} onChange={(e)=>setBot({ duration: Number(e.target.value) })} /></div>
              <div><label className="text-sm opacity-80">Unit</label><select className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2" value={bot.duration_unit} onChange={(e)=>setBot({ duration_unit: e.target.value as any })}><option value="t">Ticks</option><option value="m">Minutes</option><option value="h">Hours</option><option value="d">Days</option></select></div>
              <div><label className="text-sm opacity-80">Max Trades</label><input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2" type="number" min={1} value={bot.max_trades} onChange={(e)=>setBot({ max_trades: Number(e.target.value) })} /></div>
              <div><label className="text-sm opacity-80">Cooldown (sec)</label><input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2" type="number" min={5} value={bot.cooldown_sec} onChange={(e)=>setBot({ cooldown_sec: Number(e.target.value) })} /></div>
            </div>
            <div className="mt-4 flex gap-2">
              {bot.enabled ? (
                <button className="rounded-xl bg-rose-600 px-3 py-2 hover:bg-rose-700" onClick={stopBot}>
                  Stop Bot
                </button>
              ) : (
                <button className="rounded-xl bg-emerald-600 px-3 py-2 hover:bg-emerald-700" onClick={startBot}>
                  Start Bot
                </button>
              )}
              <div className="text-sm opacity-70 self-center">
                Status: {bot.enabled ? '🟢 Running' : '🔴 Stopped'} •
                Trades: {botStats.trades} • Wins: {botStats.wins} • Losses: {botStats.losses}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <RiskManagementPanel />
          </div>
        </div>
      </div>
    </main>
  )
}
