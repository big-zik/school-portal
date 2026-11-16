'use client'

import { useEffect } from 'react'

// Scroll motion for public pages: gold progress line, hero parallax, reveal-on-scroll.
// Everything is visible by default; reduced motion skips it entirely.
export function ScrollFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const prog = document.getElementById('scroll-progress')
    const px = document.querySelector<HTMLElement>('[data-parallax]')
    const seal = document.querySelector<HTMLElement>('[data-seal]')
    let queued = false
    const frame = () => {
      queued = false
      const y = window.scrollY
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      prog?.style.setProperty('--p', Math.min(1, y / max).toFixed(4))
      const k = Math.min(y, 700)
      px?.style.setProperty('--y', `${(-k * 0.07).toFixed(1)}px`)
      seal?.style.setProperty('--sy', `${(-k * 0.12).toFixed(1)}px`)
      seal?.style.setProperty('--sr', `${(k * 0.12).toFixed(1)}deg`)
    }
    const onScroll = () => {
      if (!queued) {
        queued = true
        requestAnimationFrame(frame)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    frame()

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return
      el.classList.add('pre')
      el.style.setProperty('--d', `${((Number(el.dataset.reveal) || i % 3) * 0.12).toFixed(2)}s`)
      io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  return <div id="scroll-progress" className="scroll-progress" aria-hidden="true" />
}
