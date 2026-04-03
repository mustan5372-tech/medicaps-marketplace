import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { wordContainer, wordVariant } from '../utils/animations'

/**
 * Splits text into words and reveals each one with a staggered upward motion.
 * Usage: <WordReveal text="Buy & Sell Within Campus" delay={0.1} className="text-4xl font-bold" />
 */
export default function WordReveal({ text, className = '', delay = 0, as = 'h1' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const words = text.split(' ')
  const Tag = motion[as] || motion.h1

  return (
    <Tag
      ref={ref}
      variants={wordContainer(delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={`flex flex-wrap gap-x-[0.3em] ${className}`}
      style={{ perspective: 800 }}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariant} style={{ display: 'inline-block' }}>
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}
