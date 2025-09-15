'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { MapPin, Phone, MessageCircle, ShoppingCart, Plus, Minus, Menu, Home, User, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ImageThumb } from './ui/ImageThumb'
import Topbar from './topbar'

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

// Utilidades
const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const normalizeWhats = (raw: string) => {
  const digits = (raw || '').replace(/\D/g, '')
  // Garante DDI 55 apenas uma vez
  return digits.startsWith('55') ? digits : `55${digits}`
}

const isAvailable = (item: Item) => item.isarchived !== true && item.isactive !== false

export default function PublicStorePage({ store }: PublicStorePageProps) {
  // 1) Validação de dados na entrada
  if (!store || !store.id || !store.name) {
    console.error('❌ Dados de store inválidos:', store)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-foreground mb-2">Erro ao carregar loja</h2>
          <p className="text-muted-foreground">Os dados da loja estão incompletos.</p>
        </div>
      </div>
    )
  }

  // 2) Normalizações seguras
  const safeCategories = Array.isArray(store.categories) ? store.categories : []
  const [cart, setCart] = useState<CartItem[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Log útil p/ QA (não polui produção)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('🏪 Store carregada', {
      name: store.name,
      categories: safeCategories.map(c => ({ name: c.name, items: c.items?.length ?? 0 })),
    })
  }

  // 3) Analytics (evita duplicar em StrictMode dev)
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

  // 4) Carrinho
  const addToCart = useCallback((item: Item) => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.id === item.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, { ...item, quantity: 1 }]
    })
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

  const cartTotal = useMemo(
    () => cart.reduce((t, i) => t + ((i.price || 0) * i.quantity), 0),
    [cart]
  )

  const cartCount = useMemo(
    () => cart.reduce((t, i) => t + i.quantity, 0),
    [cart]
  )

  // 5) WhatsApp helpers
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

  // 6) Render
  return (
    <div className="min-h-screen bg-background">
      {/* ETIQUETA SMARTCARD - colada no topo */}
      <div className="w-full flex justify-center sticky top-0 z-50">
        <div className="bg-card shadow-lg px-6 py-3 rounded-b-2xl font-bold text-primary">
          SmartCard
        </div>
      </div>

      {/* Botão hambúrguer (mobile) */}
      <button
        onClick={() => setIsMenuOpen(v => !v)}
        className="md:hidden fixed top-3 left-4 z-40 p-2 bg-card rounded-full shadow-md"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Botão carrinho (desktop) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className={`hidden md:block fixed top-3 right-4 z-40 relative p-2 sm:p-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
        cart.length > 0 
        ? 'bg-gradient-to-r from-success to-success/90 text-white hover:from-success/90 hover:to-success/80' 
        : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
        aria-label="Abrir carrinho"
      >
        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-destructive text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md">
            {cartCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[2147483646] bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-md border border-border shadow-xl mx-4 rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-2">
                <Link href="/" className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl hover:bg-muted transition-all duration-200 group" onClick={() => setIsMenuOpen(false)}>
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors duration-200">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  </div>
                  <span className="text-foreground text-sm sm:text-base font-medium">Página Inicial</span>
                </Link>
                <Link href="/auth/register" className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl hover:bg-muted transition-all duration-200 group" onClick={() => setIsMenuOpen(false)}>
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-secondary/10 transition-colors duration-200">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-secondary transition-colors duration-200" />
                  </div>
                  <span className="text-foreground text-sm sm:text-base font-medium">Criar Minha Loja</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl hover:bg-muted transition-all duration-200 group" onClick={() => setIsMenuOpen(false)}>
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-accent/10 transition-colors duration-200">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
                  </div>
                  <span className="text-foreground text-sm sm:text-base font-medium">Painel Administrativo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        {store.coverImage ? (
          <div className="h-32 sm:h-48 md:h-64 bg-gray-200 overflow-hidden relative">
            <Image
              src={store.coverImage.startsWith('/') ? `/api${store.coverImage}` : store.coverImage}
              alt={`Capa da ${store.name}`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              onError={(e) => {
                console.error('Erro ao carregar imagem de capa:', store.coverImage)
                // Remove a imagem em caso de erro
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement?.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-purple-600')
              }}
            />
            {/* Fallback content (hidden by default, shown on error) */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center opacity-0 transition-opacity duration-300">
              <div className="text-center text-white px-4">
                <div className="bg-white/20 p-2 sm:p-4 rounded-full mb-2 sm:mb-4 inline-block">
                  <svg className="h-8 w-8 sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold">{store.name}</h2>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <div className="bg-white/20 p-2 sm:p-4 rounded-full mb-2 sm:mb-4 inline-block">
                <svg className="h-8 w-8 sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">{store.name}</h2>
            </div>
          </div>
        )}

        {/* Store Info Card */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="bg-card/95 backdrop-blur-sm -mt-8 sm:-mt-12 relative z-10 rounded-2xl shadow-2xl border border-border">
            <div className="p-5 sm:p-8">
              <div className="flex items-start space-x-4 sm:space-x-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {store.profileImage ? (
                    <Image
                      src={store.profileImage.startsWith('/') ? `/api${store.profileImage}` : store.profileImage}
                      alt={`Logo da ${store.name}`}
                      width={80}
                      height={80}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                      priority
                      onError={(e) => {
                        console.error('Erro ao carregar imagem de perfil:', store.profileImage)
                        // Esconde a imagem e mostra o fallback
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  {/* Fallback sempre presente */}
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-muted to-muted/80 rounded-2xl flex items-center justify-center border-4 border-background shadow-lg"
                      style={{ display: store.profileImage ? 'none' : 'flex' }}
                    >
                      <svg className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                    </svg>
                  </div>
                </div>

                {/* Store Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">{store.name}</h1>
                  {store.description && (
                    <p className="text-muted-foreground text-sm sm:text-base mb-4 leading-relaxed">{store.description}</p>
                  )}

                  {/* Store Info */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-sm text-muted-foreground">
                    {store.address && (
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-lg bg-primary/10 mr-2">
                          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <span className="truncate">{store.address}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-lg bg-success/10 mr-2">
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

      {/* Categories and Items */}
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
                          className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-4 sm:p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                          <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <ImageThumb
                                src={item.imageUrl || ''}
                                alt={item.name}
                                size="lg"
                                variant="rounded"
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300"
                                priority={false}
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1 sm:mb-0 leading-tight">{item.name}</h3>
                                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent sm:ml-3">
                                  {formatBRL(Number(item.price) || 0)}
                                </span>
                              </div>

                              {item.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-2">{item.description}</p>
                              )}

                              {/* Add to Cart Controls */}
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
                                    className="bg-gradient-to-r from-success to-success/90 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:from-success/90 hover:to-success/80 transition-all duration-200 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl"
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
        )}
      </div>

      {/* Floating Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Floating Card - Centered */}
          <div className="relative z-10 flex items-center justify-center min-h-full p-4 sm:p-6">
            <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-success/20 to-success/30 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-success" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Seu Carrinho</h3>
                      {cart.length > 0 && (
                        <p className="text-sm text-muted-foreground">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)} 
                    className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-all duration-200" 
                    aria-label="Fechar carrinho"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Cart Content */}
              {cart.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="text-muted-foreground mb-4">
                    <ShoppingCart className="h-12 w-12 mx-auto" strokeWidth={1} />
                  </div>
                  <h4 className="text-lg font-medium text-foreground mb-2">Carrinho vazio</h4>
                  <p className="text-muted-foreground mb-6">Adicione alguns produtos para começar seu pedido</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-200 font-semibold"
                  >
                    Continuar Comprando
                  </button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="p-4 sm:p-6 max-h-64 sm:max-h-80 overflow-y-auto">
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="bg-muted/80 rounded-xl p-4 hover:bg-muted transition-colors duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground mb-1 truncate">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{formatBRL(Number(item.price) || 0)} cada</p>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="font-bold text-success mb-2">
                                {formatBRL((Number(item.price) || 0) * item.quantity)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => removeFromCart(item.id)} 
                                className="bg-destructive/10 text-destructive p-2 rounded-lg hover:bg-destructive/20 transition-colors duration-200" 
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <span className="font-bold text-foreground min-w-[2rem] text-center">{item.quantity}</span>
                              <button 
                                onClick={() => addToCart(item)} 
                                className="bg-success/10 text-success p-2 rounded-lg hover:bg-success/20 transition-colors duration-200" 
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 sm:p-6 border-t border-border bg-muted/50">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-lg font-bold text-foreground">Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
                        {formatBRL(cartTotal)}
                      </span>
                    </div>

                    <button 
                      onClick={sendWhatsAppOrder} 
                      className="w-full bg-gradient-to-r from-success to-success/90 text-white py-4 rounded-xl hover:from-success/90 hover:to-success/80 transition-all duration-200 font-bold flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      <MessageCircle className="h-5 w-5 mr-3" aria-hidden="true" />
                      Finalizar no WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}



      {/* WhatsApp FAB */}
      <button
        onClick={() => sendWhatsAppInquiry('general')}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-success to-success/90 text-white p-4 rounded-2xl shadow-2xl hover:from-success/90 hover:to-success/80 transition-all duration-300 z-40 hover:scale-110 hover:-translate-y-1"
        aria-label="Abrir conversa no WhatsApp"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </button>

      <footer className="bg-card border-t border-border mt-8 sm:mt-12">
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
              <Link href="/" className="hover:text-foreground transition-colors">Página Inicial</Link>
              <Link href="/auth/register" className="hover:text-foreground transition-colors">Criar Minha Loja</Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Painel Administrativo</Link>
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
