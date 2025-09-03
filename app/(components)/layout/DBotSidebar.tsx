'use client'
import { useDerivStore } from '@/state/derivStore'
import {
  BarChart3,
  Settings,
  Play,
  TrendingUp,
  History,
  Zap,
  Target,
  Shield,
  Activity,
  Users
} from 'lucide-react'

export function DBotSidebar() {
  const { connected, bot, account } = useDerivStore()

  const tools = [
    { name: 'Dashboard', href: '/', icon: BarChart3, active: true },
    { name: 'Strategy Builder', href: '/builder', icon: Settings },
    { name: 'Bot Runner', href: '/runner', icon: Play },
    { name: 'Portfolio', href: '/portfolio', icon: TrendingUp },
    { name: 'Trade History', href: '/history', icon: History },
  ]

  const quickStats = [
    {
      label: 'Bot Status',
      value: bot.enabled ? 'Running' : 'Stopped',
      color: bot.enabled ? 'text-green-400' : 'text-gray-400',
      icon: Activity
    },
    {
      label: 'Trades Today',
      value: '0',
      color: 'text-blue-400',
      icon: Target
    },
    {
      label: 'Win Rate',
      value: '0%',
      color: 'text-green-400',
      icon: TrendingUp
    },
    {
      label: 'Risk Level',
      value: 'Low',
      color: 'text-green-400',
      icon: Shield
    }
  ]

  return (
    <aside className="workspace-sidebar">
      {/* Tools Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Tools
        </h3>
        <nav className="space-y-1">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              <tool.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
              <span className="text-gray-300 group-hover:text-white">{tool.name}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        <div className="space-y-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center">
                <stat.icon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-300">{stat.label}</span>
              </div>
              <span className={`text-sm font-medium ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      {account && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </h3>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-white">{account.loginid}</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">
              {account.currency} Account
            </div>
            <div className="text-lg font-bold text-green-400">
              ${account.balance?.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Connection
        </h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {connected && (
          <div className="mt-2 text-xs text-gray-400">
            WebSocket Active
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full btn-secondary text-left">
            <Zap className="w-4 h-4 inline mr-2" />
            Reset Workspace
          </button>
          <button className="w-full btn-secondary text-left">
            <Shield className="w-4 h-4 inline mr-2" />
            Risk Settings
          </button>
        </div>
      </div>
    </aside>
  )
}
