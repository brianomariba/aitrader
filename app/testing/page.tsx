'use client'
import { useState } from 'react'
import { StrategyTestingPanel } from '../(components)/testing/StrategyTestingPanel'
import { StrategyOptimizationPanel } from '../(components)/testing/StrategyOptimizationPanel'
import { PerformanceAnalytics } from '../(components)/testing/PerformanceAnalytics'
import { MonteCarloSimulation } from '../(components)/testing/MonteCarloSimulation'
import { BarChart3, Zap, TrendingUp, Settings, Dice6, Target } from 'lucide-react'

export default function TestingPage() {
  const [activeTab, setActiveTab] = useState<'backtest' | 'optimization' | 'analytics' | 'montecarlo'>('backtest')

  const tabs = [
    {
      id: 'backtest' as const,
      name: 'Strategy Testing',
      icon: BarChart3,
      description: 'Test your strategy against historical data'
    },
    {
      id: 'optimization' as const,
      name: 'Parameter Optimization',
      icon: Zap,
      description: 'Find optimal parameters for maximum performance'
    },
    {
      id: 'analytics' as const,
      name: 'Performance Analytics',
      icon: Target,
      description: 'Detailed performance metrics and analysis'
    },
    {
      id: 'montecarlo' as const,
      name: 'Monte Carlo Simulation',
      icon: Dice6,
      description: 'Risk analysis through simulation'
    }
  ]

  return (
    <main className="fade-in">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Strategy Testing & Optimization</h1>
          <p className="text-gray-400">
            Comprehensive backtesting and optimization tools to validate and improve your trading strategies
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs opacity-70">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'backtest' && <StrategyTestingPanel />}
          {activeTab === 'optimization' && <StrategyOptimizationPanel />}
          {activeTab === 'analytics' && <PerformanceAnalytics results={[]} />}
          {activeTab === 'montecarlo' && <MonteCarloSimulation />}
        </div>

        {/* Features Overview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Historical Testing</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Test your strategies against historical market data with realistic commission and slippage
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Parameter Optimization</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Automatically find optimal strategy parameters using advanced optimization algorithms
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Detailed performance metrics including Sharpe ratio, win rate, drawdown analysis, and risk metrics
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Dice6 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Monte Carlo Simulation</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Risk analysis through thousands of simulations to assess strategy robustness
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="text-yellow-400 font-medium mb-2">Important Disclaimer</h4>
              <div className="text-sm text-yellow-300 space-y-1">
                <p>• Past performance does not guarantee future results</p>
                <p>• Backtesting uses historical data and may not reflect real market conditions</p>
                <p>• Always test strategies with virtual money before live trading</p>
                <p>• Risk management is crucial - never risk more than you can afford to lose</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
