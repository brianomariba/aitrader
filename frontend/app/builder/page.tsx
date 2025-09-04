'use client'
import { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import 'blockly/blocks'
import { javascriptGenerator } from 'blockly/javascript'
import { runProgram, Program } from '@/lib/engine'
import { useDerivStore } from '@/state/derivStore'

const WORKSPACE_KEY = 'dbot_style_workspace_xml'

export default function BuilderPage() {
  const divRef = useRef<HTMLDivElement | null>(null)
  const wsRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const [program, setProgram] = useState<Program>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { symbols, fetchActiveSymbols } = useDerivStore()

  useEffect(() => { if (symbols.length === 0) fetchActiveSymbols() }, [symbols.length, fetchActiveSymbols])

  useEffect(() => {
    if (!divRef.current) return

    try {
      setIsLoading(true)
      setError(null)
      Blockly.common.defineBlocksWithJsonArray([
      // General Configuration
      {"type":"set_symbol","message0":"set symbol %1","args0":[{"type":"field_input","name":"SYMBOL","text":"R_100"}],"colour":210,"previousStatement":null,"nextStatement":null},
      {"type":"set_basis","message0":"basis %1","args0":[{"type":"field_dropdown","name":"BASIS","options":[["stake","stake"],["payout","payout"]]}],"colour":210,"previousStatement":null,"nextStatement":null},
      {"type":"set_amount","message0":"amount %1","args0":[{"type":"field_number","name":"AMOUNT","value":1,"min":0.35,"precision":0.01}],"colour":210,"previousStatement":null,"nextStatement":null},
      {"type":"set_currency","message0":"currency %1","args0":[{"type":"field_dropdown","name":"CURRENCY","options":[["USD","USD"],["EUR","EUR"],["GBP","GBP"],["BTC","BTC"]]}],"colour":210,"previousStatement":null,"nextStatement":null},
      {"type":"set_duration","message0":"duration %1 %2","args0":[{"type":"field_number","name":"DUR","value":3,"min":1},{"type":"field_dropdown","name":"UNIT","options":[["ticks","t"],["seconds","s"],["minutes","m"],["hours","h"],["days","d"]]}],"colour":210,"previousStatement":null,"nextStatement":null},

      // Contract Types - Rise/Fall & Higher/Lower
      {"type":"contract_rise_fall","message0":"Rise/Fall contract","colour":160,"previousStatement":null,"nextStatement":null},
      {"type":"contract_higher_lower","message0":"Higher/Lower with barrier %1","args0":[{"type":"field_input","name":"BARRIER","text":"+0.1"}],"colour":160,"previousStatement":null,"nextStatement":null},

      // Digits Contracts
      {"type":"contract_digits_match","message0":"Digits Match %1","args0":[{"type":"field_number","name":"DIGIT","value":5,"min":0,"max":9}],"colour":120,"previousStatement":null,"nextStatement":null},
      {"type":"contract_digits_differs","message0":"Digits Differs %1","args0":[{"type":"field_number","name":"DIGIT","value":5,"min":0,"max":9}],"colour":120,"previousStatement":null,"nextStatement":null},
      {"type":"contract_digits_even_odd","message0":"Digits %1","args0":[{"type":"field_dropdown","name":"TYPE","options":[["Even","EVEN"],["Odd","ODD"]]}],"colour":120,"previousStatement":null,"nextStatement":null},
      {"type":"contract_digits_over_under","message0":"Digits %1 %2","args0":[{"type":"field_dropdown","name":"TYPE","options":[["Over","OVER"],["Under","UNDER"]]}],"args1":[{"type":"field_number","name":"DIGIT","value":5,"min":0,"max":9}],"colour":120,"previousStatement":null,"nextStatement":null},

      // Accumulators & Multipliers
      {"type":"contract_accumulator","message0":"Accumulator with growth rate %1%","args0":[{"type":"field_number","name":"RATE","value":1,"min":0.01,"max":10,"precision":0.01}],"colour":90,"previousStatement":null,"nextStatement":null},
      {"type":"contract_multiplier","message0":"Multiplier with stake %1 multiplier %2","args0":[{"type":"field_number","name":"STAKE","value":10,"min":1},{"type":"field_number","name":"MULT","value":1.1,"min":1.01,"precision":0.01}],"colour":90,"previousStatement":null,"nextStatement":null},

      // Trading Conditions
      {"type":"trade_if_price","message0":"if price %1 %2 then trade","args0":[{"type":"field_dropdown","name":"OP","options":[["goes above","ABOVE"],["goes below","BELOW"],["equals","EQUALS"]]}],"args1":[{"type":"field_number","name":"PRICE","value":100}],"colour":60,"previousStatement":null,"nextStatement":null},
      {"type":"trade_if_ticks","message0":"if last %1 ticks are %2 then trade","args0":[{"type":"field_number","name":"COUNT","value":5,"min":2}],"args1":[{"type":"field_dropdown","name":"TREND","options":[["rising","RISING"],["falling","FALLING"],["stable","STABLE"]]}],"colour":60,"previousStatement":null,"nextStatement":null},
      {"type":"trade_if_indicator","message0":"if %1 %2 %3 then trade","args0":[{"type":"field_dropdown","name":"INDICATOR","options":[["RSI","RSI"],["MACD","MACD"],["MA","MA"],["Stochastic","STOCHASTIC"],["Bollinger","BOLLINGER"]]}],"args1":[{"type":"field_dropdown","name":"COMP","options":[["above","ABOVE"],["below","BELOW"],["crosses above","CROSSES_ABOVE"],["crosses below","CROSSES_BELOW"],["gives BUY signal","BUY_SIGNAL"],["gives SELL signal","SELL_SIGNAL"]]}],"args2":[{"type":"field_number","name":"VALUE","value":50}],"colour":60,"previousStatement":null,"nextStatement":null},

      // Technical Indicators
      {"type":"indicator_sma","message0":"SMA (period: %1)","args0":[{"type":"field_number","name":"PERIOD","value":20,"min":2}],"colour":45,"output":"Indicator","tooltip":"Simple Moving Average"},
      {"type":"indicator_ema","message0":"EMA (period: %1)","args0":[{"type":"field_number","name":"PERIOD","value":20,"min":2}],"colour":45,"output":"Indicator","tooltip":"Exponential Moving Average"},
      {"type":"indicator_rsi","message0":"RSI (period: %1)","args0":[{"type":"field_number","name":"PERIOD","value":14,"min":2}],"colour":45,"output":"Indicator","tooltip":"Relative Strength Index"},
      {"type":"indicator_macd","message0":"MACD (%1, %2, %3)","args0":[{"type":"field_number","name":"FAST","value":12,"min":2},{"type":"field_number","name":"SLOW","value":26,"min":2},{"type":"field_number","name":"SIGNAL","value":9,"min":2}],"colour":45,"output":"Indicator","tooltip":"Moving Average Convergence Divergence"},
      {"type":"indicator_bollinger","message0":"Bollinger Bands (%1, %2)","args0":[{"type":"field_number","name":"PERIOD","value":20,"min":2},{"type":"field_number","name":"STDDEV","value":2,"min":0.5,"precision":0.1}],"colour":45,"output":"Indicator","tooltip":"Bollinger Bands"},
      {"type":"indicator_stochastic","message0":"Stochastic (%1, %2)","args0":[{"type":"field_number","name":"K_PERIOD","value":14,"min":2},{"type":"field_number","name":"D_PERIOD","value":3,"min":2}],"colour":45,"output":"Indicator","tooltip":"Stochastic Oscillator"},

      // Risk Management
      {"type":"stop_loss","message0":"stop if loss exceeds %1","args0":[{"type":"field_number","name":"AMOUNT","value":10,"min":0}],"colour":0,"previousStatement":null,"nextStatement":null},
      {"type":"take_profit","message0":"take profit if gain reaches %1","args0":[{"type":"field_number","name":"AMOUNT","value":10,"min":0}],"colour":0,"previousStatement":null,"nextStatement":null},
      {"type":"max_consecutive_losses","message0":"stop after %1 consecutive losses","args0":[{"type":"field_number","name":"COUNT","value":3,"min":1}],"colour":0,"previousStatement":null,"nextStatement":null},
      {"type":"max_daily_trades","message0":"stop after %1 trades today","args0":[{"type":"field_number","name":"COUNT","value":10,"min":1}],"colour":0,"previousStatement":null,"nextStatement":null},

      // Control Flow
      {"type":"wait_seconds","message0":"wait %1 seconds between trades","args0":[{"type":"field_number","name":"SECONDS","value":30,"min":1}],"colour":330,"previousStatement":null,"nextStatement":null},
      {"type":"stop_after","message0":"stop after %1 trades","args0":[{"type":"field_number","name":"COUNT","value":5,"min":1}],"colour":330,"previousStatement":null,"nextStatement":null},
      {"type":"loop_until","message0":"repeat until %1","args0":[{"type":"field_dropdown","name":"CONDITION","options":[["profit target reached","PROFIT_TARGET"],["loss limit reached","LOSS_LIMIT"],["time expires","TIME_EXPIRES"]]}],"colour":330,"previousStatement":null,"nextStatement":null}
    ])

    // General Configuration Generators
    javascriptGenerator.forBlock['set_symbol'] = (block:any) => `PROGRAM.push({kind:'SET_SYMBOL',symbol:'${block.getFieldValue('SYMBOL')}'})\n`
    javascriptGenerator.forBlock['set_basis'] = (block:any) => `PROGRAM.push({kind:'SET_BASIS',basis:'${block.getFieldValue('BASIS')}'})\n`
    javascriptGenerator.forBlock['set_amount'] = (block:any) => `PROGRAM.push({kind:'SET_AMOUNT',amount:${Number(block.getFieldValue('AMOUNT'))}})\n`
    javascriptGenerator.forBlock['set_currency'] = (block:any) => `PROGRAM.push({kind:'SET_CURRENCY',currency:'${block.getFieldValue('CURRENCY')}'})\n`
    javascriptGenerator.forBlock['set_duration'] = (block:any) => `PROGRAM.push({kind:'SET_DURATION',duration:${Number(block.getFieldValue('DUR'))},unit:'${block.getFieldValue('UNIT')}'})\n`

    // Contract Type Generators
    javascriptGenerator.forBlock['contract_rise_fall'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'RISE_FALL'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'RISE_FALL'})\n`
    javascriptGenerator.forBlock['contract_higher_lower'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'HIGHER_LOWER'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'CALL'})\nPROGRAM.push({kind:'SET_BARRIER',barrier:'${block.getFieldValue('BARRIER')}'})\n`

    // Digits Contract Generators
    javascriptGenerator.forBlock['contract_digits_match'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'DIGITS'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'MATCH'})\nPROGRAM.push({kind:'SET_BARRIER',barrier:'${block.getFieldValue('DIGIT')}'})\n`
    javascriptGenerator.forBlock['contract_digits_differs'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'DIGITS'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'DIFFERS'})\nPROGRAM.push({kind:'SET_BARRIER',barrier:'${block.getFieldValue('DIGIT')}'})\n`
    javascriptGenerator.forBlock['contract_digits_even_odd'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'DIGITS'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'${block.getFieldValue('TYPE')}'})\n`
    javascriptGenerator.forBlock['contract_digits_over_under'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'DIGITS'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'${block.getFieldValue('TYPE')}'})\nPROGRAM.push({kind:'SET_BARRIER',barrier:'${block.getFieldValue('DIGIT')}'})\n`

    // Accumulators & Multipliers Generators
    javascriptGenerator.forBlock['contract_accumulator'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'ACCUMULATORS'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'ACCU'})\nPROGRAM.push({kind:'SET_BARRIER',barrier:'${block.getFieldValue('RATE')}'})\n`
    javascriptGenerator.forBlock['contract_multiplier'] = (block:any) => `PROGRAM.push({kind:'SET_CONTRACT_FAMILY',family:'MULTIPLIERS'})\nPROGRAM.push({kind:'SET_CONTRACT_TYPE',contract_type:'MULTUP'})\nPROGRAM.push({kind:'SET_AMOUNT',amount:${Number(block.getFieldValue('STAKE'))}})\nPROGRAM.push({kind:'SET_BARRIER',barrier:'${block.getFieldValue('MULT')}'})\n`

    // Trading Condition Generators
    javascriptGenerator.forBlock['trade_if_price'] = (block:any) => `PROGRAM.push({kind:'TRADE_IF_PRICE',operator:'${block.getFieldValue('OP')}',price:${Number(block.getFieldValue('PRICE'))}})\n`
    javascriptGenerator.forBlock['trade_if_ticks'] = (block:any) => `PROGRAM.push({kind:'TRADE_IF_TICKS',count:${Number(block.getFieldValue('COUNT'))},trend:'${block.getFieldValue('TREND')}'})\n`
    javascriptGenerator.forBlock['trade_if_indicator'] = (block:any) => `PROGRAM.push({kind:'TRADE_IF_INDICATOR',indicator:'${block.getFieldValue('INDICATOR')}',comparison:'${block.getFieldValue('COMP')}',value:${Number(block.getFieldValue('VALUE'))}})\n`

    // Technical Indicator Generators
    javascriptGenerator.forBlock['indicator_sma'] = (block:any) => `PROGRAM.push({kind:'INDICATOR_SMA',period:${Number(block.getFieldValue('PERIOD'))}})\n`
    javascriptGenerator.forBlock['indicator_ema'] = (block:any) => `PROGRAM.push({kind:'INDICATOR_EMA',period:${Number(block.getFieldValue('PERIOD'))}})\n`
    javascriptGenerator.forBlock['indicator_rsi'] = (block:any) => `PROGRAM.push({kind:'INDICATOR_RSI',period:${Number(block.getFieldValue('PERIOD'))}})\n`
    javascriptGenerator.forBlock['indicator_macd'] = (block:any) => `PROGRAM.push({kind:'INDICATOR_MACD',fastPeriod:${Number(block.getFieldValue('FAST'))},slowPeriod:${Number(block.getFieldValue('SLOW'))},signalPeriod:${Number(block.getFieldValue('SIGNAL'))}})\n`
    javascriptGenerator.forBlock['indicator_bollinger'] = (block:any) => `PROGRAM.push({kind:'INDICATOR_BOLLINGER',period:${Number(block.getFieldValue('PERIOD'))},stdDev:${Number(block.getFieldValue('STDDEV'))}})\n`
    javascriptGenerator.forBlock['indicator_stochastic'] = (block:any) => `PROGRAM.push({kind:'INDICATOR_STOCHASTIC',kPeriod:${Number(block.getFieldValue('K_PERIOD'))},dPeriod:${Number(block.getFieldValue('D_PERIOD'))}})\n`

    // Risk Management Generators
    javascriptGenerator.forBlock['stop_loss'] = (block:any) => `PROGRAM.push({kind:'STOP_LOSS',amount:${Number(block.getFieldValue('AMOUNT'))}})\n`
    javascriptGenerator.forBlock['take_profit'] = (block:any) => `PROGRAM.push({kind:'TAKE_PROFIT',amount:${Number(block.getFieldValue('AMOUNT'))}})\n`
    javascriptGenerator.forBlock['max_consecutive_losses'] = (block:any) => `PROGRAM.push({kind:'MAX_CONSECUTIVE_LOSSES',count:${Number(block.getFieldValue('COUNT'))}})\n`
    javascriptGenerator.forBlock['max_daily_trades'] = (block:any) => `PROGRAM.push({kind:'MAX_DAILY_TRADES',count:${Number(block.getFieldValue('COUNT'))}})\n`

    // Control Flow Generators
    javascriptGenerator.forBlock['wait_seconds'] = (block:any) => `PROGRAM.push({kind:'WAIT',seconds:${Number(block.getFieldValue('SECONDS'))}})\n`
    javascriptGenerator.forBlock['stop_after'] = (block:any) => `PROGRAM.push({kind:'STOP_AFTER',count:${Number(block.getFieldValue('COUNT'))}})\n`
    javascriptGenerator.forBlock['loop_until'] = (block:any) => `PROGRAM.push({kind:'LOOP_UNTIL',condition:'${block.getFieldValue('CONDITION')}'})\n`

    const toolbox = {"kind":"flyoutToolbox","contents":[
      // General Configuration
      {"kind":"label","text":"General Settings"},
      {"kind":"block","type":"set_symbol"},
      {"kind":"block","type":"set_basis"},
      {"kind":"block","type":"set_amount"},
      {"kind":"block","type":"set_currency"},
      {"kind":"block","type":"set_duration"},

      // Contract Types
      {"kind":"label","text":"Contract Types"},
      {"kind":"block","type":"contract_rise_fall"},
      {"kind":"block","type":"contract_higher_lower"},
      {"kind":"block","type":"contract_digits_match"},
      {"kind":"block","type":"contract_digits_differs"},
      {"kind":"block","type":"contract_digits_even_odd"},
      {"kind":"block","type":"contract_digits_over_under"},
      {"kind":"block","type":"contract_accumulator"},
      {"kind":"block","type":"contract_multiplier"},

      // Trading Conditions
      {"kind":"label","text":"Trading Conditions"},
      {"kind":"block","type":"trade_if_price"},
      {"kind":"block","type":"trade_if_ticks"},
      {"kind":"block","type":"trade_if_indicator"},

      // Technical Indicators
      {"kind":"label","text":"Technical Indicators"},
      {"kind":"block","type":"indicator_sma"},
      {"kind":"block","type":"indicator_ema"},
      {"kind":"block","type":"indicator_rsi"},
      {"kind":"block","type":"indicator_macd"},
      {"kind":"block","type":"indicator_bollinger"},
      {"kind":"block","type":"indicator_stochastic"},

      // Risk Management
      {"kind":"label","text":"Risk Management"},
      {"kind":"block","type":"stop_loss"},
      {"kind":"block","type":"take_profit"},
      {"kind":"block","type":"max_consecutive_losses"},
      {"kind":"block","type":"max_daily_trades"},

      // Control Flow
      {"kind":"label","text":"Control Flow"},
      {"kind":"block","type":"wait_seconds"},
      {"kind":"block","type":"stop_after"},
      {"kind":"block","type":"loop_until"}
    ]}

    const ws = Blockly.inject(divRef.current!, { toolbox, trashcan: true, grid: { spacing: 20, length: 3, colour: '#999', snap: true } })
    wsRef.current = ws

    const xmlText = localStorage.getItem(WORKSPACE_KEY)
    if (xmlText) { const dom = Blockly.utils.xml.textToDom(xmlText); Blockly.Xml.domToWorkspace(dom, ws) }

    const save = () => {
      const dom = Blockly.Xml.workspaceToDom(ws)
      const text = Blockly.Xml.domToText(dom)
      localStorage.setItem(WORKSPACE_KEY, text)
      const code = `var PROGRAM=[];\n` + javascriptGenerator.workspaceToCode(ws) + `return PROGRAM;`
      try {
        const fn = new Function(code)
        const prog = fn() as Program
        setProgram(prog)
      } catch (error) {
        console.error('Code generation failed:', error)
        setProgram([])
      }
    }
      ws.addChangeListener(save); save()
      setIsLoading(false)
      return () => ws.dispose()
    } catch (error) {
      console.error('Blockly initialization failed:', error)
      setIsLoading(false)
      setError(error instanceof Error ? error.message : 'Failed to initialize the visual builder')
      // Fallback: Show error message in the UI
      if (divRef.current) {
        divRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full text-center p-8">
            <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
              <h3 class="text-red-400 font-semibold mb-2">Blockly Initialization Failed</h3>
              <p class="text-sm text-gray-300 mb-4">
                The visual builder couldn't load. This might be due to missing dependencies or browser compatibility issues.
              </p>
              <button
                onclick="window.location.reload()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        `
      }
    }
  }, [])

  return (
    <main className="container py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">DBot‑style Builder</h2>
          {error ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
                <h3 className="text-red-400 font-semibold mb-2">Builder Failed to Load</h3>
                <p className="text-sm text-gray-300 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                >
                  Reload Page
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading Visual Builder...</p>
              </div>
            </div>
          ) : (
            <div ref={divRef} style={{ minHeight: 520 }} />
          )}
        </section>
        <section className="card space-y-3">
          <h3 className="text-lg font-semibold">Program Preview</h3>
          <pre className="h-48 overflow-auto rounded-xl bg-black/30 p-3 text-xs">{JSON.stringify(program, null, 2)}</pre>
          <SaveLoad program={program} />
          <RunButtons program={program} />
          <p className="text-xs opacity-70">Tip: Add symbol → amount/basis → duration → contract type → a trade rule → wait/stop controls.</p>
        </section>
      </div>
    </main>
  )
}

function RunButtons({ program }: { program: Program }) {
  const [running, setRunning] = useState(false)

  const handleRun = () => {
    if (program.length === 0) {
      alert('Please build a strategy first by adding blocks to the workspace.')
      return
    }
    try {
      runProgram(program)
      setRunning(true)
    } catch (error) {
      console.error('Failed to run program:', error)
      alert('Failed to run the strategy. Please check your program configuration.')
    }
  }

  return (
    <div className="flex gap-2">
      {running ? (
        <button className="rounded-xl bg-rose-600 px-3 py-2 hover:bg-rose-700" onClick={() => { setRunning(false) }}>Stop</button>
      ) : (
        <button
          className="rounded-xl bg-emerald-600 px-3 py-2 hover:bg-emerald-700 disabled:bg-gray-600"
          onClick={handleRun}
          disabled={program.length === 0}
        >
          Run
        </button>
      )}
    </div>
  )
}

function SaveLoad({ program }: { program: any }) {
  const [name, setName] = useState('my-bot')

  const saveNamed = () => {
    try {
      if (program.length === 0) {
        alert('Please build a strategy first before saving.')
        return
      }
      localStorage.setItem('bot:'+name, JSON.stringify(program))
      alert('Saved as ' + name)
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save the strategy. Please try again.')
    }
  }

  const loadNamed = () => {
    try {
      const txt = localStorage.getItem('bot:'+name)
      if (!txt) {
        alert('No saved bot with that name')
        return
      }
      localStorage.setItem('dbot_style_workspace_xml', '')
      alert('Loaded program JSON into slot; JSON→Blocks rehydrate can be added next.')
    } catch (error) {
      console.error('Load failed:', error)
      alert('Failed to load the strategy. Please try again.')
    }
  }
  const exportJSON = () => {
    try {
      if (program.length === 0) {
        alert('Please build a strategy first before exporting.')
        return
      }
      const blob = new Blob([JSON.stringify(program, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name + '.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export the strategy. Please try again.')
    }
  }

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result))
        localStorage.setItem('bot:'+name, JSON.stringify(obj))
        alert('Imported into '+name)
        // Reload the page to refresh the workspace
        window.location.reload()
      } catch (error) {
        console.error('Import failed:', error)
        alert('Invalid JSON file. Please check the file format.')
      }
    }
    reader.readAsText(f)
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input className="rounded-xl border border-white/10 bg-black/20 p-2 text-sm" value={name} onChange={(e)=>setName(e.target.value)} />
        <button className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={saveNamed}>Save</button>
        <button className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={loadNamed}>Load</button>
        <button className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={exportJSON}>Export</button>
        <label className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20 cursor-pointer">Import<input type="file" className="hidden" onChange={importJSON} /></label>
      </div>
    </div>
  )
}
