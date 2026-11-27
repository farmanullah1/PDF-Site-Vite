import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 text-white';
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5',
    };
    const variants = {
      primary: 'bg-gradient-to-r from-[#ff6a58] to-[#e5322d] shadow-[0_2px_6px_rgba(229,50,45,0.25)] hover:shadow-[0_6px_14px_rgba(229,50,45,0.32)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-55 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed',
      ghost: 'bg-transparent border-transparent hover:bg-[#f0f0f5] text-[#161616]',
      outline: 'bg-transparent border border-[#c4c4cc] hover:bg-[#f5f5fa] hover:border-[#161616] text-[#161616]',
    };
    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
