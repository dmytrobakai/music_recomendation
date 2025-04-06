import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  // Button base styles
  const baseStyles = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border-radius: var(--radius-pill);
    transition: all var(--transition-fast);
    gap: var(--space-sm);
    white-space: nowrap;
    ${fullWidth ? 'width: 100%;' : ''}
  `;

  // Size styles
  const sizeStyles = {
    sm: 'padding: 8px 14px; font-size: 0.875rem;',
    md: 'padding: 10px 18px; font-size: 0.9375rem;',
    lg: 'padding: 12px 24px; font-size: 1rem;',
  }[size];

  // Variant styles
  const variantStyles = {
    primary: `
      background-color: var(--primary-color);
      color: #000;
      &:hover:not(:disabled) {
        background-color: var(--primary-light);
        transform: translateY(-1px);
      }
      &:active:not(:disabled) {
        background-color: var(--primary-dark);
        transform: translateY(0px);
      }
    `,
    secondary: `
      background-color: var(--surface-light);
      color: var(--text-primary);
      &:hover:not(:disabled) {
        background-color: var(--surface-lighter);
        transform: translateY(-1px);
      }
      &:active:not(:disabled) {
        transform: translateY(0px);
      }
    `,
    outline: `
      background-color: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      &:hover:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.05);
        border-color: var(--text-secondary);
      }
      &:active:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.08);
      }
    `,
    ghost: `
      background-color: transparent;
      color: var(--text-primary);
      &:hover:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.05);
      }
      &:active:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.08);
      }
    `,
  }[variant];

  const combinedStyles = `
    ${baseStyles}
    ${sizeStyles}
    ${variantStyles}
  `;

  return (
    <button
      style={{ cssText: combinedStyles }}
      className={className}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;