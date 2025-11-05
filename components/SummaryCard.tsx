import React from 'react';

interface SummaryCardProps {
    title: string;
    value: string;
    isHighlighted?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isHighlighted = false }) => {
  const bgColor = isHighlighted ? 'bg-teal-500/20' : 'bg-slate-700/50';
  const textColor = isHighlighted ? 'text-teal-400' : 'text-white';

  return (
    <div className={`${bgColor} p-4 rounded-lg shadow-md`}>
      <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};
