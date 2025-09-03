import { create } from 'zustand'

type Tick = { tick: { symbol: string; epoch: number; quote: number } }
type ActiveSymbol = { symbol: string; display_name: string; market: string; submarket: string }

type Proposal = { proposal: { id: string; ask_price: number; display_value: string }, echo_req?: any }

type AccountInfo = {
  authorize: {
    account_list: Array<{ account_type: string; currency: string; loginid: string }>
    balance?: number; currency?: string; email?: string; fullname?: string;
    landing_company_name?: string; loginid?: string
  }
}

type OpenContract = {
  contract_id: number; buy_price?: number; current_spot?: number; entry_spot?: number;
  sell_price?: number; profit?: number; profit_percentage?: number; is_sold?: number;
  is_expired?: number; status?: string; currency?: string; symbol?: string;
  contract_type?: string; purchase_time?: number; expiry_time?: number; display_name?: string
}

type BotConfig = {
  enabled: boolean; symbol?: string; contract_type: 'CALL'|'PUT'; basis:'stake'|'payout';
  amount: number; currency: string; duration: number; duration_unit:'t'|'m'|'h'|'d';
  max_trades: number; cooldown_sec: number; take_profit?: number; stop_loss?: number
}

type DerivState = {
  appId: string; endpoint: string; oauthBase: string; redirectPath: string;
  connection?: WebSocket; connected: boolean; token: string;
  account?: AccountInfo['authorize'];   symbols: ActiveSymbol[]; selectedSymbol?: string;
  lastTicks: Array<{ t: number; v: number }>; proposal?: Proposal['proposal']; log: string[];
  watchingContract?: OpenContract; lastBuyContractId?: number;
  portfolio: OpenContract[]; profitTable: any[]; portfolioLoading: boolean;

  bot: BotConfig; botStats: { trades: number, wins: number, losses: number }; botTimer?: number;

  // Risk Management
  riskSettings: {
    dailyStopLoss: number; equityProtection: number; maxConsecutiveLosses: number;
    maxDailyTrades: number; panicStop: boolean; enabled: boolean
  };
  riskStats: {
    dailyPnL: number; consecutiveLosses: number; dailyTrades: number; lastResetDate: string
  };
  emergencyStop: () => void; updateRiskSettings: (settings: Partial<DerivState['riskSettings']>) => void;
  checkRiskLimits: () => boolean; resetDailyStats: () => void;

  setAppId: (id: string) => void; setToken: (t: string) => void; getOAuthUrl: () => string;
  connect: () => void; disconnect: () => void; send: (msg: unknown) => void; authorize: () => void;
  fetchActiveSymbols: () => void; subscribeTicks: (symbol: string) => void;
  requestProposal: (params: any) => void; buyFromProposal: (price: number) => void;
  watchOpenContract: (contract_id: number) => void; sellContract: (contract_id: number) => void;
  fetchPortfolio: () => void; fetchProfitTable: (limit?: number, offset?: number) => void;
  refreshPortfolio: () => void; exportProfitTable: () => void;
  clearLog: () => void; appendLog: (entry: string) => void;
  setBot: (patch: Partial<BotConfig>) => void; startBot: () => void; stopBot: () => void
}

export const useDerivStore = create<DerivState>((set, get) => ({
  appId: process.env.NEXT_PUBLIC_DERIV_APP_ID || '1089',
  endpoint: process.env.NEXT_PUBLIC_DERIV_API_URL || 'wss://ws.derivws.com/websockets/v3',
  oauthBase: process.env.NEXT_PUBLIC_DERIV_OAUTH_URL || 'https://oauth.deriv.com/oauth2/authorize',
  redirectPath: process.env.NEXT_PUBLIC_REDIRECT_PATH || '/oauth',

  connected: false, token: '', symbols: [], lastTicks: [], log: [],
  portfolio: [], profitTable: [], portfolioLoading: false,
  bot: { enabled:false, contract_type:'CALL', basis:'stake', amount:1, currency:'USD', duration:3, duration_unit:'m', max_trades:5, cooldown_sec:30 },
  botStats: { trades: 0, wins: 0, losses: 0 },

  riskSettings: {
    dailyStopLoss: 50, equityProtection: 80, maxConsecutiveLosses: 3,
    maxDailyTrades: 10, panicStop: false, enabled: true
  },
  riskStats: {
    dailyPnL: 0, consecutiveLosses: 0, dailyTrades: 0, lastResetDate: new Date().toDateString()
  },

  setAppId: (id) => set({ appId: id }), setToken: (t) => set({ token: t }),

  getOAuthUrl: () => {
    const { appId, oauthBase, redirectPath } = get()
    const redirect_uri = typeof window === 'undefined' ? '' : `${window.location.origin}${redirectPath}`
    const url = new URL(oauthBase); url.searchParams.set('app_id', appId); url.searchParams.set('scope','read,trade')
    if (redirect_uri) url.searchParams.set('redirect_uri', redirect_uri); return url.toString()
  },

  connect: () => {
    const { endpoint, appId } = get()
    if (get().connection?.readyState === WebSocket.OPEN) return
    let attempts = 0
    const make = () => {
      const ws = new WebSocket(`${endpoint}?app_id=${appId}`)
      ws.onopen = () => { attempts = 0; set({ connection: ws, connected: true }); get().appendLog('WS connected'); get().send({ ping: 1 }) }
      ws.onclose = () => { set({ connected: false, connection: undefined }); get().appendLog('WS disconnected'); const delay = Math.min(30000, 1000 * (2 ** Math.min(6, attempts++))); setTimeout(() => make(), delay) }
      ws.onerror = (e) => { get().appendLog('WS error: ' + JSON.stringify(e)) }
      ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data as any)
        if (data.msg_type === 'ping' || data.msg_type === 'pong') return
        if (data.error) get().appendLog('Error: ' + data.error.message)

        if (data.msg_type === 'authorize') { set({ account: data.authorize }); get().appendLog('Authorized as ' + data.authorize.loginid) }
        if (data.msg_type === 'active_symbols') set({ symbols: data.active_symbols })
        if (data.msg_type === 'tick') { const { epoch, quote } = data.tick; set((s) => ({ lastTicks: [...s.lastTicks.slice(-200), { t: epoch * 1000, v: quote }] })) }
        if (data.msg_type === 'proposal') { set({ proposal: data.proposal }); const flow = data.echo_req?.passthrough?.flow; if (flow === 'bot' && data.proposal?.id) { const ask = data.proposal.ask_price || 0; get().send({ buy: data.proposal.id, price: ask, passthrough: { flow: 'bot-buy' } }) } }
        if (data.msg_type === 'buy') { const id = data.buy.contract_id; set({ lastBuyContractId: id }); get().appendLog('Bought contract_id ' + id); get().watchOpenContract(id) }
        if (data.msg_type === 'portfolio') {
          const contracts = data.portfolio?.contracts || []
          set({ portfolio: contracts })
          get().appendLog('Portfolio received: ' + contracts.length + ' open contracts')
        }
        if (data.msg_type === 'profit_table') {
          const transactions = data.profit_table?.transactions || []
          set({ profitTable: transactions })
          get().appendLog('Profit table received: ' + transactions.length + ' transactions')
        }
        if (data.msg_type === 'proposal_open_contract') {
          const oc = data.proposal_open_contract
          set({ watchingContract: { contract_id: oc.contract_id, buy_price: oc.buy_price, entry_spot: oc.entry_spot, current_spot: oc.current_spot, sell_price: oc.sell_price, profit: oc.profit, is_sold: oc.is_sold, is_expired: oc.is_expired, status: oc.status, currency: oc.currency } })

          if (oc.is_sold) {
            const profit = oc.profit || 0
            set((s) => ({
              botStats: {
                trades: s.botStats.trades,
                wins: profit > 0 ? s.botStats.wins + 1 : s.botStats.wins,
                losses: profit <= 0 ? s.botStats.losses + 1 : s.botStats.losses
              },
              riskStats: {
                ...s.riskStats,
                dailyPnL: s.riskStats.dailyPnL + profit,
                consecutiveLosses: profit <= 0 ? s.riskStats.consecutiveLosses + 1 : 0,
                dailyTrades: s.riskStats.dailyTrades + 1
              }
            }))

            get().appendLog(`Trade closed - P&L: ${profit.toFixed(2)} | Daily P&L: ${(get().riskStats.dailyPnL + profit).toFixed(2)}`)
          }
        }
      }
    }
    make()
  },

  disconnect: () => { get().connection?.close(); set({ connection: undefined, connected: false }) },

  send: (msg) => { const ws = get().connection; if (!ws || ws.readyState !== WebSocket.OPEN) { get().appendLog('Cannot send, WS not open'); return } ws.send(JSON.stringify(msg)) },

  authorize: () => { const { token } = get(); if (!token) return get().appendLog('Missing token'); get().send({ authorize: token }) },

  fetchActiveSymbols: () => { get().send({ active_symbols: 'brief', product_type: 'basic' }) },

  subscribeTicks: (symbol) => { set({ selectedSymbol: symbol, lastTicks: [] }); get().send({ forget_all: 'ticks' }); get().send({ ticks: symbol, subscribe: 1 }) },

  requestProposal: (params) => { get().send({ proposal: 1, ...params }) },

  buyFromProposal: (price) => { const id = get().proposal?.id; if (!id) return get().appendLog('No proposal to buy from'); get().send({ buy: id, price }) },

  watchOpenContract: (contract_id) => { get().send({ forget_all: 'proposal_open_contract' }); get().send({ proposal_open_contract: 1, contract_id, subscribe: 1 }) },

  sellContract: (contract_id) => { get().send({ sell: contract_id, price: 0 }) },

  fetchPortfolio: () => {
    set({ portfolioLoading: true })
    get().send({ portfolio: 1 })
    setTimeout(() => set({ portfolioLoading: false }), 1000) // Fallback loading state
  },
  fetchProfitTable: (limit = 25, offset = 0) => {
    set({ portfolioLoading: true })
    get().send({ profit_table: 1, description: 1, limit, offset })
    setTimeout(() => set({ portfolioLoading: false }), 1000) // Fallback loading state
  },
  refreshPortfolio: () => {
    get().fetchPortfolio()
    get().fetchProfitTable()
  },
  exportProfitTable: () => {
    const { profitTable } = get()
    if (profitTable.length === 0) return get().appendLog('No profit table data to export')
    const csv = [
      ['Contract ID', 'Symbol', 'Contract Type', 'Buy Price', 'Sell Price', 'Profit', 'Purchase Time', 'Sell Time'],
      ...profitTable.map(t => [
        t.contract_id,
        t.symbol,
        t.contract_type,
        t.buy_price,
        t.sell_price,
        t.profit,
        new Date(t.purchase_time * 1000).toISOString(),
        t.sell_time ? new Date(t.sell_time * 1000).toISOString() : ''
      ])
    ].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profit-table-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    get().appendLog('Profit table exported as CSV')
  },

  clearLog: () => set({ log: [] }),
  appendLog: (entry: string) => set((s) => ({ log: [...s.log, `${new Date().toLocaleTimeString()}  ${entry}`] })),

  setBot: (patch) => set((s) => ({ bot: { ...s.bot, ...patch } })),
  startBot: () => {
    const st = get()

    // Check risk limits before starting
    if (!st.checkRiskLimits()) {
      st.appendLog('❌ Cannot start bot: Risk limits exceeded')
      return
    }

    if (!st.selectedSymbol && st.bot.symbol) st.subscribeTicks(st.bot.symbol!)
    set((s) => ({ bot: { ...s.bot, enabled: true }, botStats: { trades: 0, wins: 0, losses: 0 } }))
    st.appendLog('🤖 Bot started with risk management enabled')

    const timer = window.setInterval(() => {
      const state = get(); if (!state.bot.enabled) return

      // Check risk limits before each trade
      if (!state.checkRiskLimits()) {
        state.appendLog('❌ Bot stopped: Risk limits exceeded')
        return
      }

      const ticks = state.lastTicks.slice(-6); if (ticks.length < 6) return
      let up=0, down=0; for(let i=1;i<ticks.length;i++){ if(ticks[i].v>ticks[i-1].v) up++; if(ticks[i].v<ticks[i-1].v) down++; }
      const decision = up>=5? 'CALL': (down>=5? 'PUT': undefined); if (!decision) return
      const symbol = state.selectedSymbol || state.bot.symbol; if (!symbol) return
      state.requestProposal({ symbol, amount: state.bot.amount, basis: state.bot.basis, contract_type: decision, currency: state.bot.currency, duration: state.bot.duration, duration_unit: state.bot.duration_unit, passthrough: { flow: 'bot' } })
      set((s) => ({ botStats: { ...s.botStats, trades: s.botStats.trades + 1 } }))
      if (state.botStats.trades >= state.bot.max_trades) get().stopBot()
    }, Math.max(5, get().bot.cooldown_sec) * 1000)
    set({ botTimer: timer })
  },
  stopBot: () => { const t = get().botTimer; if (t) window.clearInterval(t); set((s) => ({ bot: { ...s.bot, enabled: false }, botTimer: undefined })) },

  emergencyStop: () => {
    const state = get()
    state.stopBot()
    set((s) => ({ riskSettings: { ...s.riskSettings, panicStop: true } }))
    state.appendLog('🚨 EMERGENCY STOP ACTIVATED - All trading halted')
  },

  updateRiskSettings: (settings) => {
    set((s) => ({ riskSettings: { ...s.riskSettings, ...settings } }))
    get().appendLog('Risk settings updated')
  },

  checkRiskLimits: () => {
    const { riskSettings, riskStats, account } = get()
    if (!riskSettings.enabled) return true

    const currentDate = new Date().toDateString()
    if (riskStats.lastResetDate !== currentDate) {
      get().resetDailyStats()
    }

    // Check daily stop loss
    if (Math.abs(riskStats.dailyPnL) >= riskSettings.dailyStopLoss) {
      get().appendLog(`⚠️ Daily stop loss triggered: ${riskStats.dailyPnL}`)
      get().stopBot()
      return false
    }

    // Check equity protection
    const balance = account?.balance || 0
    const equityThreshold = balance * (riskSettings.equityProtection / 100)
    if (balance <= equityThreshold) {
      get().appendLog(`⚠️ Equity protection triggered: Balance ${balance}`)
      get().stopBot()
      return false
    }

    // Check consecutive losses
    if (riskStats.consecutiveLosses >= riskSettings.maxConsecutiveLosses) {
      get().appendLog(`⚠️ Max consecutive losses reached: ${riskStats.consecutiveLosses}`)
      get().stopBot()
      return false
    }

    // Check daily trade limit
    if (riskStats.dailyTrades >= riskSettings.maxDailyTrades) {
      get().appendLog(`⚠️ Daily trade limit reached: ${riskStats.dailyTrades}`)
      get().stopBot()
      return false
    }

    return true
  },

  resetDailyStats: () => {
    const currentDate = new Date().toDateString()
    set((s) => ({
      riskStats: {
        dailyPnL: 0,
        consecutiveLosses: 0,
        dailyTrades: 0,
        lastResetDate: currentDate
      }
    }))
    get().appendLog(`Daily stats reset for ${currentDate}`)
  },
}))
