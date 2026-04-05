import { useEffect, useRef, useState } from 'react'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

/** Animated stats strip when scrolled into view */
export default function StatsBar() {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const [tutors, setTutors] = useState(0)
  const [rating, setRating] = useState(0)
  const [students, setStudents] = useState(0)
  const [runAnim, setRunAnim] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        if (reduced) {
          setTutors(500)
          setRating(4.8)
          setStudents(12000)
        } else {
          setRunAnim(true)
        }
      },
      { threshold: 0.35 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [reduced])

  useEffect(() => {
    if (!runAnim) return
    const duration = 1400
    const start = performance.now()
    let frame

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const e = easeOutCubic(p)
      setTutors(Math.round(500 * e))
      setRating(Math.round(48 * e) / 10)
      setStudents(Math.round(12000 * e))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [runAnim])

  return (
    <section id="stats" ref={ref} className="bg-blue py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Platform statistics</h2>
        <div className="grid grid-cols-3 gap-3 text-center text-white sm:gap-6">
          <div>
            <p className="font-heading text-xl font-bold sm:text-3xl lg:text-4xl">
              {tutors}+
            </p>
            <p className="mt-1 font-sans text-xs text-white/90 sm:text-base">Tutors</p>
          </div>
          <div>
            <p className="font-heading text-xl font-bold sm:text-3xl lg:text-4xl">
              {rating.toFixed(1)}★
            </p>
            <p className="mt-1 font-sans text-[10px] leading-tight text-white/90 sm:text-base sm:leading-normal">
              Average Rating
            </p>
          </div>
          <div>
            <p className="font-heading text-xl font-bold sm:text-3xl lg:text-4xl">
              {students.toLocaleString()}+
            </p>
            <p className="mt-1 font-sans text-xs text-white/90 sm:text-base">Students</p>
          </div>
        </div>
      </div>
    </section>
  )
}
