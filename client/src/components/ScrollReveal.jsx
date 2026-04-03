import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { sectionReveal } from '../utils/animations'

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  as = 'div',
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-72px' })
  const Tag = motion[as] || motion.div

  return (
    <Tag
      ref={ref}
      variants={sectionReveal(direction, delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </Tag>
  )
}
