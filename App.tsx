import React, { useState, useEffect } from 'react';
import { initialInputs } from './constants.ts';
import { InputGroup } from './components/InputGroup.tsx';
import { SummaryCard } from './components/SummaryCard.tsx';
import { ResultsTable } from './components/ResultsTable.tsx';
import { GrowthChart } from './components/GrowthChart.tsx';
import { GeminiAnalysis } from './components/GeminiAnalysis.tsx';
import type { Inputs, MonthlyResult, SummaryData } from './types.ts';

const calculateSimulation = (currentInputs: Inputs): { monthlyResults: MonthlyResult[], summaryData: SummaryData } => {
  const {
    initialCapital,
    costPerPhone,
    initialPhones,
    entryAmount,
    installmentCount,
    installmentAmount,
    extraMonthly,
    fixedMonthlyCosts,
    withdrawalPerPhones,
    withdrawalAmount,
    reinvestMode,
    fixedReinvest,
    percentReinvest,
    months,
  } = currentInputs;

  let cash = initialCapital;
  const receivables: { monthDue: number, amount: number, phoneId: number }[] = [];
  const monthlyResults: MonthlyResult[] = [];
  let totalRevenue = 0;
  let totalPhonesBought = 0;
  let totalCost = 0;
  let totalWithdrawals = 0;
  let phoneIdCounter = 0;
  const activeSales = new Map<number, { remainingInstallments: number }>();

  const sellPhones = (count: number, currentMonth: number) => {
    for (let i = 0; i < count; i++) {
      phoneIdCounter++;
      const currentPhoneId = phoneIdCounter;
      cash += entryAmount;
      totalRevenue += entryAmount;

      if (installmentCount > 0) {
        activeSales.set(currentPhoneId, { remainingInstallments: installmentCount });
        for (let j = 1; j <= installmentCount; j++) {
          receivables.push({ monthDue: currentMonth + j, amount: installmentAmount, phoneId: currentPhoneId });
        }
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
        
        const sale = activeSales.get(receivables[i].phoneId);
        if (sale) {
            sale.remainingInstallments--;
            if (sale.remainingInstallments <= 0) {
                activeSales.delete(receivables[i].phoneId);
            }
        }
        
        receivables.splice(i, 1);
      }
    }
    totalRevenue += collected;
    cash += collected;
    cash += extraMonthly;
    cash -= fixedMonthlyCosts;
    
    let monthlyWithdrawal = 0;
    if (withdrawalPerPhones > 0 && withdrawalAmount > 0) {
      const phoneBlocks = Math.floor(totalPhonesBought / withdrawalPerPhones);
      monthlyWithdrawal = phoneBlocks * withdrawalAmount;
      cash -= monthlyWithdrawal;
      totalWithdrawals += monthlyWithdrawal;
    }

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

    const cumulativeProfit = totalRevenue - totalCost - (fixedMonthlyCosts * m) - totalWithdrawals;

    let growthRate = 'N/A';
    if (m > 1 && monthlyResults.length > 0) {
      const previousProfit = monthlyResults[m - 2].cumulativeProfit;
      if (previousProfit !== 0) {
        const growth = ((cumulativeProfit - previousProfit) / Math.abs(previousProfit)) * 100;
        growthRate = `${growth.toFixed(2)}%`;
      } else if (cumulativeProfit > 0) {
        growthRate = 'N/A';
      }
    }
    
    const phonesBeingPaid = activeSales.size;
    const phonesPaidOff = totalPhonesBought - phonesBeingPaid;

    monthlyResults.push({
      month: m,
      collected,
      extraMonthly,
      withdrawal: monthlyWithdrawal,
      reinvestUsed: actuallySpend,
      phonesBoughtThisMonth: phonesCanBuy,
      cash,
      cumulativeProfit,
      totalPhonesBought,
      growthRate,
      phonesPaidOff,
      phonesBeingPaid,
    });
  }
  
  const phonesBeingPaid = activeSales.size;
  const phonesPaidOff = totalPhonesBought - phonesBeingPaid;
  const finalTotalCost = totalCost + (fixedMonthlyCosts * months);

  const summaryData = {
    totalPhonesBought,
    totalCost: finalTotalCost,
    totalRevenue,
    totalWithdrawals,
    finalProfit: totalRevenue - finalTotalCost - totalWithdrawals,
    averageTicket: totalPhonesBought > 0 ? totalRevenue / totalPhonesBought : 0,
    phonesPaidOff,
    phonesBeingPaid,
  };

  return { monthlyResults, summaryData };
};


const App: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(initialInputs);
  const [results, setResults] = useState<MonthlyResult[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  
  const [chatHistory, setChatHistory] = useState<Array<{role: string, parts: Array<{text: string}>}>>([]);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState('');

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const startNewChat = async (currentInputs: Inputs, summaryData: SummaryData) => {
    setIsAnalyzing(true);
    setAnalysis('');
    setAnalysisError(null);
    setChatHistory([]);

    try {
        const prompt = `
        Você é um consultor financeiro especialista em pequenos negócios e análise de projeções de crescimento.
        Analise a seguinte simulação de um negócio de venda de celulares.

        **Dados da Simulação:**
        - Configuração Inicial: ${JSON.stringify(currentInputs, null, 2)}
        - Resumo Final da Simulação (${currentInputs.months} meses): ${JSON.stringify(summaryData, null, 2)}

        **Sua Tarefa:**
        Forneça uma análise concisa em 3 seções, usando texto simples com quebras de linha para formatação. Não use markdown como **negrito** ou *itálico*.

        **1. Comportamento e Trajetória:**
        Descreva a curva de crescimento. O crescimento é rápido, lento, constante? Existem pontos de virada ou estagnação evidentes?

        **2. Pontos Fortes e Oportunidades:**
        Identifique os principais motores de crescimento na simulação (ex: aporte mensal alto, boa margem). Sugira 1 ou 2 oportunidades claras de otimização (ex: "Reduzir o custo por celular em X% poderia acelerar o lucro em Y%").

        **3. Riscos e Alertas:**
        Aponte as principais vulnerabilidades do modelo de negócio simulado (ex: "A alta dependência do aporte mensal é um risco. Se ele falhar, o crescimento pode estagnar.").

        Use uma linguagem clara, direta e encorajadora. O objetivo é fornecer insights práticos para o usuário.
        `;
        
        const response = await fetch('/api/chat/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });

        if (!response.ok) throw new Error('Failed to connect to backend');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let text = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                try {
                  const parsed = JSON.parse(data);
                  text += parsed.text;
                  setAnalysis(text);
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }

        setChatHistory([
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'model', parts: [{ text }] }
        ]);

    } catch (e) {
        console.error(e);
        const errorMsg = "Não foi possível conectar à API de IA. Verifique sua conexão ou tente novamente mais tarde.";
        setAnalysisError(errorMsg);
        setAnalysis(errorMsg);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim() || chatHistory.length === 0 || isAnalyzing) return;

    setIsAnalyzing(true);
    const userMessage = `\n\n---\n\n**Usuário:** ${followUp}\n\n**Análise:**\n`;
    setAnalysis(prev => prev + userMessage);
    
    try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: followUp,
            history: chatHistory
          })
        });

        if (!response.ok) throw new Error('Failed to connect to backend');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let text = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                try {
                  const parsed = JSON.parse(data);
                  text += parsed.text;
                  setAnalysis(prev => prev.substring(0, prev.lastIndexOf(userMessage) + userMessage.length) + text);
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }

        setChatHistory(prev => [
          ...prev,
          { role: 'user', parts: [{ text: followUp }] },
          { role: 'model', parts: [{ text }] }
        ]);
        setFollowUp('');
    } catch (e) {
        console.error(e);
        const errorMsg = "\n\n---\nOcorreu um erro ao processar sua pergunta.";
        setAnalysis(prev => prev + errorMsg);
        setAnalysisError("Ocorreu um erro ao processar sua pergunta.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSimulate = () => {
    const { monthlyResults, summaryData } = calculateSimulation(inputs);
    setResults(monthlyResults);
    setSummary(summaryData);
    
    if (monthlyResults.length > 0 && summaryData.totalPhonesBought > 0) {
      startNewChat(inputs, summaryData);
    } else {
        setAnalysis('');
        setAnalysisError(null);
        setChatHistory([]);
    }
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
    } as Inputs));
  };

  const downloadCSV = () => {
    const headers = [
      'Mês',
      'Recebido (R$)',
      'Extra (R$)',
      'Retirado (R$)',
      'Reinvestido (R$)',
      'Novos Celulares',
      'Caixa Final (R$)',
      'Lucro Acumulado (R$)',
      'Crescimento (%)',
      'Total Celulares',
      'Celulares Quitados',
      'Pagamentos Ativos',
    ];
    const csvContent = [
      headers.join(';'),
      ...results.map(r =>
        [
          r.month,
          r.collected.toFixed(2),
          r.extraMonthly.toFixed(2),
          r.withdrawal.toFixed(2),
          r.reinvestUsed.toFixed(2),
          r.phonesBoughtThisMonth,
          r.cash.toFixed(2),
          r.cumulativeProfit.toFixed(2),
          r.growthRate.replace('%', ''),
          r.totalPhonesBought,
          r.phonesPaidOff,
          r.phonesBeingPaid,
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
            <InputGroup id="initialCapital" label="Capital Inicial (R$)" type="number" value={inputs.initialCapital} onChange={handleInputChange} tooltip="O dinheiro que você tem para começar o negócio." />
            <InputGroup id="costPerPhone" label="Custo por Celular (R$)" type="number" value={inputs.costPerPhone} onChange={handleInputChange} tooltip="O custo para adquirir cada celular que você vai vender." />
            <InputGroup id="initialPhones" label="Celulares Iniciais (un)" type="number" value={inputs.initialPhones} onChange={handleInputChange} tooltip="Quantos celulares você comprará com o capital inicial." />
            <InputGroup id="entryAmount" label="Valor de Entrada (R$)" type="number" value={inputs.entryAmount} onChange={handleInputChange} tooltip="O valor que o cliente paga no ato da compra." />
            <InputGroup id="installmentCount" label="Nº de Parcelas" type="number" value={inputs.installmentCount} onChange={handleInputChange} tooltip="Em quantas parcelas o restante será pago." />
            <InputGroup id="installmentAmount" label="Valor da Parcela (R$)" type="number" value={inputs.installmentAmount} onChange={handleInputChange} tooltip="O valor de cada parcela mensal." />
            <InputGroup id="extraMonthly" label="Aporte Extra Mensal (R$)" type="number" value={inputs.extraMonthly} onChange={handleInputChange} tooltip="Dinheiro extra que você adicionará ao caixa todo mês (de outra fonte de renda, por exemplo)." />
            <InputGroup id="fixedMonthlyCosts" label="Custos Fixos Mensais (R$)" type="number" value={inputs.fixedMonthlyCosts} onChange={handleInputChange} tooltip="Despesas mensais que não estão ligadas à compra de celulares (ex: aluguel, internet, software)." />
            <InputGroup id="withdrawalPerPhones" label="A cada X celulares vendidos" type="number" value={inputs.withdrawalPerPhones} onChange={handleInputChange} tooltip="A cada quantos celulares vendidos você retirará dinheiro para pagar contas. Use 0 para desativar." />
            {inputs.withdrawalPerPhones > 0 && (
              <InputGroup id="withdrawalAmount" label="Retirar por mês (R$)" type="number" value={inputs.withdrawalAmount} onChange={handleInputChange} tooltip="Quanto será retirado mensalmente por cada bloco de celulares vendidos." />
            )}
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
              tooltip="Como o dinheiro em caixa será usado para comprar mais celulares."
            />
            {inputs.reinvestMode === 'fixed' && (
              <InputGroup id="fixedReinvest" label="Valor Fixo a Reinvestir (R$)" type="number" value={inputs.fixedReinvest} onChange={handleInputChange} tooltip="A quantia exata em R$ a ser reinvestida todo mês." />
            )}
            {inputs.reinvestMode === 'percent' && (
              <InputGroup id="percentReinvest" label="Percentual a Reinvestir (%)" type="number" value={inputs.percentReinvest} onChange={handleInputChange} tooltip="A porcentagem do caixa a ser reinvestida todo mês." />
            )}
            <InputGroup id="months" label="Meses para Simular" type="number" value={inputs.months} onChange={handleInputChange} tooltip="Por quanto tempo a simulação deve rodar." />
          </div>
          <button
            onClick={handleSimulate}
            className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analisando...' : 'Simular e Analisar'}
          </button>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {summary && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Resumo da Simulação</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Celulares Vendidos" value={summary.totalPhonesBought.toString()} />
                <SummaryCard title="Celulares Quitados" value={summary.phonesPaidOff.toString()} />
                <SummaryCard title="Pagamentos Ativos" value={summary.phonesBeingPaid.toString()} />
                <SummaryCard title="Lucro Final" value={formatCurrency(summary.finalProfit)} isHighlighted />
                <SummaryCard title="Custo Total" value={formatCurrency(summary.totalCost)} />
                <SummaryCard title="Receita Total" value={formatCurrency(summary.totalRevenue)} />
                {summary.totalWithdrawals > 0 && (
                  <SummaryCard title="Total Retirado" value={formatCurrency(summary.totalWithdrawals)} />
                )}
                <SummaryCard title="Ticket Médio" value={formatCurrency(summary.averageTicket)} />
              </div>
            </div>
          )}

          <GeminiAnalysis 
            analysis={analysis} 
            isAnalyzing={isAnalyzing} 
            error={analysisError} 
            followUp={followUp}
            onFollowUpChange={(e) => setFollowUp(e.target.value)}
            onSendFollowUp={handleFollowUp}
          />

          {results.length > 0 && (
            <GrowthChart results={results} />
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
