'use client'
import { useState } from 'react'
import { useDerivStore } from '@/state/derivStore'

export function TradePanel() {
  const { selectedSymbol, requestProposal, proposal, buyFromProposal } = useDerivStore()
  const [amount, setAmount] = useState(1)
  const [basis, setBasis] = useState<'stake' | 'payout'>('stake')
  const [currency, setCurrency] = useState('USD')
  const [duration, setDuration] = useState(3)
  const [durationUnit, setDurationUnit] = useState<'t' | 'm' | 'h' | 'd'>('m')
  const [contractType, setContractType] = useState('CALL')

  const canRequest = !!selectedSymbol
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Trade</h2>
      </div>

      {/* Trade Parameters */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 font-medium">Contract Type</label>
          <select
            className="select-field w-full mt-2"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
          >
            <option value="CALL">Higher (CALL)</option>
            <option value="PUT">Lower (PUT)</option>
            <option value="RISE">Rise</option>
            <option value="FALL">Fall</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 font-medium">Amount</label>
            <input
              className="input-field w-full mt-2"
              type="number"
              min={0.35}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 font-medium">Basis</label>
            <select
              className="select-field w-full mt-2"
              value={basis}
              onChange={(e) => setBasis(e.target.value as any)}
            >
              <option value="stake">Stake</option>
              <option value="payout">Payout</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 font-medium">Duration</label>
            <input
              className="input-field w-full mt-2"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 font-medium">Unit</label>
            <select
              className="select-field w-full mt-2"
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value as any)}
            >
              <option value="t">Ticks</option>
              <option value="s">Seconds</option>
              <option value="m">Minutes</option>
              <option value="h">Hours</option>
              <option value="d">Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trade Action */}
      <button
        className="btn-primary w-full py-3 text-base font-medium"
        disabled={!canRequest}
        onClick={() => {
          if (!selectedSymbol) return
          requestProposal({
            symbol: selectedSymbol,
            amount,
            basis,
            contract_type: contractType,
            currency,
            duration,
            duration_unit: durationUnit
          })
        }}
      >
        {canRequest ? 'Request Proposal' : 'Select a symbol first'}
      </button>

      {/* Proposal Display */}
      {proposal && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Trade Proposal</h4>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Proposal ID:</span>
              <div className="text-white font-mono text-xs mt-1">{proposal.id}</div>
            </div>
            <div>
              <span className="text-gray-400">Ask Price:</span>
              <div className="text-orange-400 font-medium mt-1">${proposal.ask_price}</div>
            </div>
          </div>

          {proposal.display_value && (
            <div className="text-sm">
              <span className="text-gray-400">Payout:</span>
              <div className="text-green-400 font-medium mt-1">{proposal.display_value}</div>
            </div>
          )}

          <button
            className="btn-primary w-full"
            onClick={() => buyFromProposal(proposal.ask_price || 0)}
          >
            Buy Contract
          </button>
        </div>
      )}

      {/* Contract Types Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs">i</span>
          </div>
          <div className="text-xs text-blue-400">
            <div className="font-medium mb-1">Available Contract Types:</div>
            <div className="space-y-1">
              <div>• <strong>Rise/Fall:</strong> Predict price movement</div>
              <div>• <strong>Higher/Lower:</strong> Price above/below barrier</div>
              <div>• <strong>Digits:</strong> Last digit prediction</div>
              <div>• <strong>Accumulators:</strong> Growing stake contracts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
