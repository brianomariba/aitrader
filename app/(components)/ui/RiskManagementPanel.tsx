'use client'
import { useState } from 'react'
import { useDerivStore } from '@/state/derivStore'
import { Shield, AlertTriangle, TrendingDown, Activity, Zap } from 'lucide-react'

export function RiskManagementPanel() {
  const {
    riskSettings,
    riskStats,
    account,
    updateRiskSettings,
    emergencyStop,
    resetDailyStats
  } = useDerivStore()

  const [isEditing, setIsEditing] = useState(false)
  const [tempSettings, setTempSettings] = useState(riskSettings)

  const handleSave = () => {
    updateRiskSettings(tempSettings)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempSettings(riskSettings)
    setIsEditing(false)
  }

  const getRiskLevel = () => {
    if (riskStats.dailyTrades >= riskSettings.maxDailyTrades) return 'high'
    if (riskStats.consecutiveLosses >= riskSettings.maxConsecutiveLosses) return 'high'
    if (Math.abs(riskStats.dailyPnL) >= riskSettings.dailyStopLoss * 0.8) return 'medium'
    return 'low'
  }

  const riskLevel = getRiskLevel()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Management
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 text-sm"
          >
            {isEditing ? 'Cancel' : 'Configure'}
          </button>
          <button
            onClick={emergencyStop}
            className="rounded-xl bg-red-600 px-3 py-2 hover:bg-red-700 text-sm font-semibold flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            PANIC STOP
          </button>
        </div>
      </div>

      {/* Risk Level Indicator */}
      <div className="rounded-xl bg-black/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              riskLevel === 'high' ? 'bg-red-500' :
              riskLevel === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`} />
            <span className="text-sm font-medium">
              Risk Level: {riskLevel.toUpperCase()}
            </span>
          </div>
          <div className="text-xs opacity-70">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className={`text-2xl font-bold ${
            Math.abs(riskStats.dailyPnL) >= riskSettings.dailyStopLoss ? 'text-red-400' :
            riskStats.dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {riskStats.dailyPnL.toFixed(2)}
          </div>
          <div className="text-xs opacity-70">Daily P&L</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className={`text-2xl font-bold ${
            riskStats.consecutiveLosses >= riskSettings.maxConsecutiveLosses ? 'text-red-400' : 'text-white'
          }`}>
            {riskStats.consecutiveLosses}
          </div>
          <div className="text-xs opacity-70">Consecutive Losses</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className={`text-2xl font-bold ${
            riskStats.dailyTrades >= riskSettings.maxDailyTrades ? 'text-red-400' : 'text-white'
          }`}>
            {riskStats.dailyTrades}
          </div>
          <div className="text-xs opacity-70">Daily Trades</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {(account?.balance || 0).toFixed(2)}
          </div>
          <div className="text-xs opacity-70">Account Balance</div>
        </div>
      </div>

      {/* Risk Settings */}
      {isEditing ? (
        <div className="rounded-xl bg-black/20 p-4 space-y-4">
          <h4 className="font-semibold">Risk Settings</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm opacity-80">Daily Stop Loss ($)</label>
              <input
                type="number"
                className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-2"
                value={tempSettings.dailyStopLoss}
                onChange={(e) => setTempSettings(s => ({ ...s, dailyStopLoss: Number(e.target.value) }))}
                min="0"
                step="1"
              />
            </div>

            <div>
              <label className="text-sm opacity-80">Equity Protection (%)</label>
              <input
                type="number"
                className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-2"
                value={tempSettings.equityProtection}
                onChange={(e) => setTempSettings(s => ({ ...s, equityProtection: Number(e.target.value) }))}
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div>
              <label className="text-sm opacity-80">Max Consecutive Losses</label>
              <input
                type="number"
                className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-2"
                value={tempSettings.maxConsecutiveLosses}
                onChange={(e) => setTempSettings(s => ({ ...s, maxConsecutiveLosses: Number(e.target.value) }))}
                min="1"
                step="1"
              />
            </div>

            <div>
              <label className="text-sm opacity-80">Max Daily Trades</label>
              <input
                type="number"
                className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-2"
                value={tempSettings.maxDailyTrades}
                onChange={(e) => setTempSettings(s => ({ ...s, maxDailyTrades: Number(e.target.value) }))}
                min="1"
                step="1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tempSettings.enabled}
                onChange={(e) => setTempSettings(s => ({ ...s, enabled: e.target.checked }))}
                className="rounded"
              />
              Enable Risk Management
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 px-4 py-2 hover:bg-emerald-700"
            >
              Save Settings
            </button>
            <button
              onClick={handleCancel}
              className="rounded-xl bg-gray-600 px-4 py-2 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={resetDailyStats}
              className="rounded-xl bg-orange-600 px-4 py-2 hover:bg-orange-700"
            >
              Reset Daily Stats
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-black/20 p-4">
          <h4 className="font-semibold mb-3">Current Risk Limits</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Daily Stop Loss: <span className="font-medium">${riskSettings.dailyStopLoss}</span></div>
            <div>Equity Protection: <span className="font-medium">{riskSettings.equityProtection}%</span></div>
            <div>Max Consecutive Losses: <span className="font-medium">{riskSettings.maxConsecutiveLosses}</span></div>
            <div>Max Daily Trades: <span className="font-medium">{riskSettings.maxDailyTrades}</span></div>
            <div className="col-span-2">
              Risk Management: <span className={`font-medium ${riskSettings.enabled ? 'text-emerald-400' : 'text-red-400'}`}>
                {riskSettings.enabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Risk Alerts */}
      {riskLevel === 'high' && (
        <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-semibold">High Risk Alert</span>
          </div>
          <div className="text-sm mt-1">
            Risk limits are being approached or exceeded. Consider stopping trading or adjusting risk settings.
          </div>
        </div>
      )}

      <div className="text-xs opacity-60 text-center">
        Risk management helps protect your capital. Always test with virtual money first.
      </div>
    </div>
  )
}
