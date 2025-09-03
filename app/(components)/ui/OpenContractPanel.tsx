'use client'
import { useDerivStore } from '@/state/derivStore'
export function OpenContractPanel() {
  const { watchingContract, sellContract } = useDerivStore()
  if (!watchingContract) return <div className="text-sm opacity-70">No open contract yet.</div>
  const oc = watchingContract
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>Contract ID</div><div>{oc.contract_id}</div>
        <div>Status</div><div>{oc.status || (oc.is_sold ? 'sold' : 'open')}</div>
        <div>Entry</div><div>{oc.entry_spot ?? '—'}</div>
        <div>Current</div><div>{oc.current_spot ?? '—'}</div>
        <div>Buy Price</div><div>{oc.buy_price ?? '—'} {oc.currency || ''}</div>
        <div>Sell Price</div><div>{oc.sell_price ?? '—'} {oc.currency || ''}</div>
        <div>PnL</div><div>{oc.profit ?? '—'} {oc.currency || ''}</div>
      </div>
      <button className="mt-2 w-full rounded-xl bg-rose-600 px-3 py-2 text-white hover:bg-rose-700 disabled:opacity-50" onClick={() => sellContract(oc.contract_id)} disabled={!!oc.is_sold}>
        Sell (if available)
      </button>
    </div>
  )
}
