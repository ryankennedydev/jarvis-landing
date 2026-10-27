/** Pequeno radar com varredura cônica: assinatura visual do sistema. */
export function Sonar({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`sonar inline-block shrink-0 ${className}`}
      style={{ width: size, height: size, boxShadow: 'inset 0 0 0 1px rgba(143,208,255,0.35)' }}
    />
  )
}
