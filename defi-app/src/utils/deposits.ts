import type { Deposit, DepositCurrency } from '../types/pool';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'defi-tracker-deposits';

// Exchange rate API (free, no key required)
const EXCHANGE_API = 'https://api.frankfurter.app/latest';

export async function getExchangeRate(from: DepositCurrency, to: DepositCurrency = 'USD'): Promise<number> {
  if (from === to) return 1;

  try {
    const response = await fetch(`${EXCHANGE_API}?from=${from}&to=${to}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rate');
    const data = await response.json();
    return data.rates[to] || 1;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback rates (approximate)
    const fallbackRates: Record<DepositCurrency, number> = {
      USD: 1,
      GBP: 1.27, // GBP to USD
      EUR: 1.08, // EUR to USD
    };
    return from === 'USD' ? 1 : fallbackRates[from];
  }
}

function generateId(): string {
  return `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// localStorage functions
export function getLocalDeposits(): Deposit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearLocalDeposits(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function saveLocalDeposits(deposits: Deposit[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deposits));
}

function addLocalDeposit(deposit: Omit<Deposit, 'id' | 'createdAt'>): Deposit {
  const deposits = getLocalDeposits();
  const newDeposit: Deposit = {
    ...deposit,
    id: generateId(),
    createdAt: Date.now(),
  };
  deposits.unshift(newDeposit);
  saveLocalDeposits(deposits);
  return newDeposit;
}

function removeLocalDeposit(id: string): boolean {
  const deposits = getLocalDeposits();
  const filtered = deposits.filter(d => d.id !== id);
  if (filtered.length === deposits.length) return false;
  saveLocalDeposits(filtered);
  return true;
}

function updateLocalDeposit(id: string, updates: Partial<Omit<Deposit, 'id' | 'createdAt'>>): boolean {
  const deposits = getLocalDeposits();
  const index = deposits.findIndex(d => d.id === id);
  if (index === -1) return false;
  deposits[index] = { ...deposits[index], ...updates };
  saveLocalDeposits(deposits);
  return true;
}

// Supabase functions (with localStorage fallback)
export async function fetchDeposits(): Promise<Deposit[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return getLocalDeposits();
  }

  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching deposits:', error);
    // Fall back to localStorage if table doesn't exist yet
    return getLocalDeposits();
  }

  return data.map((row) => ({
    id: row.id,
    date: row.date,
    amount: Number(row.amount),
    currency: row.currency as DepositCurrency,
    amountUsd: Number(row.amount_usd),
    exchangeRate: Number(row.exchange_rate),
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function addDeposit(params: {
  date: string;
  amount: number;
  currency: DepositCurrency;
  amountUsd: number;
  exchangeRate: number;
}): Promise<Deposit | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return addLocalDeposit(params);
  }

  const { data, error } = await supabase
    .from('deposits')
    .insert({
      user_id: user.id,
      date: params.date,
      amount: params.amount,
      currency: params.currency,
      amount_usd: params.amountUsd,
      exchange_rate: params.exchangeRate,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding deposit:', error);
    // Fall back to localStorage if table doesn't exist
    return addLocalDeposit(params);
  }

  return {
    id: data.id,
    date: data.date,
    amount: Number(data.amount),
    currency: data.currency as DepositCurrency,
    amountUsd: Number(data.amount_usd),
    exchangeRate: Number(data.exchange_rate),
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function removeDeposit(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return removeLocalDeposit(id);
  }

  const { error } = await supabase
    .from('deposits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing deposit:', error);
    return removeLocalDeposit(id);
  }

  return true;
}

export async function updateDeposit(
  id: string,
  updates: Partial<Omit<Deposit, 'id' | 'createdAt'>>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return updateLocalDeposit(id, updates);
  }

  const updateData: Record<string, unknown> = {};
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.currency !== undefined) updateData.currency = updates.currency;
  if (updates.amountUsd !== undefined) updateData.amount_usd = updates.amountUsd;
  if (updates.exchangeRate !== undefined) updateData.exchange_rate = updates.exchangeRate;

  const { error } = await supabase
    .from('deposits')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating deposit:', error);
    return updateLocalDeposit(id, updates);
  }

  return true;
}

export function getTotalDepositsUsd(deposits: Deposit[]): number {
  return deposits.reduce((sum, d) => sum + d.amountUsd, 0);
}
