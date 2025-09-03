const fs = require('fs')
const WebSocket = require('ws')
function sleep(ms){ return new Promise(r => setTimeout(r, ms)) }
async function main(){
  const cfg = JSON.parse(fs.readFileSync(__dirname + '/program.json','utf8'))
  const url = `wss://ws.derivws.com/websockets/v3?app_id=${cfg.app_id}`
  const ws = new WebSocket(url)
  await new Promise(res => ws.on('open', res)); console.log('WS connected')
  const send = (obj) => ws.send(JSON.stringify(obj))
  send({ authorize: cfg.token })
  ws.on('message', (raw) => {
    try { const msg = JSON.parse(raw.toString())
      if (msg.msg_type === 'authorize') console.log('Authorized', msg.authorize.loginid)
      if (msg.msg_type === 'buy') console.log('Bought', msg.buy.contract_id)
      if (msg.msg_type === 'proposal_open_contract' && msg.proposal_open_contract.is_sold) console.log('Closed', msg.proposal_open_contract.contract_id, 'Profit:', msg.proposal_open_contract.profit)
    } catch {}
  })
  send({ ticks: cfg.symbol, subscribe: 1 })
  for (let i=0; i<cfg.trades; i++){
    send({ proposal: 1, symbol: cfg.symbol, amount: cfg.amount, basis: cfg.basis, contract_type: cfg.direction, currency: 'USD', duration: cfg.duration, duration_unit: cfg.unit })
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString())
      if (msg.msg_type === 'proposal' && msg.proposal && !msg._bot_bought) {
        msg._bot_bought = true; send({ buy: msg.proposal.id, price: msg.proposal.ask_price })
        ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: msg.proposal.id, subscribe: 1 }))
      }
    })
    await sleep((cfg.cooldown_sec || 30) * 1000)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
