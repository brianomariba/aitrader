// Advanced Strategy Testing and Backtesting Engine
// Provides comprehensive testing, optimization, and analysis tools

export interface HistoricalDataPoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface TradeSignal {
  timestamp: number
  type: 'BUY' | 'SELL' | 'HOLD'
  price: number
  confidence?: number
  metadata?: any
}

export interface BacktestResult {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  averageHoldingPeriod: number
  maxHoldingPeriod: number
  trades: BacktestTrade[]
  equityCurve: EquityPoint[]
  drawdownCurve: DrawdownPoint[]
  monthlyReturns: MonthlyReturn[]
}

export interface BacktestTrade {
  entryTime: number
  exitTime: number
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercentage: number
  holdingPeriod: number
  type: 'BUY' | 'SELL'
  size: number
}

export interface EquityPoint {
  timestamp: number
  equity: number
}

export interface DrawdownPoint {
  timestamp: number
  drawdown: number
  peak: number
}

export interface MonthlyReturn {
  month: string
  return: number
  cumulativeReturn: number
}

export interface BacktestConfig {
  initialBalance: number
  commission: number
  slippage: number
  startDate: number
  endDate: number
  symbol: string
  timeframe: string
}

export interface OptimizationResult {
  parameters: Record<string, any>
  score: number
  result: BacktestResult
}

/**
 * Main Backtesting Engine
 */
export class BacktestingEngine {
  private historicalData: HistoricalDataPoint[] = []
  private config: BacktestConfig

  constructor(config: BacktestConfig) {
    this.config = config
  }

  /**
   * Load historical data for backtesting
   */
  loadHistoricalData(data: HistoricalDataPoint[]) {
    // Filter data by date range
    this.historicalData = data.filter(point =>
      point.timestamp >= this.config.startDate &&
      point.timestamp <= this.config.endDate
    ).sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Generate trading signals using a strategy function
   */
  generateSignals(strategyFunction: (data: HistoricalDataPoint[], index: number) => TradeSignal | null): TradeSignal[] {
    const signals: TradeSignal[] = []

    for (let i = 0; i < this.historicalData.length; i++) {
      const signal = strategyFunction(this.historicalData, i)
      if (signal) {
        signals.push(signal)
      }
    }

    return signals
  }

  /**
   * Execute backtest with given signals
   */
  executeBacktest(signals: TradeSignal[]): BacktestResult {
    const trades: BacktestTrade[] = []
    let position: 'long' | 'short' | null = null
    let entryTime = 0
    let entryPrice = 0
    let positionSize = 1

    const equityCurve: EquityPoint[] = []
    const drawdownCurve: DrawdownPoint[] = []

    let balance = this.config.initialBalance
    let peak = balance
    let maxDrawdown = 0

    // Process each data point
    for (const dataPoint of this.historicalData) {
      const signal = signals.find(s => s.timestamp === dataPoint.timestamp)

      // Handle position management
      if (position && signal) {
        // Exit current position
        const exitPrice = dataPoint.close * (1 + this.config.slippage * (position === 'long' ? -1 : 1))
        const pnl = position === 'long' ?
          (exitPrice - entryPrice) * positionSize - this.config.commission :
          (entryPrice - exitPrice) * positionSize - this.config.commission

        const trade: BacktestTrade = {
          entryTime,
          exitTime: dataPoint.timestamp,
          entryPrice,
          exitPrice,
          pnl,
          pnlPercentage: (pnl / entryPrice) * 100,
          holdingPeriod: dataPoint.timestamp - entryTime,
          type: position === 'long' ? 'BUY' : 'SELL',
          size: positionSize
        }

        trades.push(trade)
        balance += pnl

        // Update drawdown
        if (balance > peak) {
          peak = balance
        }
        const drawdown = ((peak - balance) / peak) * 100
        maxDrawdown = Math.max(maxDrawdown, drawdown)

        drawdownCurve.push({
          timestamp: dataPoint.timestamp,
          drawdown,
          peak
        })

        position = null
      }

      // Enter new position
      if (!position && signal && signal.type !== 'HOLD') {
        position = signal.type === 'BUY' ? 'long' : 'short'
        entryTime = dataPoint.timestamp
        entryPrice = dataPoint.close * (1 + this.config.slippage * (position === 'long' ? 1 : -1))
      }

      equityCurve.push({
        timestamp: dataPoint.timestamp,
        equity: balance
      })
    }

    // Close any remaining position at the end
    if (position) {
      const lastDataPoint = this.historicalData[this.historicalData.length - 1]
      const exitPrice = lastDataPoint.close
      const pnl = position === 'long' ?
        (exitPrice - entryPrice) * positionSize - this.config.commission :
        (entryPrice - exitPrice) * positionSize - this.config.commission

      const trade: BacktestTrade = {
        entryTime,
        exitTime: lastDataPoint.timestamp,
        entryPrice,
        exitPrice,
        pnl,
        pnlPercentage: (pnl / entryPrice) * 100,
        holdingPeriod: lastDataPoint.timestamp - entryTime,
        type: position === 'long' ? 'BUY' : 'SELL',
        size: positionSize
      }

      trades.push(trade)
      balance += pnl
    }

    // Calculate performance metrics
    const winningTrades = trades.filter(t => t.pnl > 0)
    const losingTrades = trades.filter(t => t.pnl < 0)

    const totalPnL = balance - this.config.initialBalance
    const totalReturn = (totalPnL / this.config.initialBalance) * 100

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

    const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0
    const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0

    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0

    // Calculate Sharpe ratio (simplified)
    const returns = equityCurve.slice(1).map((point, i) => {
      const prevPoint = equityCurve[i]
      return (point.equity - prevPoint.equity) / prevPoint.equity
    })
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0

    const averageHoldingPeriod = trades.length > 0 ?
      trades.reduce((sum, t) => sum + t.holdingPeriod, 0) / trades.length : 0

    const maxHoldingPeriod = trades.length > 0 ?
      Math.max(...trades.map(t => t.holdingPeriod)) : 0

    // Calculate monthly returns
    const monthlyReturns = this.calculateMonthlyReturns(equityCurve)

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalPnL,
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      averageHoldingPeriod,
      maxHoldingPeriod,
      trades,
      equityCurve,
      drawdownCurve,
      monthlyReturns
    }
  }

  private calculateMonthlyReturns(equityCurve: EquityPoint[]): MonthlyReturn[] {
    const monthlyData: Record<string, { startEquity: number; endEquity: number }> = {}

    for (const point of equityCurve) {
      const date = new Date(point.timestamp)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { startEquity: point.equity, endEquity: point.equity }
      } else {
        monthlyData[monthKey].endEquity = point.equity
      }
    }

    const monthlyReturns: MonthlyReturn[] = []
    let cumulativeReturn = 0

    Object.entries(monthlyData).forEach(([month, data]) => {
      const monthlyReturn = ((data.endEquity - data.startEquity) / data.startEquity) * 100
      cumulativeReturn += monthlyReturn

      monthlyReturns.push({
        month,
        return: monthlyReturn,
        cumulativeReturn
      })
    })

    return monthlyReturns
  }
}

/**
 * Strategy Optimization Engine
 */
export class StrategyOptimizer {
  private backtestingEngine: BacktestingEngine

  constructor(backtestingEngine: BacktestingEngine) {
    this.backtestingEngine = backtestingEngine
  }

  /**
   * Optimize strategy parameters using grid search
   */
  optimizeParameters(
    strategyFunction: (data: HistoricalDataPoint[], index: number, params: Record<string, any>) => TradeSignal | null,
    parameterSpace: Record<string, number[]>,
    historicalData: HistoricalDataPoint[],
    fitnessFunction: (result: BacktestResult) => number = (result) => result.sharpeRatio
  ): OptimizationResult[] {
    const results: OptimizationResult[] = []
    const parameterCombinations = this.generateParameterCombinations(parameterSpace)

    for (const params of parameterCombinations) {
      const strategyWithParams = (data: HistoricalDataPoint[], index: number) =>
        strategyFunction(data, index, params)

      const signals = this.backtestingEngine.generateSignals(strategyWithParams)
      const result = this.backtestingEngine.executeBacktest(signals)

      results.push({
        parameters: params,
        score: fitnessFunction(result),
        result
      })
    }

    // Sort by score (descending)
    return results.sort((a, b) => b.score - a.score)
  }

  private generateParameterCombinations(parameterSpace: Record<string, number[]>): Record<string, any>[] {
    const keys = Object.keys(parameterSpace)
    if (keys.length === 0) return [{}]

    const [firstKey, ...restKeys] = keys
    const firstValues = parameterSpace[firstKey]
    const restCombinations = this.generateParameterCombinations(
      Object.fromEntries(restKeys.map(key => [key, parameterSpace[key]]))
    )

    const combinations: Record<string, any>[] = []
    for (const value of firstValues) {
      for (const restCombo of restCombinations) {
        combinations.push({ [firstKey]: value, ...restCombo })
      }
    }

    return combinations
  }
}

/**
 * Monte Carlo Simulation Engine
 */
export class MonteCarloSimulator {
  private backtestingEngine: BacktestingEngine

  constructor(backtestingEngine: BacktestingEngine) {
    this.backtestingEngine = backtestingEngine
  }

  /**
   * Run Monte Carlo simulation with randomized parameters
   */
  runSimulation(
    strategyFunction: (data: HistoricalDataPoint[], index: number, params: Record<string, any>) => TradeSignal | null,
    parameterRanges: Record<string, { min: number; max: number; step?: number }>,
    historicalData: HistoricalDataPoint[],
    numSimulations: number = 1000
  ): BacktestResult[] {
    const results: BacktestResult[] = []

    for (let i = 0; i < numSimulations; i++) {
      const randomParams = this.generateRandomParameters(parameterRanges)
      const strategyWithParams = (data: HistoricalDataPoint[], index: number) =>
        strategyFunction(data, index, randomParams)

      const signals = this.backtestingEngine.generateSignals(strategyWithParams)
      const result = this.backtestingEngine.executeBacktest(signals)

      results.push(result)
    }

    return results
  }

  private generateRandomParameters(ranges: Record<string, { min: number; max: number; step?: number }>): Record<string, any> {
    const params: Record<string, any> = {}

    for (const [key, range] of Object.entries(ranges)) {
      if (range.step) {
        // Discrete values
        const steps = Math.floor((range.max - range.min) / range.step) + 1
        const randomStep = Math.floor(Math.random() * steps)
        params[key] = range.min + randomStep * range.step
      } else {
        // Continuous values
        params[key] = range.min + Math.random() * (range.max - range.min)
      }
    }

    return params
  }

  /**
   * Analyze Monte Carlo results
   */
  analyzeResults(results: BacktestResult[]): {
    expectedReturn: number
    returnStdDev: number
    maxReturn: number
    minReturn: number
    returnPercentiles: Record<string, number>
    probabilityOfProfit: number
    expectedMaxDrawdown: number
  } {
    const returns = results.map(r => r.totalReturn)
    const drawdowns = results.map(r => r.maxDrawdown)

    const expectedReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const returnStdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - expectedReturn, 2), 0) / returns.length
    )

    const sortedReturns = [...returns].sort((a, b) => a - b)
    const expectedMaxDrawdown = drawdowns.reduce((sum, d) => sum + d, 0) / drawdowns.length

    return {
      expectedReturn,
      returnStdDev,
      maxReturn: Math.max(...returns),
      minReturn: Math.min(...returns),
      returnPercentiles: {
        '5th': sortedReturns[Math.floor(sortedReturns.length * 0.05)],
        '25th': sortedReturns[Math.floor(sortedReturns.length * 0.25)],
        '50th': sortedReturns[Math.floor(sortedReturns.length * 0.5)],
        '75th': sortedReturns[Math.floor(sortedReturns.length * 0.75)],
        '95th': sortedReturns[Math.floor(sortedReturns.length * 0.95)]
      },
      probabilityOfProfit: returns.filter(r => r > 0).length / returns.length * 100,
      expectedMaxDrawdown
    }
  }
}

/**
 * Walk-Forward Testing Engine
 */
export class WalkForwardTester {
  private backtestingEngine: BacktestingEngine

  constructor(backtestingEngine: BacktestingEngine) {
    this.backtestingEngine = backtestingEngine
  }

  /**
   * Perform walk-forward analysis
   */
  performWalkForward(
    strategyFunction: (data: HistoricalDataPoint[], index: number, params: Record<string, any>) => TradeSignal | null,
    optimizationFunction: (data: HistoricalDataPoint[]) => Record<string, any>,
    historicalData: HistoricalDataPoint[],
    inSampleSize: number,
    outOfSampleSize: number,
    stepSize: number
  ): {
    periods: Array<{
      inSampleStart: number
      inSampleEnd: number
      outOfSampleStart: number
      outOfSampleEnd: number
      optimalParams: Record<string, any>
      inSampleResult: BacktestResult
      outOfSampleResult: BacktestResult
    }>
  } {
    const periods = []
    const totalPoints = historicalData.length

    for (let start = 0; start + inSampleSize + outOfSampleSize <= totalPoints; start += stepSize) {
      const inSampleStart = start
      const inSampleEnd = start + inSampleSize - 1
      const outOfSampleStart = inSampleEnd + 1
      const outOfSampleEnd = outOfSampleStart + outOfSampleSize - 1

      if (outOfSampleEnd >= totalPoints) break

      // In-sample optimization
      const inSampleData = historicalData.slice(inSampleStart, inSampleEnd + 1)
      const optimalParams = optimizationFunction(inSampleData)

      // Create engines for both periods
      const inSampleEngine = new BacktestingEngine({
        ...this.backtestingEngine['config'],
        startDate: inSampleData[0].timestamp,
        endDate: inSampleData[inSampleData.length - 1].timestamp
      })
      inSampleEngine.loadHistoricalData(inSampleData)

      const outOfSampleEngine = new BacktestingEngine({
        ...this.backtestingEngine['config'],
        startDate: historicalData[outOfSampleStart].timestamp,
        endDate: historicalData[outOfSampleEnd].timestamp
      })
      outOfSampleEngine.loadHistoricalData(historicalData.slice(outOfSampleStart, outOfSampleEnd + 1))

      // Test both periods
      const inSampleStrategy = (data: HistoricalDataPoint[], index: number) =>
        strategyFunction(data, index, optimalParams)
      const outOfSampleStrategy = (data: HistoricalDataPoint[], index: number) =>
        strategyFunction(data, index, optimalParams)

      const inSampleSignals = inSampleEngine.generateSignals(inSampleStrategy)
      const outOfSampleSignals = outOfSampleEngine.generateSignals(outOfSampleStrategy)

      const inSampleResult = inSampleEngine.executeBacktest(inSampleSignals)
      const outOfSampleResult = outOfSampleEngine.executeBacktest(outOfSampleSignals)

      periods.push({
        inSampleStart: historicalData[inSampleStart].timestamp,
        inSampleEnd: historicalData[inSampleEnd].timestamp,
        outOfSampleStart: historicalData[outOfSampleStart].timestamp,
        outOfSampleEnd: historicalData[outOfSampleEnd].timestamp,
        optimalParams,
        inSampleResult,
        outOfSampleResult
      })
    }

    return { periods }
  }
}

/**
 * Sample Historical Data Generator (for demo purposes)
 */
export function generateSampleHistoricalData(
  symbol: string,
  days: number,
  startPrice: number = 100,
  volatility: number = 0.02
): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = []
  const now = Date.now()
  let price = startPrice

  for (let i = 0; i < days * 24 * 60; i++) { // 1-minute intervals
    const timestamp = now - (days * 24 * 60 * 60 * 1000) + (i * 60 * 1000)

    // Generate OHLC data with some randomness
    const change = (Math.random() - 0.5) * 2 * volatility
    const open = price
    const close = open * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5)
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5)

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
