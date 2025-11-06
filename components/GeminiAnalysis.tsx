import React from 'react';

interface GeminiAnalysisProps {
    analysis: string;
    isAnalyzing: boolean;
    error: string | null;
    followUp: string;
    onFollowUpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSendFollowUp: (e: React.FormEvent) => void;
    showSuggestion?: boolean;
    onApplySuggestion?: () => void;
    suggestedInputs?: any;
}

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-teal-400" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const GemIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m6 0l-3 3M9 7l.464-.536a5 5 0 017.072 0l.464.536M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
         <div className="h-4 bg-slate-700 rounded w-1/2"></div>
    </div>
);


export const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ 
  analysis, 
  isAnalyzing, 
  error, 
  followUp, 
  onFollowUpChange, 
  onSendFollowUp,
  showSuggestion = false,
  onApplySuggestion,
  suggestedInputs
}) => {
  
  const renderContent = () => {
    if (isAnalyzing && !analysis) {
        return <SkeletonLoader />;
    }
    
    if (error && !analysis.includes('Usuário')) {
        return (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <p className="font-bold">Ocorreu um erro ao gerar a análise.</p>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (analysis) {
        // Using a div with whiteSpace: 'pre-wrap' to respect newlines from the API response
        return <div className="text-slate-300 space-y-4" style={{ whiteSpace: 'pre-wrap' }}>{analysis}</div>;
    }

    return null;
  }
  
  if (!isAnalyzing && !error && !analysis) {
      return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
        <GemIcon />
        Análise Inteligente
      </h2>
      <div className="prose prose-slate prose-invert max-w-none">
        {renderContent()}
      </div>
      
      {showSuggestion && onApplySuggestion && suggestedInputs && (
        <div className="mt-6 bg-gradient-to-r from-teal-900/50 to-emerald-900/50 border-2 border-teal-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">💡 Sugestões de Otimização Detectadas!</h3>
              <p className="text-slate-300 text-sm mb-3">
                A IA analisou seu cenário e preparou valores otimizados para melhorar seus resultados.
              </p>
              
              {Object.keys(suggestedInputs).length > 0 && (
                <div className="mb-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Valores que serão alterados:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {suggestedInputs.costPerPhone && (
                      <div className="text-slate-300">
                        <span className="text-slate-500">Custo por Celular:</span> <span className="text-teal-400 font-semibold">R$ {suggestedInputs.costPerPhone}</span>
                      </div>
                    )}
                    {suggestedInputs.entryAmount && (
                      <div className="text-slate-300">
                        <span className="text-slate-500">Entrada:</span> <span className="text-teal-400 font-semibold">R$ {suggestedInputs.entryAmount}</span>
                      </div>
                    )}
                    {suggestedInputs.installmentAmount && (
                      <div className="text-slate-300">
                        <span className="text-slate-500">Valor Parcela:</span> <span className="text-teal-400 font-semibold">R$ {suggestedInputs.installmentAmount}</span>
                      </div>
                    )}
                    {suggestedInputs.extraMonthly && (
                      <div className="text-slate-300">
                        <span className="text-slate-500">Aporte Extra:</span> <span className="text-teal-400 font-semibold">R$ {suggestedInputs.extraMonthly}</span>
                      </div>
                    )}
                    {suggestedInputs.withdrawalPerPhones && (
                      <div className="text-slate-300">
                        <span className="text-slate-500">Retirada a cada:</span> <span className="text-teal-400 font-semibold">{suggestedInputs.withdrawalPerPhones} ativos</span>
                      </div>
                    )}
                    {suggestedInputs.withdrawalAmount && (
                      <div className="text-slate-300">
                        <span className="text-slate-500">Valor Retirada:</span> <span className="text-teal-400 font-semibold">R$ {suggestedInputs.withdrawalAmount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={onApplySuggestion}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ✨ Aplicar Sugestões Automaticamente
              </button>
            </div>
          </div>
        </div>
      )}
      
      {analysis && !error && (
        <form onSubmit={onSendFollowUp} className="mt-6 flex gap-2">
            <input
                type="text"
                value={followUp}
                onChange={onFollowUpChange}
                placeholder="Faça uma pergunta sobre a análise..."
                className="flex-grow p-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition"
                disabled={isAnalyzing}
            />
            <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center"
                disabled={isAnalyzing || !followUp.trim()}
            >
                {isAnalyzing ? <SpinnerIcon /> : 'Enviar'}
            </button>
        </form>
      )}
    </div>
  );
};
