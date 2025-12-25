import React, { createContext, useContext, useState } from 'react';
import { AlertDialog } from './AlertDialog';
import type { AlertDialogProps } from './AlertDialog';

type ConfirmOptions = Omit<AlertDialogProps, 'open' | 'onOpenChange' | 'onConfirm' | 'onCancel'>;

interface ConfirmContextProps {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextProps | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        options: ConfirmOptions;
        resolve?: (value: boolean) => void;
    }>({
        isOpen: false,
        options: {
            title: '',
            description: ''
        }
    });

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                options,
                resolve
            });
        });
    };

    const handleConfirm = () => {
        if (confirmState.resolve) {
            confirmState.resolve(true);
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (confirmState.resolve) {
            confirmState.resolve(false);
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && confirmState.resolve) {
            confirmState.resolve(false);
        }
        setConfirmState((prev) => ({ ...prev, isOpen: open }));
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <AlertDialog
                open={confirmState.isOpen}
                onOpenChange={handleOpenChange}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                {...confirmState.options}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
} 