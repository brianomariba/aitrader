const fs = require('fs')
const WebSocket = require('ws')
const express = require('express')
const path = require('path')
const next = require('next')

function sleep(ms){ return new Promise(r => setTimeout(r, ms)) }

// Initialize Next.js
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev, dir: path.join(__dirname, '..', '..', 'frontend') })
const handle = nextApp.getRequestHandler()

// Create Express server
const app = express()
const PORT = process.env.PORT || 5000

async function main(){
  try {
    // Prepare Next.js
    console.log('🔄 Preparing Next.js...')
    await nextApp.prepare()

    console.log('✅ Next.js prepared successfully')

    // Serve Next.js static files
    app.use('/_next', express.static(path.join(__dirname, '..', '..', 'frontend', '.next')))

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        nextJs: 'ready',
        websocket: 'connecting'
      })
    })

    // Handle all other routes with Next.js
    app.all('*', (req, res) => {
      return handle(req, res)
    })

    // Start HTTP server
    app.listen(PORT, (err) => {
      if (err) throw err
      console.log(`🚀 AI Trader running on port ${PORT}`)
      console.log(`🌐 Frontend: http://localhost:${PORT}`)
      console.log(`📊 Health: http://localhost:${PORT}/health`)
    })

    // Start WebSocket trading worker
    await startWebSocketWorker()

  } catch (error) {
    console.error('❌ Server startup error:', error.message)
    process.exit(1)
  }
}

async function startWebSocketWorker() {
  try {
    // Check if config file exists
    const configPath = path.join(__dirname, 'program.json')
    if (!fs.existsSync(configPath)) {
      console.log('⚠️  No program.json found - WebSocket trading disabled')
      return
    }

    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'))

    if (!cfg.app_id || !cfg.token) {
      console.log('⚠️  Missing app_id or token - WebSocket trading disabled')
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
        console.error('❌ Error parsing WebSocket message:', e.message)
      }
    })

    // Start trading if configured
    if (cfg.symbol && cfg.trades && cfg.trades > 0) {
      send({ ticks: cfg.symbol, subscribe: 1 })
      console.log(`📈 Subscribed to ${cfg.symbol} ticks`)
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

  } catch (error) {
    console.error('❌ WebSocket worker error:', error.message)
  }
}

main()
