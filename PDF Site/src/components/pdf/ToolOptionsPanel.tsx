import { useId } from 'react';
import Button from '../ui/Button';

interface OptionsPanelProps {
  children: React.ReactNode;
}

export default function ToolOptionsPanel({ children }: OptionsPanelProps) {
  return (
    <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
      <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Options</h3>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

// Reusable small controls
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  id?: string;
}

export function TextField({ label, value, onChange, placeholder, help, id }: TextFieldProps) {
  const generatedId = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id ?? generatedId} className="text-sm font-medium text-[#161616]">
        {label}
      </label>
      <input
        id={id ?? generatedId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-[#c4c4cc] bg-white px-3 py-2 text-sm text-[#161616] placeholder-[#9a9aa0] outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]"
      />
      {help && <span className="text-xs text-[#47474f]">{help}</span>}
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  help?: string;
  id?: string;
}

export function Select({ label, value, onChange, options, help, id }: SelectProps) {
  const generatedId = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id ?? generatedId} className="text-sm font-medium text-[#161616]">
        {label}
      </label>
      <select
        id={id ?? generatedId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#c4c4cc] bg-white px-3 py-2 text-sm text-[#161616] outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {help && <span className="text-xs text-[#47474f]">{help}</span>}
    </div>
  );
}

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  unit?: string;
  help?: string;
  id?: string;
}

export function Range({ label, value, min, max, step = 1, onChange, showValue = true, unit, help, id }: RangeProps) {
  const generatedId = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id ?? generatedId} className="font-medium text-[#161616]">{label}</label>
        {showValue && (
          <span className="rounded bg-[#f0f0f5] px-2 py-0.5 text-xs font-semibold text-[#161616]">
            {value}{unit ?? ''}
          </span>
        )}
      </div>
      <input
        id={id ?? generatedId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-[#e8e8ed] outline-none accent-[#e5322d]"
      />
      {help && <span className="text-xs text-[#47474f]">{help}</span>}
    </div>
  );
}

export { Button };
