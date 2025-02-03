interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  gradient?: boolean
}

export default function Card({ 
  children, 
  className = '', 
  onClick,
  gradient = false
}: CardProps) {
  return (
    <div 
      className={`
        relative overflow-hidden
        ${gradient 
          ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
          : 'bg-gray-50 dark:bg-gray-800'
        }
        rounded-xl shadow-sm
        p-6 
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
} 