import { Transaction, SalesSummary } from '../types';

const STORAGE_KEY = 'lumibiz_transactions_v1';

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const current = getTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteTransaction = (id: string): void => {
  const current = getTransactions();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const calculateSummary = (transactions: Transaction[]): SalesSummary => {
  let totalRevenue = 0;
  let grossProfit = 0;
  let totalReplacements = 0;
  let replacementCost = 0;
  let totalSoldUnits = 0;

  transactions.forEach(t => {
    if (t.type === 'SALE') {
      const revenue = t.quantity * t.sellPrice;
      const cost = t.quantity * t.costPrice;
      totalRevenue += revenue;
      grossProfit += (revenue - cost);
      totalSoldUnits += t.quantity;
    } else if (t.type === 'REPLACEMENT') {
      // Replacement cost is the cost of the bulb given away for free/warranty
      const cost = t.quantity * t.costPrice;
      replacementCost += cost;
      totalReplacements += t.quantity;
    }
  });

  return {
    totalRevenue,
    totalProfit: grossProfit, // Gross Profit before replacements
    totalReplacements,
    replacementCost,
    netProfit: grossProfit - replacementCost,
    totalSoldUnits
  };
};

export const getInventorySummary = (transactions: Transaction[]) => {
  const summary: Record<string, { sold: number, replaced: number }> = {};
  
  transactions.forEach(t => {
    if (!summary[t.bulbType]) {
      summary[t.bulbType] = { sold: 0, replaced: 0 };
    }
    if (t.type === 'SALE') {
      summary[t.bulbType].sold += t.quantity;
    } else {
      summary[t.bulbType].replaced += t.quantity;
    }
  });
  
  return Object.entries(summary).map(([name, data]) => ({
    name,
    ...data
  }));
};