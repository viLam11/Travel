import React, { createContext, useContext, useState, useRef } from 'react';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        cancelText: string;
        variant: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Đồng ý',
        cancelText: 'Hủy',
        variant: 'danger',
    });

    const resolverRef = useRef<((value: boolean) => void) | undefined>(undefined);

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        setState({
            isOpen: true,
            title: options.title,
            message: options.message,
            confirmText: options.confirmText || 'Đồng ý',
            cancelText: options.cancelText || 'Hủy',
            variant: options.variant || 'danger',
        });
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    };

    const handleConfirm = () => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (resolverRef.current) resolverRef.current(true);
    };

    const handleCancel = () => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (resolverRef.current) resolverRef.current(false);
    };

    const getIcon = () => {
        switch (state.variant) {
            case 'warning':
                return <HelpCircle className="w-6 h-6 text-amber-500" />;
            case 'info':
                return <Info className="w-6 h-6 text-blue-500" />;
            default:
                return <AlertTriangle className="w-6 h-6 text-red-500" />;
        }
    };

    const getIconBg = () => {
        switch (state.variant) {
            case 'warning':
                return 'bg-amber-50 dark:bg-amber-950/20';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-950/20';
            default:
                return 'bg-red-50 dark:bg-red-950/20';
        }
    };

    const getConfirmBtnClasses = () => {
        switch (state.variant) {
            case 'warning':
                return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10 focus:ring-amber-500';
            case 'info':
                return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/10 focus:ring-blue-500';
            default:
                return 'bg-red-500 hover:bg-red-600 shadow-red-500/10 focus:ring-red-500';
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl transition-all duration-300 transform scale-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-2xl ${getIconBg()} flex items-center justify-center shrink-0`}>
                                {getIcon()}
                            </div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                {state.title}
                            </h3>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed font-medium">
                            {state.message}
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer focus:outline-none"
                            >
                                {state.cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg transition-all cursor-pointer focus:outline-none ${getConfirmBtnClasses()}`}
                            >
                                {state.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};
