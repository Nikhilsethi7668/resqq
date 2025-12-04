import React from 'react';
import './Card.css';

const Card = ({
    children,
    variant = 'default',
    padding = 'md',
    hoverable = false,
    glass = false,
    className = '',
    ...props
}) => {
    const baseClass = 'card';
    const variantClass = `card-${variant}`;
    const paddingClass = `card-padding-${padding}`;
    const hoverableClass = hoverable ? 'card-hoverable' : '';
    const glassClass = glass ? 'card-glass' : '';

    const classes = [
        baseClass,
        variantClass,
        paddingClass,
        hoverableClass,
        glassClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => {
    return (
        <div className={`card-header ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardBody = ({ children, className = '', ...props }) => {
    return (
        <div className={`card-body ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardFooter = ({ children, className = '', ...props }) => {
    return (
        <div className={`card-footer ${className}`} {...props}>
            {children}
        </div>
    );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
