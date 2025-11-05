
export type ReinvestMode = 'all' | 'fixed' | 'percent';

export interface SimulationInputs {
  initialCapital: number;
  costPerPhone: number;
  initialPhones: number;
  entryAmount: number;
  installmentCount: number;
  installmentAmount: number;
  extraMonthly: number;
  reinvestMode: ReinvestMode;
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
}

export interface SimulationSummary {
  totalPhonesBought: number;
  totalCost: number;
  totalRevenue: number;
  finalProfit: number;
  averageTicket: number;
}
