import React, { useState, SetStateAction } from 'react';
import { ChevronDown } from 'lucide-react';

export const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-md bg-white shadow-sm">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-2 font-semibold text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md flex justify-between items-center">
                <span>{title}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-3 border-t">{children}</div>}
        </div>
    );
};

export const Fieldset: React.FC<{ legend: string; children: React.ReactNode }> = ({ legend, children }) => (
    <div>
        <label className="font-semibold text-xs text-gray-600 mb-1 block">{legend}</label>
        {children}
    </div>
);

const radioBase = "px-2 py-1 text-xs rounded-full border transition-colors";
const radioActive = "bg-blue-600 text-white font-semibold border-blue-600";
const radioInactive = "bg-white text-gray-700 hover:border-blue-400";

// FIX: Changed onChange prop type to use the generic type `T` instead of `string`.
// This resolves a cascade of type errors in forms that use this component.
export const RadioGroup = <T extends string>({ value, onChange, options }: { value: T, onChange: (v: T) => void, options: readonly T[] }) => (
    <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
            <button type="button" key={opt} onClick={() => onChange(opt)} className={`${radioBase} ${value === opt ? radioActive : radioInactive}`}>
                {opt}
            </button>
        ))}
    </div>
);

export const CheckboxGroup = <T extends string>({ value, onChange, options }: { value: Set<T>, onChange: (v: T) => void, options: readonly T[] }) => (
     <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
            <button type="button" key={opt} onClick={() => onChange(opt)} className={`${radioBase} ${value.has(opt) ? radioActive : radioInactive}`}>
                {opt}
            </button>
        ))}
    </div>
);