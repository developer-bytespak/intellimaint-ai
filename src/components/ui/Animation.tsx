'use client'

import React, { useEffect, useState } from 'react'

type AnimationProps = {
  children: React.ReactNode
  className?: string
  animation?: 'fade' | 'slideUp'
  delay?: number // milliseconds
  duration?: number // milliseconds
}

export default function Animation({ children, className = '', animation = 'fade', delay = 30, duration = 600 }: AnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let mounted = true
    const timeout = window.setTimeout(() => {
      // use rAF to ensure style changes happen in next frame for smoother transitions
      const raf = requestAnimationFrame(() => {
        if (mounted) setVisible(true)
      })
      // clear rAF on cleanup
      return () => cancelAnimationFrame(raf)
    }, delay)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [delay])

  const easing = 'cubic-bezier(.2,.9,.2,1)'

  const style: React.CSSProperties = {
    willChange: 'opacity, transform',
    transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
    opacity: visible ? 1 : 0,
    transform: visible
      ? 'translateY(0)'
      : animation === 'slideUp'
      ? 'translateY(8px)'
      : 'translateY(0)'
  }

  // In reduced-motion mode, CSS will override in globals.css
  return (
    <div className={className} style={style} aria-hidden={!visible}>
      {children}
    </div>
  )
}
