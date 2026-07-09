import React, { createContext, useCallback, useContext, useMemo, useState } from'react';
import ConfirmModal from'../components/common/ConfirmModal';

const ConfirmContext = createContext(null);

const initialState = {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    isDestructive: true,
    onConfirm: null
};

export const ConfirmProvider = ({ children }) => {
    const [modal, setModal] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const closeConfirm = useCallback(() => {
        if (isLoading) return;
        setModal(initialState);
        setErrorMessage('');
    }, [isLoading]);

    const confirm = useCallback((options) => {
        setErrorMessage('');
        setModal({
            ...initialState,
            ...options,
            isOpen: true
        });
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!modal.onConfirm) {
            setModal(initialState);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            await modal.onConfirm();
            setModal(initialState);
        } catch (error) {
            console.error('Confirmation action failed:', error);
            setErrorMessage(error?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [modal]);

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <ConfirmModal
                isOpen={modal.isOpen}
                onClose={closeConfirm}
                onConfirm={handleConfirm}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.confirmLabel}
                cancelLabel={modal.cancelLabel}
                isDestructive={modal.isDestructive}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context.confirm;
};
