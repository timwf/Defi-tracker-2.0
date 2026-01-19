import type { Deposit } from '../types/pool';

interface DepositsCardProps {
  deposits: Deposit[];
  totalPortfolioValue: number;
  onEditClick: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DepositsCard({ deposits, totalPortfolioValue, onEditClick }: DepositsCardProps) {
  const totalDeposits = deposits.reduce((sum, d) => sum + d.amountUsd, 0);
  const pnl = totalPortfolioValue - totalDeposits;
  const pnlPercent = totalDeposits > 0 ? (pnl / totalDeposits) * 100 : 0;
  const hasDeposits = totalDeposits > 0;

  return (
    <div className="group bg-slate-800 rounded-lg p-3 md:p-4">
      <div className="text-xs md:text-sm text-slate-400 mb-1 flex items-center">
        P/L
        <button
          onClick={onEditClick}
          className="ml-2 p-1 text-slate-500 hover:text-white transition-colors rounded"
          title="Manage deposits"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {hasDeposits ? (
        <div>
          <div className={`text-lg md:text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            vs {formatCurrency(totalDeposits)} deposited
            <span className={`ml-1 ${pnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
              ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={onEditClick}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          + Add deposits
        </button>
      )}
    </div>
  );
}
