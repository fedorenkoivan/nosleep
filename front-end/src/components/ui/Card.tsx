import React from "react";
interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
}
export function Card({
    children,
    className = "",
    title,
    description,
    footer,
}: CardProps) {
    return (
        <div
            className={`bg-surface rounded-xl border border-dark-border overflow-hidden ${className}`}
        >
            {(title || description) && (
                <div className="px-6 py-4 border-b border-dark-border">
                    {title && (
                        <h3 className="text-lg font-semibold text-white">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-dark-text-secondary">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="p-6">{children}</div>
            {footer && (
                <div className="px-6 py-4 bg-[#0A0A0A] border-t border-dark-border">
                    {footer}
                </div>
            )}
        </div>
    );
}
