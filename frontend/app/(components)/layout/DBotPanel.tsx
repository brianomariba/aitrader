'use client'
import { useDerivStore } from '@/state/derivStore'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export function DBotPanel() {
  const store = useDerivStore()

  const recentLogs = store.log.slice(-5).reverse()

  const stats = [
    {
      label: 'Total Trades',
      value: store.botStats.trades.toString(),
      icon: Target,
      color: 'text-blue-400'
    },
    {
      label: 'Win Rate',
      value: store.botStats.trades > 0 ? `${Math.round((store.botStats.wins / store.botStats.trades) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Daily P&L',
      value: `$${store.riskStats.dailyPnL.toFixed(2)}`,
      icon: DollarSign,
      color: store.riskStats.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      label: 'Consecutive Losses',
      value: store.riskStats.consecutiveLosses.toString(),
      icon: TrendingDown,
      color: store.riskStats.consecutiveLosses > 0 ? 'text-red-400' : 'text-gray-400'
    }
  ]

  return (
    <aside className="workspace-panel">
      {/* Trading Statistics */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Trading Stats
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <stat.icon className={`h-5 w-5 mr-3 ${stat.color}`} />
                  <span className="text-sm text-gray-300">{stat.label}</span>
                </div>
                <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bot Status */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Bot Status
        </h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">Status</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${store.bot.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className={`text-sm font-medium ${store.bot.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                {store.bot.enabled ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>

          {store.bot.enabled && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Symbol</span>
                <span className="text-sm font-medium text-white">{store.bot.symbol || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Amount</span>
                <span className="text-sm font-medium text-white">{store.bot.amount} {store.bot.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Duration</span>
                <span className="text-sm font-medium text-white">{store.bot.duration}{store.bot.duration_unit}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Risk Monitor */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Risk Monitor
        </h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Risk Level</span>
              <span className={`text-sm font-medium ${
                store.riskStats.consecutiveLosses >= 3 ? 'text-red-400' :
                store.riskStats.dailyTrades >= 5 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {store.riskStats.consecutiveLosses >= 3 ? 'High' :
                 store.riskStats.dailyTrades >= 5 ? 'Medium' : 'Low'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Daily Limit</span>
              <span className="text-sm font-medium text-white">
                {store.riskStats.dailyTrades} / 10
              </span>
            </div>

            {store.account && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Balance</span>
                <span className="text-sm font-medium profit-positive">
                  ${store.account.balance?.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentLogs.length > 0 ? (
            recentLogs.map((entry, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {entry.includes('Bought') || entry.includes('Sold') ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : entry.includes('Error') || entry.includes('Failed') ? (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-tight">{entry}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Activity className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center">
        <p>DBot - Automated Trading</p>
        <p className="mt-1">Use Virtual account for testing</p>
      </div>
    </aside>
  )
}
