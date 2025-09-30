import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastMessage {
    id: number;
    message: string;
}

interface ToastContextType {
    showToast: (message: string) => void;
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string) => {
        const id = Date.now();
        setToasts(currentToasts => [...currentToasts, { id, message }]);
        setTimeout(() => removeToast(id), 3000); // Auto-dismiss after 3 seconds
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
