import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
    type = 'text',
    label,
    error,
    helperText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    size = 'md',
    disabled = false,
    className = '',
    ...props
}, ref) => {
    const baseClass = 'input-wrapper';
    const sizeClass = `input-${size}`;
    const fullWidthClass = fullWidth ? 'input-full-width' : '';
    const errorClass = error ? 'input-error' : '';
    const disabledClass = disabled ? 'input-disabled' : '';
    const iconClass = icon ? `input-with-icon-${iconPosition}` : '';

    const wrapperClasses = [
        baseClass,
        fullWidthClass,
        className
    ].filter(Boolean).join(' ');

    const inputClasses = [
        'input',
        sizeClass,
        errorClass,
        disabledClass,
        iconClass
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label && (
                <label className="input-label">
                    {label}
                </label>
            )}
            <div className="input-container">
                {icon && iconPosition === 'left' && (
                    <span className="input-icon input-icon-left">{icon}</span>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={inputClasses}
                    disabled={disabled}
                    {...props}
                />
                {icon && iconPosition === 'right' && (
                    <span className="input-icon input-icon-right">{icon}</span>
                )}
            </div>
            {(error || helperText) && (
                <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
