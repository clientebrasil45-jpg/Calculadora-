
import React, { useState, useEffect, useCallback } from 'react';
import { initialInputs } from './constants';
import type { SimulationInputs, MonthlyResult, SimulationSummary, ReinvestMode } from './types';
import { InputGroup } from './components/InputGroup';
import { SummaryCard } from './components/SummaryCard';
import { ResultsTable } from './components/ResultsTable';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<SimulationInputs>(initialInputs);
  const [results, setResults] = useState<MonthlyResult[]>([]);
  const [summary, setSummary] = useState<SimulationSummary | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const runSimulation = useCallback(() => {
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
    } = inputs;

    let cash = initialCapital;
    const receivables: { monthDue: number; amount: number }[] = [];
    const monthlyResults: MonthlyResult[] = [];
    let totalCost = 0;
    let totalRevenue = 0;
    let totalPhonesBought = 0;

    const sellPhones = (count: number, currentMonth: number) => {
      for (let i = 0; i < count; i++) {
        cash += entryAmount;
        totalRevenue += entryAmount;
        for (let j = 1; j <= installmentCount; j++) {
          receivables.push({ monthDue: currentMonth + j, amount: installmentAmount });
        }
        totalCost += costPerPhone;
        totalPhonesBought += 1;
      }
    };

    if (initialPhones > 0) {
      const maxAffordable = Math.floor(cash / costPerPhone);
      const toBuy = Math.min(initialPhones, maxAffordable);
      if (toBuy > 0) {
        cash -= toBuy * costPerPhone;
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
        sellPhones(phonesCanBuy, m);
      }

      const cumulativeProfit = totalRevenue - totalCost;
      monthlyResults.push({
        month: m,
        collected,
        extraMonthly,
        reinvestUsed: actuallySpend,
        phonesBoughtThisMonth: phonesCanBuy,
        cash,
        cumulativeProfit,
        totalPhonesBought,
      });
    }

    setResults(monthlyResults);
    setSummary({
      totalPhonesBought,
      totalCost,
      totalRevenue,
      finalProfit: totalRevenue - totalCost,
    });
  }, [inputs]);

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleReset = () => {
    setInputs(initialInputs);
  };
  
  const handleExportCsv = () => {
    if (results.length === 0) {
      alert('Faça a simulação primeiro para gerar CSV.');
      return;
    }
    const headers = 'Mês,Recebido (parcelas),Investimento extra,Reinvestido (gasto),Novos celulares,Caixa final,Lucro acumulado,Total celulares comprados\n';
    const csvContent = results.map(r => 
      `${r.month},${r.collected},${r.extraMonthly},${r.reinvestUsed},${r.phonesBoughtThisMonth},${r.cash},${r.cumulativeProfit},${r.totalPhonesBought}`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulacao_reinvestimento.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-teal-400">Calculadora de Reinvestimento</h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Venda de celulares: Edite qualquer valor e clique em "Simular" para projetar seu fluxo de caixa e lucro acumulado.</p>
      </header>

      <main>
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 border-b border-slate-700 pb-3">Parâmetros da Simulação</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <InputGroup id="initialCapital" label="Capital inicial (R$)" type="number" value={inputs.initialCapital} onChange={handleInputChange} />
                <InputGroup id="costPerPhone" label="Custo por celular (R$)" type="number" value={inputs.costPerPhone} onChange={handleInputChange} />
                <InputGroup id="initialPhones" label="Celulares comprados inicialmente" type="number" value={inputs.initialPhones} onChange={handleInputChange} />
                <InputGroup id="entryAmount" label="Entrada por venda (R$)" type="number" value={inputs.entryAmount} onChange={handleInputChange} />
                <InputGroup id="installmentCount" label="Número de parcelas" type="number" value={inputs.installmentCount} onChange={handleInputChange} />
                <InputGroup id="installmentAmount" label="Valor de cada parcela (R$)" type="number" value={inputs.installmentAmount} onChange={handleInputChange} />
                <InputGroup id="extraMonthly" label="Investimento extra mensal (R$)" type="number" value={inputs.extraMonthly} onChange={handleInputChange} />
                <InputGroup id="months" label="Meses para simular" type="number" value={inputs.months} onChange={handleInputChange} />
                <InputGroup 
                    id="reinvestMode" 
                    label="Modo de reinvestimento" 
                    type="select" 
                    value={inputs.reinvestMode} 
                    onChange={handleInputChange}
                    options={[
                        { value: 'all', label: 'Reinvestir todo o disponível' },
                        { value: 'fixed', label: 'Reinvestir valor fixo' },
                        { value: 'percent', label: 'Reinvestir porcentagem' },
                    ]}
                />
                {inputs.reinvestMode === 'fixed' && <InputGroup id="fixedReinvest" label="Valor fixo p/ reinvestir (R$)" type="number" value={inputs.fixedReinvest} onChange={handleInputChange} />}
                {inputs.reinvestMode === 'percent' && <InputGroup id="percentReinvest" label="% do disponível para reinvestir" type="number" value={inputs.percentReinvest} onChange={handleInputChange} />}
            </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-center mb-8">
            <button onClick={runSimulation} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg w-full sm:w-auto">
                Simular
            </button>
            <button onClick={handleReset} className="bg-slate-600 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                Resetar
            </button>
            <button onClick={handleExportCsv} className="bg-slate-600 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                Exportar CSV
            </button>
        </div>

        {summary && (
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-8">
                <h2 className="text-2xl font-semibold text-white mb-6 border-b border-slate-700 pb-3">Resumo da Simulação</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard title="Total de Celulares Comprados" value={summary.totalPhonesBought.toString()} />
                    <SummaryCard title="Custo Total" value={formatCurrency(summary.totalCost)} />
                    <SummaryCard title="Receita Total" value={formatCurrency(summary.totalRevenue)} />
                    <SummaryCard title="Lucro Acumulado Final" value={formatCurrency(summary.finalProfit)} isHighlighted={true} />
                </div>
            </div>
        )}

        {results.length > 0 && <ResultsTable results={results} formatCurrency={formatCurrency} />}
      </main>
    </div>
  );
};

export default App;
