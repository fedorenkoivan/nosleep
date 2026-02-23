import React from "react";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}
export function Input({
    label,
    error,
    helperText,
    className = "",
    id,
    ...props
}: InputProps) {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-dark-text-secondary mb-1"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          block w-full rounded-lg bg-surface border-dark-border shadow-sm text-white placeholder-[#555555]
          focus:border-accent focus:ring-accent sm:text-sm 
          disabled:bg-[#1A1A1A] disabled:text-gray-500
          ${error ? "border-red-900 text-red-200 placeholder-red-900/50 focus:border-red-500 focus:ring-red-500" : "border-dark-border"}
          ${className}
        `}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
            {helperText && !error && (
                <p className="mt-1 text-sm text-dark-text-tertiary">
                    {helperText}
                </p>
            )}
        </div>
    );
}
