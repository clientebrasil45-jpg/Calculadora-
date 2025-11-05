export interface Inputs {
  initialCapital: number;
  costPerPhone: number;
  initialPhones: number;
  entryAmount: number;
  installmentCount: number;
  installmentAmount: number;
  extraMonthly: number;
  fixedMonthlyCosts: number;
  reinvestMode: 'all' | 'fixed' | 'percent';
  fixedReinvest: number;
  percentReinvest: number;
  months: number;
}

export interface MonthlyResult {
  month: number;
  collected: number;
  extraMonthly: number;
  reinvestUsed: number;
  phonesBoughtThisMonth: number;
  cash: number;
  cumulativeProfit: number;
  totalPhonesBought: number;
  growthRate: string;
  phonesPaidOff: number;
  phonesBeingPaid: number;
}

export interface SummaryData {
  totalPhonesBought: number;
  totalCost: number;
  totalRevenue: number;
  finalProfit: number;
  averageTicket: number;
  phonesPaidOff: number;
  phonesBeingPaid: number;
}
