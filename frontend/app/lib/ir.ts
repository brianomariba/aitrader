export type DurationUnit = 't' | 's' | 'm' | 'h' | 'd'
export type ContractFamily = 'RISE_FALL' | 'HIGHER_LOWER' | 'DIGITS' | 'LOOKBACKS' | 'ACCUMULATORS' | 'MULTIPLIERS'
export type Step =
  | { kind: 'SET_SYMBOL'; symbol: string }
  | { kind: 'SET_CONTRACT_FAMILY'; family: ContractFamily }
  | { kind: 'SET_CONTRACT_TYPE'; contract_type: string }
  | { kind: 'SET_BASIS'; basis: 'stake' | 'payout' }
  | { kind: 'SET_AMOUNT'; amount: number }
  | { kind: 'SET_CURRENCY'; currency: string }
  | { kind: 'SET_DURATION'; duration: number; unit: DurationUnit }
  | { kind: 'SET_BARRIER'; barrier: string }
  | { kind: 'SET_SECOND_BARRIER'; barrier2: string }
  | { kind: 'TRADE_IF_PRICE'; operator: string; price: number }
  | { kind: 'TRADE_IF_TICKS'; count: number; trend: string }
  | { kind: 'TRADE_IF_INDICATOR'; indicator: string; comparison: string; value: number }
  | { kind: 'INDICATOR_SMA'; period: number }
  | { kind: 'INDICATOR_EMA'; period: number }
  | { kind: 'INDICATOR_RSI'; period: number }
  | { kind: 'INDICATOR_MACD'; fastPeriod: number; slowPeriod: number; signalPeriod: number }
  | { kind: 'INDICATOR_BOLLINGER'; period: number; stdDev: number }
  | { kind: 'INDICATOR_STOCHASTIC'; kPeriod: number; dPeriod: number }
  | { kind: 'TRADE_IF'; condition: 'UP' | 'DOWN' | 'ALWAYS' }
  | { kind: 'STOP_LOSS'; amount: number }
  | { kind: 'TAKE_PROFIT'; amount: number }
  | { kind: 'MAX_CONSECUTIVE_LOSSES'; count: number }
  | { kind: 'MAX_DAILY_TRADES'; count: number }
  | { kind: 'LOOP_UNTIL'; condition: string }
  | { kind: 'WAIT'; seconds: number }
  | { kind: 'STOP_AFTER'; count: number }
export type Program = Step[]
