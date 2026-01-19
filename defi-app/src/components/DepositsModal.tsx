import { useState, useEffect, useRef } from 'react';
import type { Deposit, DepositCurrency } from '../types/pool';
import { getExchangeRate, addDeposit, removeDeposit } from '../utils/deposits';

interface DepositsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposits: Deposit[];
  onDepositsChange: () => void;
}

const CURRENCIES: { value: DepositCurrency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
];

function formatCurrency(amount: number, currency: DepositCurrency = 'USD'): string {
  const symbols: Record<DepositCurrency, string> = { USD: '$', GBP: '£', EUR: '€' };
  return `${symbols[currency]}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DepositsModal({ isOpen, onClose, deposits, onDepositsChange }: DepositsModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<DepositCurrency>('USD');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [loadingRate, setLoadingRate] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Reset form
    setAmount('');
    setCurrency('USD');
    setDate(new Date().toISOString().split('T')[0]);
    setExchangeRate(1);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (currency === 'USD') {
      setExchangeRate(1);
      return;
    }

    setLoadingRate(true);
    getExchangeRate(currency, 'USD')
      .then(rate => setExchangeRate(rate))
      .finally(() => setLoadingRate(false));
  }, [currency]);

  const amountNum = parseFloat(amount) || 0;
  const amountUsd = amountNum * exchangeRate;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) return;

    setIsAdding(true);
    try {
      await addDeposit({
        date,
        amount: amountNum,
        currency,
        amountUsd,
        exchangeRate,
      });
      onDepositsChange();
      // Reset form
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await removeDeposit(id);
      onDepositsChange();
    } finally {
      setIsDeleting(null);
    }
  };

  const totalUsd = deposits.reduce((sum, d) => sum + d.amountUsd, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg max-w-lg w-full border border-slate-600 shadow-xl animate-in fade-in duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Manage Deposits</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Deposit Form */}
          <form onSubmit={handleAdd} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-slate-300 mb-2">Add New Deposit</div>

            <div className="grid grid-cols-2 gap-3">
              {/* Amount */}
              <div>
                <label htmlFor="deposit-amount" className="block text-xs text-slate-400 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="deposit-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="deposit-currency" className="block text-xs text-slate-400 mb-1">
                  Currency
                </label>
                <select
                  id="deposit-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as DepositCurrency)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="deposit-date" className="block text-xs text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                id="deposit-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* USD Equivalent Preview */}
            {amountNum > 0 && currency !== 'USD' && (
              <div className="text-sm text-slate-400">
                {loadingRate ? (
                  'Fetching rate...'
                ) : (
                  <>
                    = <span className="text-white">${amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {' '}USD
                    <span className="text-xs text-slate-500 ml-1">
                      (1 {currency} = ${exchangeRate.toFixed(4)})
                    </span>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={amountNum <= 0 || isAdding || loadingRate}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isAdding ? 'Adding...' : 'Add Deposit'}
            </button>
          </form>

          {/* Deposits List */}
          {deposits.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-300">
                Deposit History ({deposits.length})
              </div>
              <div className="space-y-2">
                {deposits.map(deposit => (
                  <div
                    key={deposit.id}
                    className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {formatCurrency(deposit.amount, deposit.currency)}
                        {deposit.currency !== 'USD' && (
                          <span className="text-slate-400 text-sm ml-2">
                            (${deposit.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(deposit.date)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(deposit.id)}
                      disabled={isDeleting === deposit.id}
                      className="text-slate-400 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
                      title="Delete deposit"
                    >
                      {isDeleting === deposit.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-4">
              No deposits recorded yet.
            </div>
          )}
        </div>

        {/* Footer with Total */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Deposited</span>
            <span className="text-xl font-bold text-white">
              ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
