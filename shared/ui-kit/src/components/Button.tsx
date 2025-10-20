import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'medium'
}) => {
  const baseStyles = {
    borderRadius: '8px',
    border: '1px solid transparent',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s',
    opacity: disabled ? 0.5 : 1
  }

  const variantStyles = {
    primary: {
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      border: '1px solid #646cff'
    },
    secondary: {
      backgroundColor: '#f9f9f9',
      color: '#1a1a1a',
      border: '1px solid #ccc'
    },
    danger: {
      backgroundColor: '#ff4444',
      color: '#ffffff',
      border: '1px solid #ff4444'
    }
  }

  const sizeStyles = {
    small: {
      padding: '0.4em 0.8em',
      fontSize: '0.9em'
    },
    medium: {
      padding: '0.6em 1.2em',
      fontSize: '1em'
    },
    large: {
      padding: '0.8em 1.6em',
      fontSize: '1.1em'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size]
      }}
    >
      {children}
    </button>
  )
}

export default Button