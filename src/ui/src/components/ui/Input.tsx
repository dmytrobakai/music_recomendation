import React, { InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  
  const containerStyles = `
    margin-bottom: var(--space-lg);
    width: ${fullWidth ? '100%' : 'auto'};
    position: relative;
  `;

  const labelStyles = `
    display: block;
    margin-bottom: var(--space-sm);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-secondary);
  `;

  const inputContainerStyles = `
    position: relative;
    display: flex;
    align-items: center;
    background-color: ${focused ? 'var(--surface-lighter)' : 'var(--surface-light)'};
    border: 1px solid ${error ? 'var(--error)' : focused ? 'var(--primary-color)' : 'transparent'};
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  `;

  const inputStyles = `
    width: 100%;
    padding: var(--space-md);
    font-size: 1rem;
    background: transparent;
    border: none;
    color: var(--text-primary);
    outline: none;
    ${leftIcon ? 'padding-left: 2.5rem;' : ''}
    ${rightIcon ? 'padding-right: 2.5rem;' : ''}
    &::placeholder {
      color: var(--text-tertiary);
    }
  `;

  const iconStyles = `
    position: absolute;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  `;
  
  const leftIconStyles = iconStyles + 'left: var(--space-md);';
  const rightIconStyles = iconStyles + 'right: var(--space-md);';

  const helperTextStyles = `
    font-size: 0.75rem;
    margin-top: var(--space-xs);
    color: ${error ? 'var(--error)' : 'var(--text-tertiary)'};
  `;

  return (
    <div style={{ cssText: containerStyles }} className={className}>
      {label && (
        <label style={{ cssText: labelStyles }}>
          {label}
        </label>
      )}
      
      <div style={{ cssText: inputContainerStyles }}>
        {leftIcon && (
          <div style={{ cssText: leftIconStyles }}>
            {leftIcon}
          </div>
        )}
        
        <input 
          style={{ cssText: inputStyles }} 
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props} 
        />
        
        {rightIcon && (
          <div style={{ cssText: rightIconStyles }}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helper) && (
        <p style={{ cssText: helperTextStyles }}>
          {error || helper}
        </p>
      )}
    </div>
  );
};

export default Input;