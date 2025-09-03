'use client'
import { useEffect } from 'react'
import { useDerivStore } from '@/state/derivStore'
import { TickChart } from '../charts/TickChart'

export function MarketPanel() {
  const { symbols, selectedSymbol, subscribeTicks, lastTicks, fetchActiveSymbols } = useDerivStore()
  useEffect(() => { if (symbols.length === 0) fetchActiveSymbols() }, [symbols.length, fetchActiveSymbols])
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Market Data</h2>
      </div>

      {/* Symbol Selection */}
      <div className="space-y-3">
        <label className="text-sm text-gray-400 font-medium">Select Symbol</label>
        <select
          className="select-field w-full"
          value={selectedSymbol || ''}
          onChange={(e) => subscribeTicks(e.target.value)}
        >
          <option value="" disabled>Choose a market symbol</option>
          {symbols.map((s) => (
            <option key={s.symbol} value={s.symbol}>
              {s.display_name} ({s.symbol})
            </option>
          ))}
        </select>

        {selectedSymbol && (
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Selected:</span>
              <span className="text-white font-medium">{selectedSymbol}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-300">Data Points:</span>
              <span className="text-blue-400">{lastTicks.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Price Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Live Chart</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedSymbol ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-400">
              {selectedSymbol ? 'Live' : 'Waiting for symbol'}
            </span>
          </div>
        </div>
        <TickChart data={lastTicks} />
      </div>

      {/* Market Info */}
      {selectedSymbol && lastTicks.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Market Info</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Current Price:</span>
              <div className="text-white font-medium">
                ${lastTicks[lastTicks.length - 1]?.v.toFixed(5)}
              </div>
            </div>
            <div>
              <span className="text-gray-400">24h Change:</span>
              <div className="text-green-400 font-medium">+2.34%</div>
            </div>
            <div>
              <span className="text-gray-400">Volume:</span>
              <div className="text-blue-400 font-medium">1.2M</div>
            </div>
            <div>
              <span className="text-gray-400">Market:</span>
              <div className="text-purple-400 font-medium">Forex</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
