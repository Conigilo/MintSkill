import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'github';
}

export function Badge({ className = "", variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    github: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm cursor-default ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}