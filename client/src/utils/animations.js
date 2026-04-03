// Premium Framer Motion variants

export const transitionTheme = { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
export const transitionSlow  = { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }
export const transitionSpring = { type: 'spring', stiffness: 280, damping: 28 }

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: transitionTheme },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2, ease: 'easeOut' } }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitionTheme },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: transitionTheme },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.2, ease: 'easeOut' } }
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: transitionSlow }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: transitionSlow }
}

export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: delay }
  }
})

export const pageTransition = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: transitionTheme },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18, ease: 'easeOut' } }
}

// Listing card — lift + shadow on scroll reveal
export const listingCardVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
  }
}

export const buttonHover = { scale: 1.02, transition: { duration: 0.15, ease: 'easeOut' } }
export const buttonTap   = { scale: 0.95, transition: { duration: 0.1,  ease: 'easeOut' } }

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: transitionTheme },
  exit:   { opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.18, ease: 'easeOut' } }
}

export const badgePop = {
  hidden: { scale: 0, opacity: 0 },
  show:   { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 20 } },
  exit:   { scale: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }
}

export const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show:   { opacity: 1, scale: 1, transition: transitionTheme },
  exit:   { opacity: 0, scale: 0.8, transition: { duration: 0.15, ease: 'easeOut' } }
}

// Word-by-word text reveal — wrap each word in <WordReveal>
export const wordContainer = (delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: delay } }
})

export const wordVariant = {
  hidden: { opacity: 0, y: 20, rotateX: 20 },
  show:   { opacity: 1, y: 0,  rotateX: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
}

// Section reveal — used by ScrollReveal
export const sectionReveal = (direction = 'up', delay = 0) => ({
  hidden: {
    opacity: 0,
    y:  direction === 'up'    ?  40 : direction === 'down'  ? -40 : 0,
    x:  direction === 'left'  ?  40 : direction === 'right' ? -40 : 0,
    scale: 0.97,
  },
  show: {
    opacity: 1, y: 0, x: 0, scale: 1,
    transition: { duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }
  }
})
