import { createContext, useState, useEffect, type FC, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import type { AuthContextType, UserPermissions } from '@/types/models.types';

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => { },
    logout: () => { },
    checkAuthStatus: async () => false,
    error: null,
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await checkAuthStatus();
            } catch (err) {
                // do nothing
            } finally {
                setIsLoading(false);
            }
        };
        
        initializeAuth();
    }, []);

    const checkAuthStatus = async (): Promise<boolean> => {
        try {
            const user = await authService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
                return true;
            }
            return false;
        } catch (err) {
            setCurrentUser(null);
            return false;
        }
    };

    const login = async (email: string, password: string, rememberMe = false) => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.login({ email, password, remember_me: rememberMe });
            await getCurrentUser();
        } catch (err) {
            setCurrentUser(null);
            setError(err instanceof Error ? err.message : 'An error occurred during login');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            return user;
        } catch (err) {
            setCurrentUser(null);
            return null;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
        } catch {
            // do nothing
        } finally {
            setCurrentUser(null);
            setIsLoading(false);
        }
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        checkAuthStatus,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 