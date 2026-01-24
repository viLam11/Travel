import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient from '@/services/apiClient';

interface User {
    userID: number;
    name: string;
    email: string;
    role: string;
    phoneNumber?: string;
    address?: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

interface RegisterData {
    username: string;
    fullname?: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser: LoginResponse | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<any>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // Fetch fresh profile from backend
            const userResponse = await apiClient.users.getProfile();
            console.log('User Profile Fetched:', userResponse);

            // Map backend DTO to frontend User interface
            const user: User = {
                userID: userResponse.userID ?? 0,
                name: userResponse.fullname || userResponse.username || 'User',
                email: userResponse.email,
                role: userResponse.role?.toLowerCase() || 'user',
                phoneNumber: userResponse.phone,
                address: userResponse.address
            };

            const authData: LoginResponse = { token, user };

            setCurrentUser(authData);
            setIsAuthenticated(true);

            // Update localStorage with fresh data
            localStorage.setItem('currentUser', JSON.stringify(authData));
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Optional: if error is 401, maybe logout? 
            // For now, keep existing local state if available, but it might be stale.
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check localStorage for immediate display
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                // Normalize role
                if (userData.user && userData.user.role) {
                    userData.user.role = userData.user.role.toLowerCase();
                }
                setCurrentUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
            }
        }

        // Always try to refresh from server
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);

        try {
            // Real Backend API
            const response = await apiClient.auth.login({
                email,
                password,
                remember_me: true
            }) as unknown as LoginResponse;
            console.log("Đăng nhập thành công:", response);

            // Map fullname to name if needed (if backend returns fullname in login response too)
            // But usually login response matches DTO. Let's ensure name is set.
            if ((response.user as any).fullname && !response.user.name) {
                response.user.name = (response.user as any).fullname;
            }

            // Normalize role to lowercase
            if (response.user.role) {
                response.user.role = response.user.role.toLowerCase();
            }

            // Save JWT token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response));

            setCurrentUser(response);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Đăng nhập thất bại:', error);
            console.error('🔍 FULL ERROR OBJECT:', JSON.stringify(error, null, 2));

            // Extract error message from backend response
            let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';

            if (error?.response?.data) {
                let backendMessage = '';
                if (typeof error.response.data === 'string') {
                    backendMessage = error.response.data;
                } else if (error.response.data.message) {
                    backendMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    backendMessage = error.response.data.error;
                }

                if (backendMessage) {
                    const lowerMessage = backendMessage.toLowerCase();

                    if (lowerMessage.includes('bad credentials')) {
                        errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
                    } else if (lowerMessage.includes('username not found') || lowerMessage.includes('user not found')) {
                        // Security best practice: uses generic message
                        errorMessage = 'Thông tin đăng nhập không đúng. Vui lòng thử lại.';
                    } else if (lowerMessage.includes('account not verified')) {
                        errorMessage = 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.';
                    } else if (lowerMessage.includes('account is locked') || lowerMessage.includes('account locked')) {
                        errorMessage = 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.';
                    } else {
                        errorMessage = backendMessage;
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            // Call logout API to invalidate token on server
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            await apiClient.auth.logout();
            console.log('Đăng xuất thành công (API)');
        } catch (error) {
            console.error('Đăng xuất thất bại (API):', error);
            // Continue with local logout even if API fails
        } finally {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');

            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        setIsLoading(true);

        try {
            // Call register API
            const response = await apiClient.auth.register(userData);
            console.log('Đăng ký thành công:', response);

            // Registration successful - user needs to verify email
            return response;
        } catch (error: any) {
            console.error('Đăng ký thất bại:', error);

            // Extract error message
            let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

            if (error?.response?.data) {
                let backendMessage = '';
                if (typeof error.response.data === 'string') {
                    backendMessage = error.response.data;
                } else if (error.response.data.message) {
                    backendMessage = error.response.data.message;
                }

                if (backendMessage.toLowerCase().includes('email is already in use') ||
                    backendMessage.toLowerCase().includes('email already exists')) {
                    errorMessage = 'Email đã được sử dụng. Vui lòng sử dụng email khác.';
                } else if (backendMessage.toLowerCase().includes('username is already in use') ||
                    backendMessage.toLowerCase().includes('username already exists')) {
                    errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
                } else if (backendMessage) {
                    errorMessage = backendMessage;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            currentUser,
            login,
            logout,
            register,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};