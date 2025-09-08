'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, MessageCircle, ShoppingCart, Plus, Minus, Menu, Home, User, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
}

interface CartItem extends Item {
  quantity: number
}

interface PublicStorePageProps {
  store: Store
}

export default function PublicStorePage({ store }: PublicStorePageProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Track page visit on component mount
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storeid: store.id,
            event: 'visit',
            data: {
              page: 'store',
              slug: store.slug
            }
          }),
        })
      } catch (error) {
        console.error('Error tracking visit:', error)
      }
    }

    trackVisit()
  }, [store.id, store.slug])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = (item: Item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId)
      }
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return ''

    const currentDate = new Date().toLocaleDateString('pt-BR')
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    
    let message = `🛍️ *NOVO PEDIDO - ${store.name}*\n`
    message += `📅 ${currentDate} às ${currentTime}\n\n`
    
    message += `📋 *ITENS DO PEDIDO:*\n`
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      if (item.description) {
        message += `   _${item.description}_\n`
      }
      const itemPrice = Number(item.price) || 0
      message += `   Qtd: ${item.quantity}x | Valor: R$ ${itemPrice.toFixed(2)}\n`
      message += `   Subtotal: R$ ${(itemPrice * item.quantity).toFixed(2)}\n\n`
    })
    
    message += `💰 *TOTAL DO PEDIDO: R$ ${(getCartTotal() || 0).toFixed(2)}*\n\n`
    
    if (store.requiresAddress) {
      message += `📍 *ENDEREÇO PARA ENTREGA:*\n`
      message += `(Por favor, informe seu endereço completo)\n\n`
    }
    
    message += `✅ Confirma o pedido?`
    
    return encodeURIComponent(message)
  }

  const sendWhatsAppOrder = async () => {
    const message = generateWhatsAppMessage()
    const whatsappNumber = store.whatsapp.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${message}`
    
    // Track WhatsApp click analytics
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeid: store.id,
          event: 'whatsapp_click',
          data: {
            type: 'order',
            itemCount: getCartItemCount(),
            totalValue: getCartTotal()
          }
        }),
      })
    } catch (error) {
      console.error('Error tracking analytics:', error)
    }
    
    window.open(whatsappUrl, '_blank')
  }

  const sendWhatsAppInquiry = async (type: 'general' | 'catalog' = 'general') => {
    const whatsappNumber = store.whatsapp.replace(/\D/g, '')
    let message = ''
    
    if (type === 'catalog') {
      message = `Olá! Gostaria de saber mais sobre os produtos da ${store.name}`
    } else {
      message = `Olá! Gostaria de saber mais sobre a ${store.name}`
    }
    
    const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    // Track WhatsApp click analytics
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeid: store.id,
          event: 'whatsapp_click',
          data: {
            type: type
          }
        }),
      })
    } catch (error) {
      console.error('Error tracking analytics:', error)
    }
    
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with SmartCard branding */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* SmartCard Logo/Button */}
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
              <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
              </div>
              <span className="font-bold text-base sm:text-lg">SmartCard</span>
            </Link>

            {/* Menu and Cart */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {cart.length > 0 && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative bg-green-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-green-700 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {getCartItemCount()}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="grid grid-cols-1 gap-1 sm:gap-2">
                <Link href="/" className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <span className="text-gray-900 text-sm sm:text-base">Página Inicial</span>
                </Link>
                <Link href="/auth/register" className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <span className="text-gray-900 text-sm sm:text-base">Criar Minha Loja</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <span className="text-gray-900 text-sm sm:text-base">Painel Administrativo</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        {store.coverImage ? (
          <div className="h-32 sm:h-48 md:h-64 bg-gray-200 overflow-hidden relative">
            <Image 
              src={store.coverImage} 
              alt={`Capa da ${store.name}`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <div className="bg-white/20 p-2 sm:p-4 rounded-full mb-2 sm:mb-4 inline-block">
                <svg className="h-8 w-8 sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">{store.name}</h2>
            </div>
          </div>
        )}
        
        {/* Store Info Card */}
        <div className="bg-white mx-3 sm:mx-4 -mt-6 sm:-mt-8 relative z-10 rounded-xl shadow-lg border border-gray-100">
          <div className="p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {store.profileImage ? (
                  <Image 
                    src={store.profileImage} 
                    alt={`Logo da ${store.name}`}
                    width={64}
                    height={64}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-white shadow-md">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Store Details */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{store.name}</h1>
                {store.description && (
                  <p className="text-gray-600 text-sm mb-2 sm:mb-3 leading-relaxed">{store.description}</p>
                )}
                
                {/* Store Info */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  {store.address && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400 flex-shrink-0" />
                    <span>{store.whatsapp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories and Items */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {store.categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Catálogo em construção</h3>
            <p className="text-gray-500 mb-4">
              Em breve teremos produtos disponíveis aqui!
            </p>
            <button
              onClick={() => sendWhatsAppInquiry('catalog')}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Falar no WhatsApp
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {store.categories.map((category) => (
              <div key={category.id}>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{category.name}</h2>
                
                {category.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum item disponível nesta categoria
                  </p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {category.items.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                width={80}
                                height={80}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 sm:mb-0">{item.name}</h3>
                              <span className="text-base sm:text-lg font-semibold text-green-600 sm:ml-2">
                                R$ {(Number(item.price) || 0).toFixed(2)}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 leading-relaxed">{item.description}</p>
                            )}
                            
                            {/* Add to Cart Controls */}
                            <div className="flex items-center justify-end">
                              {cart.find(cartItem => cartItem.id === item.id) ? (
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="bg-red-100 text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-red-200 transition-colors"
                                  >
                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </button>
                                  <span className="font-medium text-base sm:text-lg min-w-[1.5rem] sm:min-w-[2rem] text-center">
                                    {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="bg-green-100 text-green-600 p-1.5 sm:p-2 rounded-full hover:bg-green-200 transition-colors"
                                  >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="bg-green-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
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
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seu Pedido</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">R$ {(Number(item.price) || 0).toFixed(2)} cada</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-100 text-red-600 p-1 rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-green-100 text-green-600 p-1 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <p className="font-semibold">R$ {((Number(item.price) || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  R$ {(Number(getCartTotal()) || 0).toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={sendWhatsAppOrder}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Enviar Pedido via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4 max-w-xs sm:max-w-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Carrinho</h3>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
              </span>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 max-h-32 sm:max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-700 truncate flex-1 mr-2">{item.name}</span>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <span className="text-gray-500">{item.quantity}x</span>
                    <span className="font-medium text-green-600">
                      R$ {((Number(item.price) || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-2 sm:pt-3 mb-2 sm:mb-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Total:</span>
                <span className="font-bold text-base sm:text-lg text-green-600">
                  R$ {cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={sendWhatsAppOrder}
              className="w-full bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Finalizar no WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      <button
        onClick={() => sendWhatsAppInquiry('general')}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
              </div>
              <span className="font-bold text-base sm:text-lg text-gray-900">SmartCard</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              Cartão digital inteligente para pequenos e médios negócios
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Página Inicial
              </Link>
              <Link href="/auth/register" className="hover:text-gray-700 transition-colors">
                Criar Minha Loja
              </Link>
              <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
                Painel Administrativo
              </Link>
            </div>
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-xs">
                © 2025 SmartCard. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

