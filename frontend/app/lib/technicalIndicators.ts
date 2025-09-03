// Technical Indicators Library for DBot
// Provides common trading indicators: MA, RSI, MACD, Bollinger Bands, etc.

export interface TickData {
  timestamp: number
  price: number
}

export interface IndicatorResult {
  timestamp: number
  value: number
  signal?: 'BUY' | 'SELL' | 'HOLD'
}

/**
 * Simple Moving Average
 */
export function calculateSMA(data: TickData[], period: number): IndicatorResult[] {
  const results: IndicatorResult[] = []

  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, tick) => acc + tick.price, 0)
    const average = sum / period

    results.push({
      timestamp: data[i].timestamp,
      value: average
    })
  }

  return results
}

/**
 * Exponential Moving Average
 */
export function calculateEMA(data: TickData[], period: number): IndicatorResult[] {
  const results: IndicatorResult[] = []
  const multiplier = 2 / (period + 1)

  // Start with SMA for first value
  if (data.length >= period) {
    const firstSMA = data.slice(0, period).reduce((acc, tick) => acc + tick.price, 0) / period
    results.push({
      timestamp: data[period - 1].timestamp,
      value: firstSMA
    })

    // Calculate EMA for remaining values
    for (let i = period; i < data.length; i++) {
      const ema = (data[i].price - results[results.length - 1].value) * multiplier + results[results.length - 1].value
      results.push({
        timestamp: data[i].timestamp,
        value: ema
      })
    }
  }

  return results
}

/**
 * Relative Strength Index (RSI)
 */
export function calculateRSI(data: TickData[], period: number = 14): IndicatorResult[] {
  const results: IndicatorResult[] = []

  if (data.length < period + 1) return results

  const gains: number[] = []
  const losses: number[] = []

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].price - data[i - 1].price
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  // Calculate initial averages
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period

  for (let i = period; i < data.length; i++) {
    // Smoothed averages
    if (i > period) {
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period
    }

    const rs = avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
    if (rsi < 30) signal = 'BUY'
    else if (rsi > 70) signal = 'SELL'

    results.push({
      timestamp: data[i].timestamp,
      value: rsi,
      signal
    })
  }

  return results
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(data: TickData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): IndicatorResult[] {
  const results: IndicatorResult[] = []

  if (data.length < slowPeriod) return results

  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)

  // Calculate MACD line
  const macdLine: TickData[] = []
  for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
    macdLine.push({
      timestamp: fastEMA[i].timestamp,
      price: fastEMA[i].value - slowEMA[i].value
    })
  }

  // Calculate signal line (EMA of MACD)
  const signalLine = calculateEMA(macdLine, signalPeriod)

  // Calculate histogram and generate signals
  for (let i = 0; i < signalLine.length; i++) {
    const macdValue = macdLine[i + (macdLine.length - signalLine.length)].price
    const signalValue = signalLine[i].value
    const histogram = macdValue - signalValue

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
    if (histogram > 0 && macdValue > signalValue) signal = 'BUY'
    else if (histogram < 0 && macdValue < signalValue) signal = 'SELL'

    results.push({
      timestamp: signalLine[i].timestamp,
      value: histogram,
      signal
    })
  }

  return results
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(data: TickData[], period: number = 20, stdDev: number = 2): Array<IndicatorResult & { upper: number; middle: number; lower: number }> {
  const results: Array<IndicatorResult & { upper: number; middle: number; lower: number }> = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const prices = slice.map(tick => tick.price)

    const sma = prices.reduce((sum, price) => sum + price, 0) / period
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    const upper = sma + (stdDev * standardDeviation)
    const lower = sma - (stdDev * standardDeviation)

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
    const currentPrice = data[i].price
    if (currentPrice <= lower) signal = 'BUY'
    else if (currentPrice >= upper) signal = 'SELL'

    results.push({
      timestamp: data[i].timestamp,
      value: currentPrice,
      upper,
      middle: sma,
      lower,
      signal
    })
  }

  return results
}

/**
 * Stochastic Oscillator
 */
export function calculateStochastic(data: TickData[], kPeriod: number = 14, dPeriod: number = 3): IndicatorResult[] {
  const results: IndicatorResult[] = []

  for (let i = kPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - kPeriod + 1, i + 1)
    const highest = Math.max(...slice.map(tick => tick.price))
    const lowest = Math.min(...slice.map(tick => tick.price))
    const current = data[i].price

    const k = ((current - lowest) / (highest - lowest)) * 100

    results.push({
      timestamp: data[i].timestamp,
      value: k
    })
  }

  // Calculate D line (SMA of K)
  const dResults: IndicatorResult[] = []
  for (let i = dPeriod - 1; i < results.length; i++) {
    const sum = results.slice(i - dPeriod + 1, i + 1).reduce((acc, result) => acc + result.value, 0)
    const d = sum / dPeriod

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
    if (d < 20) signal = 'BUY'
    else if (d > 80) signal = 'SELL'

    dResults.push({
      timestamp: results[i].timestamp,
      value: d,
      signal
    })
  }

  return dResults
}

/**
 * Utility function to get latest signal from indicator
 */
export function getLatestSignal(indicatorResults: IndicatorResult[]): 'BUY' | 'SELL' | 'HOLD' {
  if (indicatorResults.length === 0) return 'HOLD'
  return indicatorResults[indicatorResults.length - 1].signal || 'HOLD'
}

/**
 * Convert tick data from store format to TickData format
 */
export function convertTicksToTickData(ticks: Array<{ t: number; v: number }>): TickData[] {
  return ticks.map(tick => ({
    timestamp: tick.t,
    price: tick.v
  }))
}
