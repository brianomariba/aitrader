'use client'
import { useEffect } from 'react'
import { ConnectionPanel } from './(components)/ui/ConnectionPanel'
import { MarketPanel } from './(components)/ui/MarketPanel'
import { TradePanel } from './(components)/ui/TradePanel'
import { OpenContractPanel } from './(components)/ui/OpenContractPanel'
import { useDerivStore } from './state/derivStore'

export default function HomePage() {
  const { connect, appId } = useDerivStore()
  useEffect(() => { if (appId) connect() }, [appId, connect])

  return (
    <main className="fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        {/* Connection & Account Status */}
        <div className="card">
          <ConnectionPanel />
        </div>

        {/* Market Data & Chart */}
        <div className="card">
          <MarketPanel />
        </div>

        {/* Trading Controls */}
        <div className="space-y-6">
          <div className="card">
            <TradePanel />
          </div>
          <div className="card">
            <OpenContractPanel />
          </div>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="mt-6 px-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">Market Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">—</div>
              <div className="text-sm text-gray-400">Active Symbols</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">—</div>
              <div className="text-sm text-gray-400">Open Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">—</div>
              <div className="text-sm text-gray-400">Today&apos;s P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">—</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
