// Word-by-word animation removed for performance — renders text immediately
export default function WordReveal({ text, className = '', as: Tag = 'h1' }) {
  return <Tag className={className}>{text}</Tag>
}
