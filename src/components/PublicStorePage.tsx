'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { MapPin, Phone, MessageCircle, ShoppingCart, Plus, Minus } from 'lucide-react'

/**
 * Interfaces de dados para a loja, categorias e itens.
 * Elas garantem que a estrutura dos dados seja previsível e consistente em toda a aplicação.
 */
interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  whatsapp: string
  address: string | null
  primaryColor: string
  coverImage?: string
  profileImage?: string
  categories: Category[]
}

interface Category {
  id: string
  name: string
  storeid: string
  items: Item[]
}

interface Item {
  id: string
  name: string
  description: string | null
  price: number | null
  categoryId: string
  imageUrl?: string
  isactive?: boolean
  isarchived?: boolean
}

interface CartItem extends Item {
  quantity: number
}

interface PublicStorePageProps {
  store: Store
}

/**
 * Funções utilitárias para formatação e manipulação de dados, mantendo o código
 * principal mais limpo e focado na lógica do componente.
 */
const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const normalizeWhats = (raw: string) => {
  const digits = (raw || '').replace(/\D/g, '')
  // Garante que o DDI 55 esteja presente apenas uma vez.
  return digits.startsWith('55') ? digits : `55${digits}`
}

const isAvailable = (item: Item) => item.isarchived !== true && item.isactive !== false

/**
 * Componente principal para a loja virtual pública.
 * Ele gerencia o estado da loja, o carrinho de compras e a interação do utilizador.
 */
export default function PublicStorePage({ store }: PublicStorePageProps) {
  // 1) Inicialização dos estados (sempre na parte superior do componente)
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined' && store?.id) {
      const savedCart = localStorage.getItem(`cart_${store.id}`)
      console.log('Carregando carrinho do localStorage:', savedCart)
      return savedCart ? JSON.parse(savedCart) : []
    }
    return []
  })
  
  const [isCartOpen, setIsCartOpen] = useState(false)
  const safeCategories = Array.isArray(store?.categories) ? store.categories : []
  
  // 2) Efeitos colaterais
  useEffect(() => {
    if (typeof window !== 'undefined' && cart.length > 0 && store?.id) {
      console.log('Salvando carrinho no localStorage:', cart)
      localStorage.setItem(`cart_${store.id}`, JSON.stringify(cart))
    }
  }, [cart, store?.id])
  
  // 3) Validação de dados de entrada (após os Hooks)
  if (!store || !store.id || !store.name) {
    console.error('❌ Invalid store data:', store)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-foreground mb-2">Erro ao carregar loja</h2>
          <p className="text-muted-foreground">Os dados da loja estão incompletos.</p>
        </div>
      </div>
    )
  }
  
  // 4) Análise de dados (evita duplicação no StrictMode de desenvolvimento).
  // A ref é usada para garantir que o efeito seja executado apenas uma vez.
  const trackedRef = useRef(false)
  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true

    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeid: store.id,
            event: 'visit',
            data: { page: 'store', slug: store.slug },
          }),
        })
      } catch (error) {
        console.error('Error tracking visit:', error)
      }
    }

    trackVisit()
  }, [store.id, store.slug])

  // 4) Gestão do carrinho de compras usando React hooks.
  const addToCart = useCallback((item: Item) => {
    console.log('Tentando adicionar ao carrinho:', item)
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.id === item.id)
      let newCart;
      
      if (idx >= 0) {
        newCart = [...prev]
        newCart[idx] = { ...newCart[idx], quantity: newCart[idx].quantity + 1 }
      } else {
        newCart = [...prev, { ...item, quantity: 1 }]
      }
      
      console.log('Item adicionado ao carrinho:', item.name)
      console.log('Novo estado do carrinho:', newCart)
      
      return newCart
    })
    
    // Não abre mais o carrinho automaticamente
    // O usuário pode abrir o carrinho quando quiser
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.id === itemId)
      if (idx >= 0) {
        const item = prev[idx]
        if (item.quantity > 1) {
          const next = [...prev]
          next[idx] = { ...item, quantity: item.quantity - 1 }
          return next
        }
        return prev.filter(ci => ci.id !== itemId)
      }
      return prev
    })
  }, [])

  // Memoriza o valor total do carrinho para evitar recálculos desnecessários.
  const cartTotal = useMemo(
    () => cart.reduce((t, i) => t + ((i.price || 0) * i.quantity), 0),
    [cart]
  )

  // Memoriza a contagem total de itens no carrinho.
  const cartCount = useMemo(
    () => cart.reduce((t, i) => t + i.quantity, 0),
    [cart]
  )

  // 5) Funções auxiliares do WhatsApp para enviar pedidos e consultas.
  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return ''

    const when = new Date()
    const currentDate = when.toLocaleDateString('pt-BR')
    const currentTime = when.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    let message = `🛍️ *NOVO PEDIDO - ${store.name}*\n`
    message += `📅 ${currentDate} às ${currentTime}\n\n`
    message += `📋 *ITENS DO PEDIDO:*\n`

    cart.forEach((item, index) => {
      const itemPrice = Number(item.price || 0)
      message += `${index + 1}. ${item.name}\n`
      if (item.description) message += `   _${item.description}_\n`
      message += `   Qtd: ${item.quantity}x | Valor: ${formatBRL(itemPrice)}\n`
      message += `   Subtotal: ${formatBRL(itemPrice * item.quantity)}\n\n`
    })

    message += `💰 *TOTAL DO PEDIDO: ${formatBRL(cartTotal)}*\n\n`
    message += `✅ Confirma o pedido?`

    return encodeURIComponent(message)
  }

  const trackWhatsClick = async (data: Record<string, unknown>) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeid: store.id, event: 'whatsapp_click', data }),
      })
    } catch (error) {
      console.error('Error tracking analytics:', error)
    }
  }

  const sendWhatsAppOrder = async () => {
    const message = generateWhatsAppMessage()
    if (!message) return
    const number = normalizeWhats(store.whatsapp)
    const url = `https://wa.me/${number}?text=${message}`
    await trackWhatsClick({ type: 'order', itemCount: cartCount, totalValue: cartTotal })
    window.open(url, '_blank')
  }

  const sendWhatsAppInquiry = async (type: 'general' | 'catalog' = 'general') => {
    const baseMsg =
      type === 'catalog'
        ? `Olá! Gostaria de saber mais sobre os produtos da ${store.name}`
        : `Olá! Gostaria de saber mais sobre a ${store.name}`
    const number = normalizeWhats(store.whatsapp)
    const url = `https://wa.me/${number}?text=${encodeURIComponent(baseMsg)}`
    await trackWhatsClick({ type })
    window.open(url, '_blank')
  }

  // 6) A estrutura de renderização do componente.
  return (
    <div className="min-h-screen bg-white font-[Inter]">
      
      {/* Secção Hero da Loja, com tratamento para imagens e fallback. */}
      <div className="relative">
        {/* Imagem de Capa */}
        {store.coverImage ? (
          <div className="h-32 sm:h-48 md:h-64 bg-gray-200 overflow-hidden relative">
            <img
              src={store.coverImage.startsWith('/') ? `/api${store.coverImage}` : store.coverImage}
              alt={`Capa da ${store.name}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                console.error('Erro ao carregar imagem de capa:', store.coverImage)
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.classList.add('opacity-100')
              }}
            />
            {/* Conteúdo de fallback (oculto por padrão, mostrado em caso de erro) */}
            <div className="absolute inset-0 bg-blue-500 flex items-center justify-center opacity-0 transition-opacity duration-300">
              <div className="text-center text-white px-4">
                <div className="bg-white p-2 sm:p-4 rounded-full mb-2 sm:mb-4 inline-block">
                  <svg className="h-8 w-8 sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold">{store.name}</h2>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-32 sm:h-48 md:h-64 bg-blue-500 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <div className="bg-white p-2 sm:p-4 rounded-full mb-2 sm:mb-4 inline-block">
                <svg className="h-8 w-8 sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">{store.name}</h2>
            </div>
          </div>
        )}

        {/* Cartão de Informações da Loja */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="bg-white -mt-8 sm:-mt-12 relative z-10 rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-5 sm:p-8">
              <div className="flex items-start space-x-4 sm:space-x-6">
                {/* Imagem de Perfil */}
                <div className="flex-shrink-0">
                  {store.profileImage ? (
                    <img
                      src={store.profileImage.startsWith('/') ? `/api${store.profileImage}` : store.profileImage}
                      alt={`Logo da ${store.name}`}
                      width={80}
                      height={80}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem de perfil:', store.profileImage)
                        // Oculta a imagem e mostra o fallback.
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  {/* Fallback está sempre presente */}
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg"
                      style={{ display: store.profileImage ? 'none' : 'flex' }}
                    >
                      <svg className="h-10 w-10 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                    </svg>
                  </div>
                </div>

                {/* Detalhes da Loja */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
                  {store.description && (
                    <p className="text-muted-foreground text-sm sm:text-base mb-4 leading-relaxed">{store.description}</p>
                  )}

                  {/* Informações de contato e endereço */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-sm text-muted-foreground">
                    {store.address && (
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-lg bg-blue-100 mr-2">
                          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <span className="truncate">{store.address}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                        <div className="p-1.5 rounded-lg bg-green-100 mr-2">
                        <Phone className="h-4 w-4 text-success" aria-hidden="true" />
                      </div>
                      <span>{store.whatsapp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias e Itens da loja */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {safeCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Catálogo em construção</h3>
            <p className="text-muted-foreground mb-4">Em breve teremos produtos disponíveis aqui!</p>
            <button
              onClick={() => sendWhatsAppInquiry('catalog')}
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-success to-success/90 text-white rounded-2xl hover:from-success/90 hover:to-success/80 transition-all duration-300 text-sm sm:text-base font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <MessageCircle className="h-5 w-5 mr-2" aria-hidden="true" />
              Falar no WhatsApp
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {safeCategories.map(category => {
                const safeItems = Array.isArray(category.items) ? category.items : []
                const available = safeItems.filter(isAvailable)

                return (
                  <div key={category.id} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">{category.name}</h2>
                    {available.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhum item disponível nesta categoria</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {available.map(item => (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                          >
                            <div className="flex items-start space-x-4">
                              {/* Imagem do Produto com fallback */}
                              <div className="flex-shrink-0">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200"
                                  style={{ display: item.imageUrl ? 'none' : 'flex' }}
                                >
                                  <svg className="h-10 w-10 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                                  </svg>
                                </div>
                              </div>

                              {/* Informações e controlo do item */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                  <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1 sm:mb-0 leading-tight">{item.name}</h3>
                                  <span className="text-lg sm:text-xl font-bold text-green-600 sm:ml-3">
                                    {formatBRL(Number(item.price) || 0)}
                                  </span>
                                </div>

                                {item.description && (
                                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-2">{item.description}</p>
                                )}

                                {/* Controlos para adicionar ao carrinho */}
                                <div className="flex items-center justify-end">
                                  {cart.find(ci => ci.id === item.id) ? (
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="bg-destructive/10 text-destructive p-2 sm:p-2.5 rounded-xl hover:bg-destructive/20 transition-all duration-200 shadow-sm hover:shadow-md"
                                      >
                                        <Minus className="h-4 w-4" aria-hidden="true" />
                                      </button>
                                      <span className="font-bold text-lg sm:text-xl min-w-[2rem] text-center text-foreground">
                                        {cart.find(ci => ci.id === item.id)?.quantity || 0}
                                      </span>
                                      <button
                                        onClick={() => addToCart(item)}
                                        className="bg-success/10 text-success p-2 sm:p-2.5 rounded-xl hover:bg-success/20 transition-all duration-200 shadow-sm hover:shadow-md"
                                      >
                                        <Plus className="h-4 w-4" aria-hidden="true" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => addToCart(item)}
                                      className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:bg-green-700 transition-all duration-200 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl"
                                    >
                                      Adicionar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Rodapé com total e botão para finalizar no WhatsApp */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 mt-8 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatBRL(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-bold flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="h-5 w-5 mr-3" aria-hidden="true" />
                  Finalizar no WhatsApp
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botão FAB (Floating Action Button) do Carrinho */}
      <div className="fixed top-6 right-6 z-30">
        <button
          onClick={() => {
            console.log('Abrindo carrinho...', cart);
            setIsCartOpen(true);
          }}
          className="p-4 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative"
          aria-label="Abrir carrinho"
          style={{ backgroundColor: store.primaryColor }}
        >
          <ShoppingCart className="h-6 w-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
      <style jsx global>{`
        :root {
          --primary: ${store.primaryColor};
        }
      `}</style>

      {/* Modal do Carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity" 
              onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Conteúdo do Modal */}
            <div className="align-bottom bg-card rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-h-[80vh] flex flex-col">
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Seu Carrinho</h3>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">Carrinho vazio</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Adicione itens ao carrinho para continuar.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                              <svg className="h-8 w-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{formatBRL(item.price || 0)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium">{formatBRL((item.price || 0) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="border-t border-border p-6">
                  <div className="flex justify-between text-base font-medium text-foreground mb-6">
                    <p>Total</p>
                    <p>{formatBRL(cartTotal)}</p>
                  </div>
                  <button
                    onClick={sendWhatsAppOrder}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Finalizar Pedido
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão FAB (Floating Action Button) do WhatsApp */}
      <button
        onClick={() => sendWhatsAppInquiry('general')}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-green-700 transition-all duration-300 z-30 hover:scale-110 hover:-translate-y-1"
        aria-label="Abrir conversa no WhatsApp"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Rodapé da página */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-lg">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
              </div>
              <span className="font-bold text-base sm:text-lg text-foreground">SmartCard</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">Cartão digital inteligente para pequenos e médios negócios</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Página Inicial</a>
              <a href="/auth/register" className="hover:text-foreground transition-colors">Criar Minha Loja</a>
              <a href="/dashboard" className="hover:text-foreground transition-colors">Painel Administrativo</a>
            </div>
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
              <p className="text-muted-foreground text-xs">© 2025 SmartCard. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
