import { useDerivStore } from '@/state/derivStore'
import type { Program, DurationUnit } from './ir'

// Re-export Program type for use in other modules
export type { Program }
import { validateContractParams } from './derivClient'
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateStochastic,
  getLatestSignal,
  convertTicksToTickData,
  type IndicatorResult
} from './technicalIndicators'

const lastN = <T,>(arr: T[], n: number) => arr.slice(-n)

export async function runProgram(program: Program) {
  const store = useDerivStore.getState()
  let symbol = 'R_100', basis: 'stake' | 'payout' = 'stake', amount = 1, duration = 3, unit: DurationUnit = 'm'
  let contract_type: 'CALL' | 'PUT' = 'CALL'; let barrier: string | undefined
  const stopAfter = (program.find(s => s.kind === 'STOP_AFTER') as any)?.count || 5
  const waitSeconds = (program.find(s => s.kind === 'WAIT') as any)?.seconds || 30

  for (const step of program) {
    if (step.kind === 'SET_SYMBOL') symbol = step.symbol
    if (step.kind === 'SET_BASIS') basis = step.basis
    if (step.kind === 'SET_AMOUNT') amount = step.amount
    if (step.kind === 'SET_DURATION') { duration = step.duration; unit = step.unit }
    if (step.kind === 'SET_CONTRACT_TYPE') contract_type = step.contract_type as any
    if (step.kind === 'SET_BARRIER') barrier = step.barrier
  }

  store.subscribeTicks(symbol)
  let trades = 0, cooling = false

  const unsubscribe = useDerivStore.subscribe(async (s) => {
    const ticks = s.lastTicks
    if (cooling || trades >= stopAfter) return
    const slice = lastN(ticks, 6); if (slice.length < 6) return
    let up=0, down=0; for(let i=1;i<slice.length;i++){ if(slice[i].v>slice[i-1].v) up++; if(slice[i].v<slice[i-1].v) down++ }
    // Evaluate trading conditions
    let decision: 'CALL' | 'PUT' | undefined

    // Check for technical indicator conditions
    const indicatorRule = program.find(s => s.kind === 'TRADE_IF_INDICATOR') as any
    if (indicatorRule) {
      const tickData = convertTicksToTickData(slice)
      let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'

      try {
        switch (indicatorRule.indicator) {
          case 'RSI': {
            const rsiResults = calculateRSI(tickData, 14)
            signal = getLatestSignal(rsiResults)
            break
          }
          case 'MACD': {
            const macdResults = calculateMACD(tickData)
            signal = getLatestSignal(macdResults)
            break
          }
          case 'MA': {
            const smaResults = calculateSMA(tickData, 20)
            const currentPrice = tickData[tickData.length - 1].price
            const smaValue = smaResults[smaResults.length - 1]?.value || 0
            if (currentPrice > smaValue) signal = 'BUY'
            else if (currentPrice < smaValue) signal = 'SELL'
            break
          }
          case 'STOCHASTIC': {
            const stochResults = calculateStochastic(tickData)
            signal = getLatestSignal(stochResults)
            break
          }
          case 'BOLLINGER': {
            const bbResults = calculateBollingerBands(tickData)
            signal = getLatestSignal(bbResults)
            break
          }
        }

        // Apply signal-based conditions
        if (indicatorRule.comparison === 'BUY_SIGNAL' && signal === 'BUY') {
          decision = 'CALL'
        } else if (indicatorRule.comparison === 'SELL_SIGNAL' && signal === 'SELL') {
          decision = 'PUT'
        }
      } catch (error) {
        useDerivStore.getState().appendLog('Indicator calculation error: ' + error)
      }
    }

    // Fallback to simple trend analysis
    const rule = program.find(s => s.kind === 'TRADE_IF') as any
    if (!decision) {
      if (!rule || rule.condition === 'ALWAYS') decision = 'CALL'
      else if (rule.condition==='UP' && up>=5) decision='CALL'
      else if (rule.condition==='DOWN' && down>=5) decision='PUT'
    }

    if (!decision) return

    const ok = await validateContractParams(symbol, decision); if (!ok) { useDerivStore.getState().appendLog('Contract type not available; skip'); return }
    useDerivStore.getState().requestProposal({ symbol, amount, basis, contract_type: decision, currency: useDerivStore.getState().account?.currency || 'USD', duration, duration_unit: unit, barrier, passthrough: { flow: 'bot' } })
    trades++; cooling = true; setTimeout(()=>{ cooling=false }, Math.max(1, waitSeconds)*1000)
    if (trades >= stopAfter) unsubscribe()
  })
  return () => { unsubscribe() }
}
