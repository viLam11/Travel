// src/hooks/useAuthCheck.ts
import { useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook to check if user is authenticated before performing an action
 * Returns a modal state and requireAuth function
 */
export const useAuthCheck = () => {
    const { isAuthenticated } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMessage, setAuthMessage] = useState('');

    /**
     * Check if user is authenticated before executing a callback
     * @param callback - Function to execute if authenticated
     * @param message - Custom message to show if not authenticated
     * @returns boolean - true if authenticated, false otherwise
     */
    const requireAuth = (callback: () => void, message?: string): boolean => {
        if (!isAuthenticated) {
            setAuthMessage(message || 'Bạn cần đăng nhập để thực hiện chức năng này.');
            setShowAuthModal(true);
            return false;
        }

        callback();
        return true;
    };

    const closeAuthModal = () => {
        setShowAuthModal(false);
        setAuthMessage('');
    };

    return {
        requireAuth,
        isAuthenticated,
        showAuthModal,
        authMessage,
        closeAuthModal
    };
};
