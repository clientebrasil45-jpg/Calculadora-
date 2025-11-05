import React from 'react';

interface InputGroupProps {
    id: string;
    label: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    options?: { value: string; label: string }[];
    tooltip?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ id, label, type, value, onChange, options, tooltip }) => {
  const commonClasses = "w-full p-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
        {tooltip && (
          <div className="relative group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="absolute bottom-full right-0 mb-2 w-48 p-2 text-xs text-white bg-slate-900 border border-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {tooltip}
            </span>
          </div>
        )}
      </div>
      {type === 'select' ? (
        <select id={id} value={value} onChange={onChange} className={commonClasses}>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className={commonClasses}
          min="0"
        />
      )}
    </div>
  );
};
