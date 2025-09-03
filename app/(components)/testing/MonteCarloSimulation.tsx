'use client'
import { useState, useEffect } from 'react'
import { Dice6, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'
import { MonteCarloSimulator } from '@/lib/backtesting'

export function MonteCarloSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [numSimulations, setNumSimulations] = useState(1000)

  const runMonteCarlo = async () => {
    setIsRunning(true)
    try {
      // Generate sample historical data
      const historicalData = generateSampleHistoricalData(365)

      // Create backtesting engine
      const engine = new BacktestingEngine({
        initialBalance: 1000,
        commission: 0.01,
        slippage: 0.0001,
        startDate: Date.now() - (365 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        symbol: 'R_100',
        timeframe: '1m'
      })

      engine.loadHistoricalData(historicalData)

      // Create Monte Carlo simulator
      const simulator = new MonteCarloSimulator(engine)

      // Define strategy with random parameters
      const strategyFunction = (data: any[], index: number, params: any) => {
        if (index < params.period) return null

        const recentPrices = data.slice(index - params.period, index + 1).map((d: any) => d.close)
        const avgPrice = recentPrices.reduce((sum: number, p: number) => sum + p, 0) / recentPrices.length
        const currentPrice = data[index].close

        if (currentPrice > avgPrice * (1 + params.threshold)) {
          return {
            timestamp: data[index].timestamp,
            type: 'BUY',
            price: currentPrice
          }
        } else if (currentPrice < avgPrice * (1 - params.threshold)) {
          return {
            timestamp: data[index].timestamp,
            type: 'SELL',
            price: currentPrice
          }
        }

        return null
      }

      // Define parameter ranges
      const parameterRanges = {
        period: { min: 10, max: 100, step: 5 },
        threshold: { min: 0.002, max: 0.02 }
      }

      // Run simulation
      const simulationResults = await simulator.runSimulation(
        strategyFunction,
        parameterRanges,
        historicalData,
        numSimulations
      )

      // Analyze results
      const analysis = simulator.analyzeResults(simulationResults)
      setResults({ results: simulationResults, analysis })
    } catch (error) {
      console.error('Monte Carlo simulation failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatPercent = (percent: number) => `${percent.toFixed(2)}%`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Dice6 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Monte Carlo Simulation</h2>
      </div>

      {/* Configuration */}
      <div className="card">
        <h3 className="text-lg font-medium text-white mb-4">Simulation Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 font-medium">Number of Simulations</label>
            <select
              className="select-field w-full mt-2"
              value={numSimulations}
              onChange={(e) => setNumSimulations(Number(e.target.value))}
            >
              <option value={100}>100 Simulations</option>
              <option value={500}>500 Simulations</option>
              <option value={1000}>1,000 Simulations</option>
              <option value={2000}>2,000 Simulations</option>
              <option value={5000}>5,000 Simulations</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">Strategy</label>
            <div className="mt-2 p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-white font-medium">Moving Average Crossover</div>
              <div className="text-xs text-gray-400 mt-1">
                Random period (10-100) and threshold (0.2%-2.0%)
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          onClick={runMonteCarlo}
          disabled={isRunning}
        >
          {isRunning ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Dice6 className="w-4 h-4" />
          )}
          {isRunning ? 'Running Simulations...' : `Run ${numSimulations} Simulations`}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Simulation Results Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{numSimulations}</div>
                <div className="text-sm text-gray-400">Total Simulations</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${results.analysis.expectedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(results.analysis.expectedReturn)}
                </div>
                <div className="text-sm text-gray-400">Expected Return</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {formatPercent(results.analysis.returnStdDev)}
                </div>
                <div className="text-sm text-gray-400">Return Std Dev</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatPercent(results.analysis.probabilityOfProfit)}
                </div>
                <div className="text-sm text-gray-400">Probability of Profit</div>
              </div>
            </div>
          </div>

          {/* Return Distribution */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4">Return Distribution</h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{formatPercent(results.analysis.minReturn)}</div>
                <div className="text-sm text-gray-400">Worst Case</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">{formatPercent(results.analysis.returnPercentiles['5th'])}</div>
                <div className="text-sm text-gray-400">5th Percentile</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatPercent(results.analysis.returnPercentiles['50th'])}</div>
                <div className="text-sm text-gray-400">Median</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{formatPercent(results.analysis.returnPercentiles['95th'])}</div>
                <div className="text-sm text-gray-400">95th Percentile</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{formatPercent(results.analysis.maxReturn)}</div>
                <div className="text-sm text-gray-400">Best Case</div>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Analysis
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Expected Max Drawdown</span>
                </div>
                <span className="text-red-400 font-bold">{formatPercent(results.analysis.expectedMaxDrawdown)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Probability of Profit</span>
                </div>
                <span className="text-green-400 font-bold">{formatPercent(results.analysis.probabilityOfProfit)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium">Return Variability</span>
                </div>
                <span className="text-orange-400 font-bold">{formatPercent(results.analysis.returnStdDev)}</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4">Risk Assessment</h3>

            <div className="space-y-3">
              {results.analysis.probabilityOfProfit >= 70 && results.analysis.expectedMaxDrawdown <= 20 && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <div className="text-green-400 font-medium">Low Risk Strategy</div>
                    <div className="text-sm text-green-300">High probability of profit with controlled drawdown</div>
                  </div>
                </div>
              )}

              {results.analysis.probabilityOfProfit >= 50 && results.analysis.expectedMaxDrawdown <= 30 && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <div>
                    <div className="text-blue-400 font-medium">Moderate Risk Strategy</div>
                    <div className="text-sm text-blue-300">Balanced risk-reward profile</div>
                  </div>
                </div>
              )}

              {(results.analysis.probabilityOfProfit < 50 || results.analysis.expectedMaxDrawdown > 30) && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">⚠</span>
                  </div>
                  <div>
                    <div className="text-red-400 font-medium">High Risk Strategy</div>
                    <div className="text-sm text-red-300">Consider adjusting parameters or using with caution</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!results && !isRunning && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-sm font-bold">🎲</span>
            </div>
            <div>
              <h4 className="text-purple-400 font-medium mb-2">Monte Carlo Analysis</h4>
              <div className="text-sm text-purple-300 space-y-1">
                <p>• Run thousands of simulations with random parameters</p>
                <p>• Analyze probability distributions of returns</p>
                <p>• Assess strategy robustness under different market conditions</p>
                <p>• Identify potential worst-case scenarios and risk levels</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to generate sample data
function generateSampleHistoricalData(days: number) {
  const data = []
  const now = Date.now()
  let price = 100

  for (let i = 0; i < days * 24 * 60; i++) {
    const timestamp = now - (days * 24 * 60 * 60 * 1000) + (i * 60 * 1000)
    const change = (Math.random() - 0.5) * 0.01
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

// Import required classes (these would be in the actual implementation)
class BacktestingEngine {
  constructor(config: any) {
    // Implementation would be in the actual file
  }

  loadHistoricalData(data: any[]) {
    // Implementation would be in the actual file
  }

  generateSignals(strategy: any) {
    // Implementation would be in the actual file
    return []
  }

  executeBacktest(signals: any[]) {
    // Implementation would be in the actual file
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      totalReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      averageHoldingPeriod: 0,
      maxHoldingPeriod: 0,
      trades: [],
      equityCurve: [],
      drawdownCurve: [],
      monthlyReturns: []
    }
  }
}
