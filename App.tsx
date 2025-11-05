
import React, { useState, useEffect } from 'react';
import { initialInputs } from './constants';
import type { SimulationInputs, MonthlyResult, SimulationSummary } from './types';
import { InputGroup } from './components/InputGroup';
import { SummaryCard } from './components/SummaryCard';
import { ResultsTable } from './components/ResultsTable';

const calculateSimulation = (currentInputs: SimulationInputs) => {
  const {
    initialCapital,
    costPerPhone,
    initialPhones,
    entryAmount,
    installmentCount,
    installmentAmount,
    extraMonthly,
    reinvestMode,
    fixedReinvest,
    percentReinvest,
    months,
  } = currentInputs;

  let cash = initialCapital;
  const receivables: { monthDue: number; amount: number }[] = [];
  const monthlyResults: MonthlyResult[] = [];
  let totalRevenue = 0;
  let totalPhonesBought = 0;
  let totalCost = 0;

  const sellPhones = (count: number, currentMonth: number) => {
    for (let i = 0; i < count; i++) {
      cash += entryAmount;
      totalRevenue += entryAmount;
      for (let j = 1; j <= installmentCount; j++) {
        receivables.push({ monthDue: currentMonth + j, amount: installmentAmount });
      }
      totalPhonesBought += 1;
    }
  };

  if (initialPhones > 0 && costPerPhone > 0) {
    const maxAffordable = Math.floor(cash / costPerPhone);
    const toBuy = Math.min(initialPhones, maxAffordable);
    if (toBuy > 0) {
      const initialPurchaseCost = toBuy * costPerPhone;
      cash -= initialPurchaseCost;
      totalCost += initialPurchaseCost;
      sellPhones(toBuy, 0);
    }
  }

  for (let m = 1; m <= months; m++) {
    let collected = 0;
    for (let i = receivables.length - 1; i >= 0; i--) {
      if (receivables[i].monthDue === m) {
        collected += receivables[i].amount;
        receivables.splice(i, 1);
      }
    }
    totalRevenue += collected;
    cash += collected;
    cash += extraMonthly;

    let reinvestAmount = 0;
    if (reinvestMode === 'all') {
      reinvestAmount = cash;
    } else if (reinvestMode === 'fixed') {
      reinvestAmount = Math.min(fixedReinvest, cash);
    } else if (reinvestMode === 'percent') {
      reinvestAmount = Math.floor((percentReinvest / 100) * cash);
    }

    const phonesCanBuy = costPerPhone > 0 ? Math.floor(reinvestAmount / costPerPhone) : 0;
    const actuallySpend = phonesCanBuy * costPerPhone;

    if (phonesCanBuy > 0) {
      cash -= actuallySpend;
      totalCost += actuallySpend;
      sellPhones(phonesCanBuy, m);
    }

    const cumulativeProfit = totalRevenue - totalCost;

    let growthRate = 'N/A';
    if (m > 1) {
      const previousProfit = monthlyResults[m - 2].cumulativeProfit;
      if (previousProfit !== 0) {
        const growth = ((cumulativeProfit - previousProfit) / Math.abs(previousProfit)) * 100;
        growthRate = `${growth.toFixed(2)}%`;
      } else if (cumulativeProfit > 0) {
        growthRate = 'N/A'; // Avoid infinity, show N/A
      }
    }
    
    monthlyResults.push({
      month: m,
      collected,
      extraMonthly,
      reinvestUsed: actuallySpend,
      phonesBoughtThisMonth: phonesCanBuy,
      cash,
      cumulativeProfit,
      totalPhonesBought,
      growthRate,
    });
  }
  
  const summaryData = {
    totalPhonesBought,
    totalCost,
    totalRevenue,
    finalProfit: totalRevenue - totalCost,
    averageTicket: totalPhonesBought > 0 ? totalRevenue / totalPhonesBought : 0,
  };

  return { monthlyResults, summaryData };
};


const App: React.FC = () => {
  const [inputs, setInputs] = useState<SimulationInputs>(initialInputs);
  const [results, setResults] = useState<MonthlyResult[]>([]);
  const [summary, setSummary] = useState<SimulationSummary | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const handleSimulate = () => {
    const { monthlyResults, summaryData } = calculateSimulation(inputs);
    setResults(monthlyResults);
    setSummary(summaryData);
  };
  
  useEffect(() => {
    handleSimulate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const numValue = Number(value);
    setInputs(prev => ({
      ...prev,
      [id]: type === 'number' ? (isNaN(numValue) ? 0 : numValue) : value,
    }));
  };

  const downloadCSV = () => {
    const headers = [
      'Mês',
      'Recebido (R$)',
      'Extra (R$)',
      'Reinvestido (R$)',
      'Novos Celulares',
      'Caixa Final (R$)',
      'Lucro Acumulado (R$)',
      'Crescimento (%)',
      'Total Celulares',
    ];
    const csvContent = [
      headers.join(';'),
      ...results.map(r =>
        [
          r.month,
          r.collected.toFixed(2),
          r.extraMonthly.toFixed(2),
          r.reinvestUsed.toFixed(2),
          r.phonesBoughtThisMonth,
          r.cash.toFixed(2),
          r.cumulativeProfit.toFixed(2),
          r.growthRate.replace('%', ''),
          r.totalPhonesBought,
        ].join(';')
      ),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'simulacao_reinvestimento.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-400">Calculadora de Reinvestimento</h1>
        <p className="text-slate-400 mt-2 text-lg">Simule o crescimento do seu negócio de venda de celulares.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 bg-slate-800/50 p-6 rounded-2xl shadow-2xl h-fit lg:sticky top-8">
          <h2 className="text-2xl font-semibold text-white mb-6 border-b border-slate-700 pb-4">Configurações</h2>
          <div className="space-y-4">
            <InputGroup id="initialCapital" label="Capital Inicial (R$)" type="number" value={inputs.initialCapital} onChange={handleInputChange} />
            <InputGroup id="costPerPhone" label="Custo por Celular (R$)" type="number" value={inputs.costPerPhone} onChange={handleInputChange} />
            <InputGroup id="initialPhones" label="Celulares Iniciais (un)" type="number" value={inputs.initialPhones} onChange={handleInputChange} />
            <InputGroup id="entryAmount" label="Valor de Entrada (R$)" type="number" value={inputs.entryAmount} onChange={handleInputChange} />
            <InputGroup id="installmentCount" label="Nº de Parcelas" type="number" value={inputs.installmentCount} onChange={handleInputChange} />
            <InputGroup id="installmentAmount" label="Valor da Parcela (R$)" type="number" value={inputs.installmentAmount} onChange={handleInputChange} />
            <InputGroup id="extraMonthly" label="Aporte Extra Mensal (R$)" type="number" value={inputs.extraMonthly} onChange={handleInputChange} />
            <InputGroup
              id="reinvestMode"
              label="Modo de Reinvestimento"
              type="select"
              value={inputs.reinvestMode}
              onChange={handleInputChange}
              options={[
                { value: 'all', label: 'Tudo' },
                { value: 'fixed', label: 'Valor Fixo' },
                { value: 'percent', label: 'Percentual' },
              ]}
            />
            {inputs.reinvestMode === 'fixed' && (
              <InputGroup id="fixedReinvest" label="Valor Fixo a Reinvestir (R$)" type="number" value={inputs.fixedReinvest} onChange={handleInputChange} />
            )}
            {inputs.reinvestMode === 'percent' && (
              <InputGroup id="percentReinvest" label="Percentual a Reinvestir (%)" type="number" value={inputs.percentReinvest} onChange={handleInputChange} />
            )}
            <InputGroup id="months" label="Meses para Simular" type="number" value={inputs.months} onChange={handleInputChange} />
          </div>
          <button
            onClick={handleSimulate}
            className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Simular
          </button>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {summary && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Resumo da Simulação</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <SummaryCard title="Celulares Vendidos" value={summary.totalPhonesBought.toString()} />
                <SummaryCard title="Custo Total" value={formatCurrency(summary.totalCost)} />
                <SummaryCard title="Receita Total" value={formatCurrency(summary.totalRevenue)} />
                <SummaryCard title="Ticket Médio" value={formatCurrency(summary.averageTicket)} />
                <SummaryCard title="Lucro Final" value={formatCurrency(summary.finalProfit)} isHighlighted />
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <ResultsTable results={results} formatCurrency={formatCurrency} />
               <button
                onClick={downloadCSV}
                className="mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Exportar para CSV
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
