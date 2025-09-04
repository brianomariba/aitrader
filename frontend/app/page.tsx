'use client'
import { useEffect } from 'react'
import Image from 'next/image'
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
      {/* Hero Section with Logo */}
      <div className="mb-8 px-6">
        <div className="card text-center py-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="AI Trader Logo"
              width={80}
              height={80}
              className="rounded-xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Welcome to AI Trader
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Professional automated trading platform powered by Deriv API.
            Build strategies visually, test thoroughly, and trade automatically with advanced risk management.
          </p>
        </div>
      </div>

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
