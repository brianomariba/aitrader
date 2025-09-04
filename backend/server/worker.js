const fs = require('fs')
const WebSocket = require('ws')
const express = require('express')
const path = require('path')

function sleep(ms){ return new Promise(r => setTimeout(r, ms)) }

// Create Express server for port binding
const app = express()
const PORT = process.env.PORT || 5000

// Serve static files from .next directory if it exists
const nextPath = path.join(__dirname, '..', '.next')
if (fs.existsSync(nextPath)) {
  app.use(express.static(nextPath))
}

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Catch all handler for Next.js
app.get('*', (req, res) => {
  const indexPath = path.join(nextPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.json({ message: 'AI Trader Backend Running', port: PORT })
  }
})

async function main(){
  try {
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 AI Trader Backend running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
    })

    // Check if config file exists
    const configPath = path.join(__dirname, 'program.json')
    if (!fs.existsSync(configPath)) {
      console.log('⚠️  Config file not found, running in server-only mode')
      return
    }

    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'))

    if (!cfg.app_id || !cfg.token) {
      console.log('⚠️  Missing app_id or token in config, running in server-only mode')
      return
    }

    console.log('🔌 Connecting to Deriv WebSocket...')
    const url = `wss://ws.derivws.com/websockets/v3?app_id=${cfg.app_id}`
    const ws = new WebSocket(url)

    await new Promise(res => ws.on('open', res))
    console.log('✅ WebSocket connected to Deriv')

    const send = (obj) => ws.send(JSON.stringify(obj))
    send({ authorize: cfg.token })

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg.msg_type === 'authorize') {
          console.log('✅ Authorized as', msg.authorize.loginid)
        }
        if (msg.msg_type === 'buy') {
          console.log('💰 Bought contract', msg.buy.contract_id)
        }
        if (msg.msg_type === 'proposal_open_contract' && msg.proposal_open_contract.is_sold) {
          console.log('🔒 Closed contract', msg.proposal_open_contract.contract_id, 'Profit:', msg.proposal_open_contract.profit)
        }
      } catch (e) {
        console.error('❌ Error parsing message:', e.message)
      }
    })

    // Only subscribe to ticks and start trading if we have valid config
    if (cfg.symbol) {
      send({ ticks: cfg.symbol, subscribe: 1 })
      console.log(`📈 Subscribed to ${cfg.symbol} ticks`)

      if (cfg.trades && cfg.trades > 0) {
        console.log(`🎯 Starting automated trading for ${cfg.trades} trades...`)

        for (let i = 0; i < cfg.trades; i++) {
          send({
            proposal: 1,
            symbol: cfg.symbol,
            amount: cfg.amount || 1,
            basis: cfg.basis || 'stake',
            contract_type: cfg.direction || 'CALL',
            currency: 'USD',
            duration: cfg.duration || 3,
            duration_unit: cfg.unit || 'm'
          })

          ws.on('message', (raw) => {
            const msg = JSON.parse(raw.toString())
            if (msg.msg_type === 'proposal' && msg.proposal && !msg._bot_bought) {
              msg._bot_bought = true
              send({ buy: msg.proposal.id, price: msg.proposal.ask_price })
              ws.send(JSON.stringify({
                proposal_open_contract: 1,
                contract_id: msg.proposal.id,
                subscribe: 1
              }))
            }
          })

          await sleep((cfg.cooldown_sec || 30) * 1000)
        }
      }
    }

  } catch (error) {
    console.error('❌ Main process error:', error.message)
    // Don't exit the process, keep the HTTP server running
  }
}

main()
