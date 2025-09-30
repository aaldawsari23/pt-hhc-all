import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, X } from 'lucide-react';

const Toast: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-5 right-5 z-50 space-y-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className="flex items-center gap-3 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 p-3 animate-fade-in-down"
                >
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>
            ))}
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Toast;
