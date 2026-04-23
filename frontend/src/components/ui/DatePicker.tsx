import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "./Calendar";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", disabled = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-2xl font-bold text-sm text-left transition-all outline-none ${
          disabled 
            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-slate-50 border-slate-100 text-slate-800 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        } ${
          !value && !disabled ? "text-slate-400" : ""
        }`}
      >
        <CalendarIcon className="h-5 w-5 text-slate-400" />
        {value ? format(value, "PPP") : <span>{placeholder}</span>}
      </button>

      {!disabled && isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[9999] animate-in zoom-in-95 duration-200">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            initialFocus
          />
        </div>
      )}
    </div>
  );
}
