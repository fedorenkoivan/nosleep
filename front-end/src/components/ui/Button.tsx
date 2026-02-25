import React from "react";
import { Loader2 } from "lucide-react";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
}
export function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading,
    leftIcon,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
    const variants = {
        primary:
            "bg-accent text-black hover:bg-accent-hover focus:ring-accent shadow-sm",
        secondary:
            "bg-surface-elevated text-white border border-dark-border hover:bg-[#1A1A1A] focus:ring-accent shadow-sm",
        ghost: "text-dark-text-secondary hover:bg-surface-elevated hover:text-white focus:ring-gray-500",
        outline:
            "border border-dark-border text-white hover:bg-surface-elevated focus:ring-accent",
        danger: "bg-red-900/50 text-red-200 border border-red-900 hover:bg-red-900/70 focus:ring-red-500 shadow-sm",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };
    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
        </button>
    );
}
