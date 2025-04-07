"use client";

import React, { InputHTMLAttributes, useState } from "react";

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
  className = "",
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const containerStyles: React.CSSProperties = {
    marginBottom: "var(--space-lg)",
    width: fullWidth ? "100%" : "auto",
    position: "relative",
  };

  const labelStyles: React.CSSProperties = {
    display: "block",
    marginBottom: "var(--space-sm)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
  };

  const inputContainerStyles: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    backgroundColor: focused
      ? "var(--surface-lighter)"
      : "var(--surface-light)",
    border: `1px solid ${
      error ? "var(--error)" : focused ? "var(--primary-color)" : "transparent"
    }`,
    borderRadius: "var(--radius-md)",
    transition: "all var(--transition-fast)",
  };

  const inputStyles: React.CSSProperties = {
    width: "100%",
    padding: "var(--space-md)",
    fontSize: "1rem",
    background: "transparent",
    border: "none",
    color: "var(--text-primary)",
    outline: "none",
    paddingLeft: leftIcon ? "2.5rem" : undefined,
    paddingRight: rightIcon ? "2.5rem" : undefined,
  };

  const iconBaseStyles: React.CSSProperties = {
    position: "absolute",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  };

  const leftIconStyles: React.CSSProperties = {
    ...iconBaseStyles,
    left: "var(--space-md)",
  };

  const rightIconStyles: React.CSSProperties = {
    ...iconBaseStyles,
    right: "var(--space-md)",
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: "0.75rem",
    marginTop: "var(--space-xs)",
    color: error ? "var(--error)" : "var(--text-tertiary)",
  };

  return (
    <div style={containerStyles} className={className}>
      {label && <label style={labelStyles}>{label}</label>}

      <div style={inputContainerStyles}>
        {leftIcon && <div style={leftIconStyles}>{leftIcon}</div>}

        <input
          style={inputStyles}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {rightIcon && <div style={rightIconStyles}>{rightIcon}</div>}
      </div>

      {(error || helper) && <p style={helperTextStyles}>{error || helper}</p>}
    </div>
  );
};

export default Input;
