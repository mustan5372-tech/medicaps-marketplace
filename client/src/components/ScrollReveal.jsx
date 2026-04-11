// Scroll animations removed for performance — renders children immediately
export default function ScrollReveal({ children, className = '' }) {
  return <div className={className}>{children}</div>
}
