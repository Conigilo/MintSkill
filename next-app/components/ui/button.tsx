import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    // Base classes ที่ปุ่มทุกแบบต้องมี
    const baseStyle = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
    
    // รูปแบบสีต่างๆ
    const variants = {
      primary: "bg-[#7c3aed] text-slate-900 hover:bg-[#6d28d9]",
      outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      glow: "bg-[#7c3aed] text-slate-900 hover:bg-[#6d28d9] shadow-lg shadow-purple-500/40",
    };
    
    // ขนาดของปุ่ม
    const sizes = {
      sm: "h-8 px-4 text-xs",
      md: "h-12 px-8 text-sm",
      lg: "h-14 px-10 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"