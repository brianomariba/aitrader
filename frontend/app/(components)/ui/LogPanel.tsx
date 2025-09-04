'use client'
import { useDerivStore } from '@/state/derivStore'
export function LogPanel() {
  const { log, clearLog } = useDerivStore()
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-medium opacity-80">Activity Log</h3>
        <button className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={clearLog}>Clear</button>
      </div>
      <div className="h-48 overflow-auto rounded-lg bg-black/30 p-2 text-xs">
        {log.length === 0 ? <div className="opacity-50">No activity yet…</div> : log.map((l, i) => <div key={i} className="whitespace-pre">{l}</div>)}
      </div>
    </div>
  )
}
