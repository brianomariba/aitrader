'use client'
import { useState, useEffect } from 'react'
import {
  Play,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react'
import { BacktestingEngine, BacktestResult, BacktestConfig } from '@/lib/backtesting'

export function StrategyTestingPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<BacktestResult | null>(null)
  const [config, setConfig] = useState<BacktestConfig>({
    initialBalance: 1000,
    commission: 0.01,
    slippage: 0.0001,
    startDate: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
    endDate: Date.now(),
    symbol: 'R_100',
    timeframe: '1m'
  })

  const runBacktest = async () => {
    setIsRunning(true)
    try {
      // Create backtesting engine
      const engine = new BacktestingEngine(config)

      // Generate sample historical data (in production, this would come from API)
      const historicalData = generateSampleHistoricalData(
        config.symbol,
        Math.ceil((config.endDate - config.startDate) / (24 * 60 * 60 * 1000))
      )

      engine.loadHistoricalData(historicalData)

      // Simple momentum strategy for demonstration
      const signals = engine.generateSignals((data, index) => {
        if (index < 10) return null

        const recentPrices = data.slice(index - 10, index + 1).map(d => d.close)
        const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length
        const currentPrice = data[index].close

        if (currentPrice > avgPrice * 1.001) {
          return {
            timestamp: data[index].timestamp,
            type: 'BUY',
            price: currentPrice
          }
        } else if (currentPrice < avgPrice * 0.999) {
          return {
            timestamp: data[index].timestamp,
            type: 'SELL',
            price: currentPrice
          }
        }

        return null
      })

      const result = engine.executeBacktest(signals)
      setResults(result)
    } catch (error) {
      console.error('Backtest failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatPercent = (percent: number) => `${percent.toFixed(2)}%`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Strategy Testing</h2>
      </div>

      {/* Configuration Panel */}
      <div className="card">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Backtest Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 font-medium">Initial Balance</label>
            <input
              type="number"
              className="input-field w-full mt-2"
              value={config.initialBalance}
              onChange={(e) => setConfig(c => ({ ...c, initialBalance: Number(e.target.value) }))}
              min="100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">Commission per Trade</label>
            <input
              type="number"
              className="input-field w-full mt-2"
              value={config.commission}
              onChange={(e) => setConfig(c => ({ ...c, commission: Number(e.target.value) }))}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">Slippage (%)</label>
            <input
              type="number"
              className="input-field w-full mt-2"
              value={config.slippage * 100}
              onChange={(e) => setConfig(c => ({ ...c, slippage: Number(e.target.value) / 100 }))}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">Symbol</label>
            <select
              className="select-field w-full mt-2"
              value={config.symbol}
              onChange={(e) => setConfig(c => ({ ...c, symbol: e.target.value }))}
            >
              <option value="R_100">R_100 (Volatility 100)</option>
              <option value="R_50">R_50 (Volatility 50)</option>
              <option value="R_25">R_25 (Volatility 25)</option>
              <option value="R_10">R_10 (Volatility 10)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">Start Date</label>
            <input
              type="date"
              className="input-field w-full mt-2"
              value={new Date(config.startDate).toISOString().split('T')[0]}
              onChange={(e) => setConfig(c => ({ ...c, startDate: new Date(e.target.value).getTime() }))}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">End Date</label>
            <input
              type="date"
              className="input-field w-full mt-2"
              value={new Date(config.endDate).toISOString().split('T')[0]}
              onChange={(e) => setConfig(c => ({ ...c, endDate: new Date(e.target.value).getTime() }))}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={runBacktest}
            disabled={isRunning}
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running...' : 'Run Backtest'}
          </button>

          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Results
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {results && (
        <div className="space-y-4">
          {/* Summary Metrics */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{results.totalTrades}</div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{formatPercent(results.winRate)}</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className={`text-center ${results.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <div className="text-2xl font-bold">{formatCurrency(results.totalPnL)}</div>
                <div className="text-sm text-gray-400">Total P&L</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{formatPercent(results.totalReturn)}</div>
                <div className="text-sm text-gray-400">Total Return</div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h4 className="text-md font-medium text-white mb-3">Trading Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Winning Trades:</span>
                  <span className="text-green-400">{results.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Losing Trades:</span>
                  <span className="text-red-400">{results.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Win:</span>
                  <span className="text-green-400">{formatCurrency(results.averageWin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Loss:</span>
                  <span className="text-red-400">{formatCurrency(results.averageLoss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Largest Win:</span>
                  <span className="text-green-400">{formatCurrency(results.largestWin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Largest Loss:</span>
                  <span className="text-red-400">{formatCurrency(results.largestLoss)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-md font-medium text-white mb-3">Risk Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown:</span>
                  <span className="text-red-400">{formatPercent(results.maxDrawdown)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sharpe Ratio:</span>
                  <span className="text-blue-400">{results.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Factor:</span>
                  <span className="text-green-400">{results.profitFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Holding Time:</span>
                  <span className="text-white">{Math.round(results.averageHoldingPeriod / (1000 * 60))}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Holding Time:</span>
                  <span className="text-white">{Math.round(results.maxHoldingPeriod / (1000 * 60))}m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equity Curve Chart Placeholder */}
          <div className="card">
            <h4 className="text-md font-medium text-white mb-3">Equity Curve</h4>
            <div className="h-48 bg-gray-700 rounded flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Equity curve visualization</p>
                <p className="text-sm text-gray-500">Coming soon with advanced charting</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!results && !isRunning && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-sm font-bold">?</span>
            </div>
            <div>
              <h4 className="text-blue-400 font-medium mb-2">How to Use Strategy Testing</h4>
              <div className="text-sm text-blue-300 space-y-1">
                <p>1. Configure your backtest parameters above</p>
                <p>2. Select a symbol and date range</p>
                <p>3. Adjust commission and slippage settings</p>
                <p>4. Click &quot;Run Backtest&quot; to analyze your strategy</p>
                <p>5. Review performance metrics and risk statistics</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to generate sample data (in production, this would come from API)
function generateSampleHistoricalData(symbol: string, days: number) {
  const data = []
  const now = Date.now()
  let price = symbol === 'R_100' ? 100 : symbol === 'R_50' ? 50 : symbol === 'R_25' ? 25 : 10

  for (let i = 0; i < days * 24 * 60; i++) {
    const timestamp = now - (days * 24 * 60 * 60 * 1000) + (i * 60 * 1000)
    const change = (Math.random() - 0.5) * 0.01 // 1% volatility
    const open = price
    const close = open * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.005)
    const low = Math.min(open, close) * (1 - Math.random() * 0.005)

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000) + 1000
    })

    price = close
  }

  return data
}
