'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useDerivStore } from '@/state/derivStore'
import {
  Play,
  Square,
  Settings,
  BarChart3,
  TrendingUp,
  History,
  Menu,
  X,
  Zap
} from 'lucide-react'

export function DBotHeader() {
  const { connected, bot, account, startBot, stopBot, emergencyStop } = useDerivStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: BarChart3 },
    { name: 'Builder', href: '/builder', icon: Settings },
    { name: 'Bot Runner', href: '/runner', icon: Play },
    { name: 'Testing', href: '/testing', icon: TrendingUp },
    { name: 'Portfolio', href: '/portfolio', icon: TrendingUp },
    { name: 'History', href: '/history', icon: History },
  ]

  return (
    <header className="workspace-header">
      {/* Logo and Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="AI Trader Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <h1 className="text-xl font-bold">AI Trader</h1>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </a>
        ))}
      </nav>

      {/* Status and Controls */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={connected ? 'status-connected' : 'status-disconnected'}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Account Info */}
        {account && (
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-300">
            <span>{account.loginid}</span>
            <span className="text-xs">•</span>
            <span className="profit-positive">${account.balance?.toFixed(2)}</span>
          </div>
        )}

        {/* Bot Controls */}
        <div className="flex items-center gap-2">
          {bot.enabled ? (
            <button
              onClick={stopBot}
              className="btn-secondary flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Bot
            </button>
          ) : (
            <button
              onClick={startBot}
              className="btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Bot
            </button>
          )}

          <button
            onClick={emergencyStop}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden lg:inline">Panic</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border-t border-gray-700 md:hidden">
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile Account Info */}
          {account && (
            <div className="px-4 py-2 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span>{account.loginid}</span>
                <span className="profit-positive">${account.balance?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
