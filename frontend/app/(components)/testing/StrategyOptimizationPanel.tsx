'use client'
import { useState, useEffect } from 'react'
import { Zap, Settings, TrendingUp, Target, Cpu } from 'lucide-react'
import { StrategyOptimizer, OptimizationResult, BacktestingEngine, HistoricalDataPoint, TradeSignal } from '@/lib/backtesting'

export function StrategyOptimizationPanel() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [results, setResults] = useState<OptimizationResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [parameterSpace, setParameterSpace] = useState({
    period: { min: 5, max: 50, step: 5 },
    threshold: { min: 0.001, max: 0.01, step: 0.001 },
    stopLoss: { min: 0.01, max: 0.1, step: 0.01 }
  })

  const [fitnessFunction, setFitnessFunction] = useState<'sharpe' | 'winRate' | 'profitFactor' | 'totalReturn'>('sharpe')

  const runOptimization = async () => {
    setIsOptimizing(true)
    try {
      // Generate sample data
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

      // Create optimizer
      const optimizer = new StrategyOptimizer(engine)

      // Define strategy function with parameters
      const strategyFunction = (data: HistoricalDataPoint[], index: number, params: Record<string, any>): TradeSignal | null => {
        if (index < params.period) return null

        const recentPrices = data.slice(index - params.period, index + 1).map((d: HistoricalDataPoint) => d.close)
        const avgPrice = recentPrices.reduce((sum: number, p: number) => sum + p, 0) / recentPrices.length
        const currentPrice = data[index].close

        if (currentPrice > avgPrice * (1 + params.threshold)) {
          return {
            timestamp: data[index].timestamp,
            type: 'BUY' as const,
            price: currentPrice
          }
        } else if (currentPrice < avgPrice * (1 - params.threshold)) {
          return {
            timestamp: data[index].timestamp,
            type: 'SELL' as const,
            price: currentPrice
          }
        }

        return null
      }

      // Define fitness function
      const fitnessMap = {
        sharpe: (result: any) => result.sharpeRatio,
        winRate: (result: any) => result.winRate,
        profitFactor: (result: any) => result.profitFactor,
        totalReturn: (result: any) => result.totalReturn
      }

      const fitnessFunc = fitnessMap[fitnessFunction]

      // Convert parameter space to expected format
      const convertedParameterSpace: Record<string, number[]> = {
        period: Array.from({ length: Math.floor((parameterSpace.period.max - parameterSpace.period.min) / parameterSpace.period.step) + 1 }, (_, i) => parameterSpace.period.min + (i * parameterSpace.period.step)),
        threshold: Array.from({ length: Math.floor((parameterSpace.threshold.max - parameterSpace.threshold.min) / parameterSpace.threshold.step) + 1 }, (_, i) => parameterSpace.threshold.min + (i * parameterSpace.threshold.step)),
        stopLoss: Array.from({ length: Math.floor((parameterSpace.stopLoss.max - parameterSpace.stopLoss.min) / parameterSpace.stopLoss.step) + 1 }, (_, i) => parameterSpace.stopLoss.min + (i * parameterSpace.stopLoss.step))
      }

      // Run optimization
      const optimizationResults = optimizer.optimizeParameters(
        strategyFunction,
        convertedParameterSpace,
        historicalData,
        fitnessFunc
      )

      setResults(optimizationResults.slice(0, 10)) // Top 10 results
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Optimization failed. Please check your parameters.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatPercent = (percent: number) => `${percent.toFixed(2)}%`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Strategy Optimization</h2>
      </div>

      {/* Parameter Configuration */}
      <div className="card">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Parameter Space
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 font-medium">Period (Lookback)</label>
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.period.min}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  period: { ...p.period, min: Number(e.target.value) }
                }))}
                placeholder="Min"
              />
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.period.max}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  period: { ...p.period, max: Number(e.target.value) }
                }))}
                placeholder="Max"
              />
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.period.step}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  period: { ...p.period, step: Number(e.target.value) }
                }))}
                placeholder="Step"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">Threshold</label>
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.threshold.min}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  threshold: { ...p.threshold, min: Number(e.target.value) }
                }))}
                placeholder="Min"
                step="0.001"
              />
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.threshold.max}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  threshold: { ...p.threshold, max: Number(e.target.value) }
                }))}
                placeholder="Max"
                step="0.001"
              />
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.threshold.step}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  threshold: { ...p.threshold, step: Number(e.target.value) }
                }))}
                placeholder="Step"
                step="0.001"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium">Stop Loss</label>
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.stopLoss.min}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  stopLoss: { ...p.stopLoss, min: Number(e.target.value) }
                }))}
                placeholder="Min"
                step="0.01"
              />
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.stopLoss.max}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  stopLoss: { ...p.stopLoss, max: Number(e.target.value) }
                }))}
                placeholder="Max"
                step="0.01"
              />
              <input
                type="number"
                className="input-field flex-1"
                value={parameterSpace.stopLoss.step}
                onChange={(e) => setParameterSpace(p => ({
                  ...p,
                  stopLoss: { ...p.stopLoss, step: Number(e.target.value) }
                }))}
                placeholder="Step"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Fitness Function Selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 font-medium">Optimization Target</label>
          <select
            className="select-field w-full mt-2"
            value={fitnessFunction}
            onChange={(e) => setFitnessFunction(e.target.value as any)}
          >
            <option value="sharpe">Sharpe Ratio (Risk-Adjusted Returns)</option>
            <option value="winRate">Win Rate (Percentage of Winning Trades)</option>
            <option value="profitFactor">Profit Factor (Gross Profit / Gross Loss)</option>
            <option value="totalReturn">Total Return (Overall Performance)</option>
          </select>
        </div>

        <button
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          onClick={runOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Optimization Results */}
      {results.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Optimization Results
          </h3>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Parameter Set #{index + 1}</div>
                      <div className="text-sm text-gray-400">
                        Score: {result.score.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${result.result.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(result.result.totalPnL)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatPercent(result.result.totalReturn)}
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-400">Period:</span>
                    <span className="text-white ml-2">{result.parameters.period}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Threshold:</span>
                    <span className="text-white ml-2">{(result.parameters.threshold * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-white ml-2">{(result.parameters.stopLoss * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-blue-400 font-medium">{result.result.totalTrades}</div>
                    <div className="text-gray-400">Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-medium">{formatPercent(result.result.winRate)}</div>
                    <div className="text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">{result.result.sharpeRatio.toFixed(2)}</div>
                    <div className="text-gray-400">Sharpe</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-medium">{formatPercent(result.result.maxDrawdown)}</div>
                    <div className="text-gray-400">Max DD</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {results.length === 0 && !isOptimizing && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <div>
              <h4 className="text-green-400 font-medium mb-2">Strategy Optimization</h4>
              <div className="text-sm text-green-300 space-y-1">
                <p>• Define parameter ranges for your strategy</p>
                <p>• Choose an optimization target (Sharpe, Win Rate, etc.)</p>
                <p>• Run grid search optimization to find best parameters</p>
                <p>• Compare results across different parameter combinations</p>
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
