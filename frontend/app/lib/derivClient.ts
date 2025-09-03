import { useDerivStore } from '@/state/derivStore'
let nextId = 1; function rid(){ return (nextId++).toString() }
export function sendWithId(payload: any){ const id = rid(); useDerivStore.getState().send({ req_id: Number(id), ...payload }); return id }
export function forgetAll(type: string){ useDerivStore.getState().send({ forget_all: type }) }
export async function validateContractParams(symbol: string, contract_type: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req_id = sendWithId({ contracts_for: symbol, product_type: 'basic' })
    const ws = useDerivStore.getState().connection; if (!ws) return resolve(false)
    const handler = (ev: MessageEvent) => { try { const data = JSON.parse((ev as any).data); if (data.msg_type === 'contracts_for' && String(data.req_id) === String(req_id)) { const available = (data.contracts_for?.available || []).some((c: any) => c.contract_type === contract_type); (ws as any).removeEventListener('message', handler as any); resolve(!!available) } } catch {} }
    ;(ws as any).addEventListener('message', handler as any)
  })
}
