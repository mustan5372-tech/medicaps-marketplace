import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import Lenis from '@studio-freight/lenis'

// Smooth scroll — tuned for premium inertia feel
// Disable on touch devices — native momentum scroll is better on mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const lenis = new Lenis({
  duration: 1.1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: !isMobile,
  wheelMultiplier: 0.9,
  touchMultiplier: isMobile ? 1 : 1.5,
  infinite: false,
})
function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

// Keep Render free tier awake — ping every 5 minutes
const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://medicaps-backend-7cwm.onrender.com'
const ping = () => fetch(`${BACKEND}/api/health`).catch(() => {})
ping()
setInterval(ping, 5 * 60 * 1000)

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  componentDidCatch(error) { this.setState({ error }) }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, fontFamily: 'monospace', color: 'red' }}>
        <h2>App crashed:</h2>
        <pre>{this.state.error.toString()}</pre>
      </div>
    )
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)
