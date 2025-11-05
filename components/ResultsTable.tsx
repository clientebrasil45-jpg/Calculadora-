
import React from 'react';
import type { MonthlyResult } from '../types';

interface ResultsTableProps {
  results: MonthlyResult[];
  formatCurrency: (value: number) => string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, formatCurrency }) => {
  const headers = [
    'Mês',
    'Recebido',
    'Extra',
    'Reinvestido',
    'Novos Celulares',
    'Caixa Final',
    'Lucro Acumulado',
    'Total Celulares',
  ];

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden">
        <h2 className="text-2xl font-semibold text-white p-6 border-b border-slate-700">Detalhes Mês a Mês</h2>
        <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm text-left text-slate-300">
                <thead className="text-xs text-teal-400 uppercase bg-slate-700/50">
                <tr>
                    {headers.map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-center">
                        {header}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {results.map((r, index) => (
                    <tr key={r.month} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'} border-b border-slate-700`}>
                        <td className="px-6 py-4 font-medium text-white text-center">{r.month}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(r.collected)}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(r.extraMonthly)}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(r.reinvestUsed)}</td>
                        <td className="px-6 py-4 text-center">{r.phonesBoughtThisMonth}</td>
                        <td className="px-6 py-4 text-right font-semibold">{formatCurrency(r.cash)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-green-400">{formatCurrency(r.cumulativeProfit)}</td>
                        <td className="px-6 py-4 text-center">{r.totalPhonesBought}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
