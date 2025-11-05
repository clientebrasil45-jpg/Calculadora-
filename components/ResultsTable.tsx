import React, { useState } from 'react';
import type { MonthlyResult } from '../types.ts';

interface MobileCardRowProps {
    label: string;
    value: string | number;
    tooltip: string;
    isVisible: boolean;
    onToggle: () => void;
    className?: string;
}

interface ResultsTableProps {
    results: MonthlyResult[];
    formatCurrency: (value: number) => string;
}

const headerTooltips: Record<string, string> = {
    'Mês': 'O número do mês na simulação.',
    'Recebido': 'Valor total recebido das parcelas de vendas neste mês.',
    'Extra': 'Aporte mensal extra adicionado ao caixa.',
    'Retirado': 'Valor retirado mensalmente para pagar contas baseado na quantidade de celulares ativos (com parcelas sendo pagas).',
    'Reinvestido': 'Valor total do caixa que foi usado para comprar novos celulares neste mês.',
    'Novos Celulares': 'Quantidade de celulares comprados para revenda neste mês.',
    'Caixa Final': 'Dinheiro em caixa no final do mês após todas as operações.',
    'Lucro Acumulado': 'Lucro total acumulado desde o início da simulação (Receita Total - Custo Total - Retiradas).',
    'Crescimento (%)': 'A taxa de crescimento percentual do lucro acumulado em relação ao mês anterior.',
    'Total Celulares': 'Quantidade total de celulares comprados desde o início da simulação.',
    'Celulares Quitados': 'Número de celulares cujas todas as parcelas foram pagas.',
    'Pagamentos Ativos': 'Número de celulares que ainda possuem parcelas a serem pagas.',
};

const headers = [
    'Mês',
    'Recebido',
    'Extra',
    'Retirado',
    'Reinvestido',
    'Novos Celulares',
    'Caixa Final',
    'Lucro Acumulado',
    'Crescimento (%)',
    'Total Celulares',
    'Celulares Quitados',
    'Pagamentos Ativos',
];

const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MobileCardRow: React.FC<MobileCardRowProps> = ({ label, value, tooltip, isVisible, onToggle, className = '' }) => (
    <div className="py-2">
        <div className="flex justify-between items-center cursor-pointer" onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle()}>
            <span className="text-slate-400">{label} <InfoIcon /></span>
            <span className={`font-semibold ${className}`}>{value}</span>
        </div>
        {isVisible && <p className="text-xs text-slate-500 mt-1 p-2 bg-slate-900 rounded">{tooltip}</p>}
    </div>
);


export const ResultsTable: React.FC<ResultsTableProps> = ({ results, formatCurrency }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [mobileVisibleTooltip, setMobileVisibleTooltip] = useState<string | null>(null);

  const toggleTooltip = (header: string) => {
    setActiveTooltip(activeTooltip === header ? null : header);
  };
  
  const toggleMobileTooltip = (id: string) => {
    setMobileVisibleTooltip(mobileVisibleTooltip === id ? null : id);
  };
  
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden">
        <h2 className="text-2xl font-semibold text-white p-6 border-b border-slate-700">Detalhes Mês a Mês</h2>
        
        {/* Mobile View: Cards */}
        <div className="md:hidden p-4 space-y-4">
            {results.map(r => {
                 const growthValue = parseFloat(r.growthRate);
                 const isPositive = !isNaN(growthValue) && growthValue > 0;
                 const isNegative = !isNaN(growthValue) && growthValue < 0;
                 const growthColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400';

                 return (
                    <div key={r.month} className="bg-slate-800/50 rounded-lg p-4 divide-y divide-slate-700">
                        <h3 className="font-bold text-lg text-teal-400 pb-2">Mês {r.month}</h3>
                        <MobileCardRow label="Recebido" value={formatCurrency(r.collected)} tooltip={headerTooltips['Recebido']} isVisible={mobileVisibleTooltip === `${r.month}-Recebido`} onToggle={() => toggleMobileTooltip(`${r.month}-Recebido`)} />
                        <MobileCardRow label="Extra" value={formatCurrency(r.extraMonthly)} tooltip={headerTooltips['Extra']} isVisible={mobileVisibleTooltip === `${r.month}-Extra`} onToggle={() => toggleMobileTooltip(`${r.month}-Extra`)} />
                        <MobileCardRow label="Retirado" value={formatCurrency(r.withdrawal)} tooltip={headerTooltips['Retirado']} isVisible={mobileVisibleTooltip === `${r.month}-Retirado`} onToggle={() => toggleMobileTooltip(`${r.month}-Retirado`)} className="text-red-400" />
                        <MobileCardRow label="Reinvestido" value={formatCurrency(r.reinvestUsed)} tooltip={headerTooltips['Reinvestido']} isVisible={mobileVisibleTooltip === `${r.month}-Reinvestido`} onToggle={() => toggleMobileTooltip(`${r.month}-Reinvestido`)} />
                        <MobileCardRow label="Novos Celulares" value={r.phonesBoughtThisMonth} tooltip={headerTooltips['Novos Celulares']} isVisible={mobileVisibleTooltip === `${r.month}-Novos Celulares`} onToggle={() => toggleMobileTooltip(`${r.month}-Novos Celulares`)} />
                        <MobileCardRow label="Caixa Final" value={formatCurrency(r.cash)} tooltip={headerTooltips['Caixa Final']} isVisible={mobileVisibleTooltip === `${r.month}-Caixa Final`} onToggle={() => toggleMobileTooltip(`${r.month}-Caixa Final`)} />
                        <MobileCardRow label="Lucro Acumulado" value={formatCurrency(r.cumulativeProfit)} tooltip={headerTooltips['Lucro Acumulado']} isVisible={mobileVisibleTooltip === `${r.month}-Lucro Acumulado`} onToggle={() => toggleMobileTooltip(`${r.month}-Lucro Acumulado`)} className="text-green-400" />
                        <MobileCardRow label="Crescimento (%)" value={r.growthRate} tooltip={headerTooltips['Crescimento (%)']} isVisible={mobileVisibleTooltip === `${r.month}-Crescimento (%)`} onToggle={() => toggleMobileTooltip(`${r.month}-Crescimento (%)`)} className={growthColor} />
                        <MobileCardRow label="Total Celulares" value={r.totalPhonesBought} tooltip={headerTooltips['Total Celulares']} isVisible={mobileVisibleTooltip === `${r.month}-Total Celulares`} onToggle={() => toggleMobileTooltip(`${r.month}-Total Celulares`)} />
                        <MobileCardRow label="Celulares Quitados" value={r.phonesPaidOff} tooltip={headerTooltips['Celulares Quitados']} isVisible={mobileVisibleTooltip === `${r.month}-Celulares Quitados`} onToggle={() => toggleMobileTooltip(`${r.month}-Celulares Quitados`)} />
                        <MobileCardRow label="Pagamentos Ativos" value={r.phonesBeingPaid} tooltip={headerTooltips['Pagamentos Ativos']} isVisible={mobileVisibleTooltip === `${r.month}-Pagamentos Ativos`} onToggle={() => toggleMobileTooltip(`${r.month}-Pagamentos Ativos`)} />
                    </div>
                 );
            })}
        </div>
        
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-max text-sm text-left text-slate-300">
                <thead className="text-xs text-teal-400 uppercase bg-slate-700/50">
                <tr>
                    {headers.map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-center">
                        <button onClick={() => toggleTooltip(header)} className="uppercase font-semibold tracking-wider w-full text-center flex items-center justify-center">
                            {header}
                            <InfoIcon />
                        </button>
                    </th>
                    ))}
                </tr>
                 {activeTooltip && (
                    <tr className="bg-slate-900">
                        <td colSpan={headers.length} className="px-6 py-2 text-xs text-slate-400 text-center">
                           {headerTooltips[activeTooltip]}
                        </td>
                    </tr>
                )}
                </thead>
                <tbody>
                {results.map((r, index) => {
                  const growthValue = parseFloat(r.growthRate);
                  const isPositive = !isNaN(growthValue) && growthValue > 0;
                  const isNegative = !isNaN(growthValue) && growthValue < 0;
                  const growthColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400';

                  return (
                    <tr key={r.month} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'} border-b border-slate-700`}>
                        <td className="px-6 py-4 font-medium text-white text-center">{r.month}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(r.collected)}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(r.extraMonthly)}</td>
                        <td className="px-6 py-4 text-right text-red-400">{formatCurrency(r.withdrawal)}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(r.reinvestUsed)}</td>
                        <td className="px-6 py-4 text-center">{r.phonesBoughtThisMonth}</td>
                        <td className="px-6 py-4 text-right font-semibold">{formatCurrency(r.cash)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-green-400">{formatCurrency(r.cumulativeProfit)}</td>
                        <td className={`px-6 py-4 text-center font-medium ${growthColor}`}>{r.growthRate}</td>
                        <td className="px-6 py-4 text-center">{r.totalPhonesBought}</td>
                        <td className="px-6 py-4 text-center">{r.phonesPaidOff}</td>
                        <td className="px-6 py-4 text-center">{r.phonesBeingPaid}</td>
                    </tr>
                  );
                })}
                </tbody>
            </table>
        </div>
    </div>
  );
};
