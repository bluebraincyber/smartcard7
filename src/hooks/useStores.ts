'use client'

import { useState, useEffect } from 'react'

interface Store {
  id: string
  name: string
  slug: string
  isActive: boolean
  categories?: number
  products?: number
  views30d?: number
  updatedAt?: string
}

export function useStores() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stores')
      
      if (!response.ok) {
        throw new Error('Falha ao buscar lojas')
      }
      
      const data = await response.json()
      const mappedStores = (data.stores || []).map((store: any) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
        isActive: store.isActive ?? store.isactive ?? true,
        categories: store._count?.categories || 0,
        products: store._count?.products || 0,
        views30d: store.views30d || 0,
        updatedAt: store.updatedAt || store.updated_at
      }))
      
      setStores(mappedStores)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar lojas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const hasMultipleStores = stores.length > 1

  return {
    stores,
    loading,
    error,
    hasMultipleStores,
    refetch: fetchStores
  }
}