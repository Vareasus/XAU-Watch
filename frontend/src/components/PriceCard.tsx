import { ArrowUp, ArrowDown } from 'lucide-react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface PriceCardProps {
  price: number;
  currency: string;
  change24h: number;
  label: string;
}

export default function PriceCard({ price, currency, change24h, label }: PriceCardProps) {
  const isPositive = change24h >= 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 animate-[fade-in_0.5s_ease-out]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wide">
          {label}
        </h3>
        <span className={cn(
          "flex items-center text-sm font-semibold px-2 py-1 rounded-full",
          isPositive 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {isPositive ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
          {Math.abs(change24h)}%
        </span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">
          {currency === 'USD' ? '$' : ''}{price.toLocaleString()}
          {currency !== 'USD' ? ` ${currency}` : ''}
        </span>
      </div>
      
      <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", isPositive ? "bg-green-500" : "bg-red-500")}
          style={{ width: `${Math.min(Math.abs(change24h) * 10, 100)}%` }}
        />
      </div>
    </div>
  );
}
