// Premium Framer Motion variants

export const transitionTheme = { duration: 0.25, ease: [0.22, 1, 0.36, 1] }

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: transitionTheme },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeOut" } }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitionTheme },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: transitionTheme },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeOut" } }
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: transitionTheme }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: transitionTheme }
}

export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: delay } 
  }
})

export const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: transitionTheme },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeOut" } }
}

// Listing Cards exact motion spec
export const listingCardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: transitionTheme }
}

// Button interactions
export const buttonHover = { scale: 1.02, transition: { duration: 0.15, ease: "easeOut" } }
export const buttonTap = { scale: 0.95, transition: { duration: 0.1, ease: "easeOut" } }

// Modal
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: transitionTheme },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2, ease: "easeOut" } }
}

// Notification badge (Pulse/Pop)
export const badgePop = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 20 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }
}

export const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: transitionTheme },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeOut" } }
}
