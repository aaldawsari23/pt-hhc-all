import React, { useState, SetStateAction } from 'react';
import { ChevronDown } from 'lucide-react';

export const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-2 border-blue-200 rounded-xl bg-white shadow-lg overflow-hidden">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-3 md:p-4 font-bold text-sm md:text-base text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 flex justify-between items-center transition-all duration-200 touch-target-44">
                <span>{title}</span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-500'}`} />
            </button>
            {isOpen && (
                <div className="p-3 md:p-4 border-t-2 border-blue-100 bg-white animate-slide-up">
                    <div className="space-y-4">{children}</div>
                </div>
            )}
        </div>
    );
};

export const Fieldset: React.FC<{ legend: string; children: React.ReactNode }> = ({ legend, children }) => (
    <div className="space-y-2">
        <label className="font-bold text-sm md:text-base text-blue-800 mb-2 block flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {legend}
        </label>
        <div className="pl-4">{children}</div>
    </div>
);

const radioBase = "px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm rounded-xl border-2 transition-all duration-200 font-medium touch-target-44";
const radioActive = "bg-blue-600 text-white font-bold border-blue-600 shadow-lg scale-105";
const radioInactive = "bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 border-gray-300 shadow-sm";

// FIX: Changed onChange prop type to (v: T) => void to correctly use the generic type.
// This resolves a cascade of type errors in forms that use this component.
export const RadioGroup = <T extends string>({ value, onChange, options }: { value: T, onChange: (v: T) => void, options: readonly T[] }) => (
    <div className="flex gap-2 md:gap-3 flex-wrap">
        {options.map(opt => (
            <button type="button" key={opt} onClick={() => onChange(opt)} className={`${radioBase} ${value === opt ? radioActive : radioInactive} ${value === opt ? 'ring-4 ring-blue-200' : ''}`}>
                {opt}
            </button>
        ))}
    </div>
);

export const CheckboxGroup = <T extends string>({ value, onChange, options }: { value: Set<T>, onChange: (v: T) => void, options: readonly T[] }) => (
     <div className="flex gap-2 md:gap-3 flex-wrap">
        {options.map(opt => (
            <button type="button" key={opt} onClick={() => onChange(opt)} className={`${radioBase} ${value.has(opt) ? radioActive : radioInactive} ${value.has(opt) ? 'ring-4 ring-blue-200' : ''}`}>
                <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${value.has(opt) ? 'bg-white' : 'bg-gray-400'}`}></span>
                    {opt}
                </span>
            </button>
        ))}
    </div>
);