'use client'
import { useEffect } from 'react'
import { useDerivStore } from '@/state/derivStore'
import { ProfitTable } from '../(components)/ui/ProfitTable'

export default function HistoryPage() {
  const { fetchProfitTable } = useDerivStore()
  useEffect(() => { fetchProfitTable(50) }, [fetchProfitTable])

  return (
    <main className="container py-6">
      <div className="card">
        <ProfitTable />
      </div>
    </main>
  )
}
