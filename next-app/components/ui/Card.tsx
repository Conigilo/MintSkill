import * as React from "react"

export function Card({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass-panel rounded-2xl overflow-hidden transition-all hover:border-slate-300 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-2 ${className}`} {...props}>
      {children}
    </div>
  )
}