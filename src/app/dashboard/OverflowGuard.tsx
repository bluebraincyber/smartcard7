'use client'
import { PropsWithChildren, useEffect } from 'react'

export default function OverflowGuard({ children }: PropsWithChildren) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = { overflowX: html.style.overflowX, maxWidth: html.style.maxWidth }
    const prevBody = { overflowX: body.style.overflowX, maxWidth: body.style.maxWidth }
    html.style.overflowX = 'hidden'
    html.style.maxWidth = '100%'
    body.style.overflowX = 'hidden'
    body.style.maxWidth = '100%'
    return () => {
      html.style.overflowX = prevHtml.overflowX
      html.style.maxWidth = prevHtml.maxWidth
      body.style.overflowX = prevBody.overflowX
      body.style.maxWidth = prevBody.maxWidth
    }
  }, [])

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {children}
    </div>
  )
}
