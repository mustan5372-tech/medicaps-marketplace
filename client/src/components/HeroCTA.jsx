import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { useMagnet } from '../hooks/useMagnet'

export default function HeroCTA({ to = '/create-listing', onClick }) {
  const [hovered, setHovered] = useState(false)
  const { ref, x, y, handlers } = useMagnet({ strength: 0.2 })

  return (
    <Link to={to} onClick={onClick}>
      <motion.button
        ref={ref}
        style={{
          x, y,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.30)',
          boxShadow: hovered
            ? '0 0 0 1px rgba(255,255,255,0.2), 0 8px 32px rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)'
            : '0 0 0 1px rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
        {...handlers}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.045 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      >
        {/* Animated gradient fill behind content */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-2xl"
          animate={{
            background: hovered
              ? 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Shine sweep on hover */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          animate={hovered ? { x: '120%', opacity: 1 } : { x: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            width: '60%',
          }}
        />

        {/* Top highlight line */}
        <span
          aria-hidden
          className="absolute top-0 left-4 right-4 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)' }}
        />

        {/* Label + icon */}
        <span className="relative z-10 flex items-center gap-2.5 tracking-wide">
          <span>Sell something</span>
          <motion.span
            animate={{ x: hovered ? 3 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <FiArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </motion.span>
        </span>
      </motion.button>
    </Link>
  )
}
