
import React from 'react';

interface InputGroupProps {
  id: string;
  label: string;
  type: 'number' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
}

export const InputGroup: React.FC<InputGroupProps> = ({ id, label, type, value, onChange, options }) => {
  const commonClasses = "w-full p-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition";

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-300">
        {label}
      </label>
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
