import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient from '@/services/apiClient';

// MOCK AUTH MODE - Set to true to test with mock users
const USE_MOCK_AUTH = false; // Change to true to test with mock users


// Mock Users for Testing
const MOCK_USERS = {
    customer: {
        token: 'mock-token-customer',
        user: {
            userID: 1,
            name: 'Nguyễn Văn A',
            email: 'customer@test.com',
            role: 'user',
            phoneNumber: '0901234567',
            address: 'Hà Nội',
        }
    },
    hotelProvider: {
        token: 'mock-token-hotel',
        user: {
            userID: 2,
            name: 'Khách sạn Majestic',
            email: 'hotel@test.com',
            role: 'provider',
            phoneNumber: '0902345678',
            address: 'TP.HCM',
            providerType: 'hotel' as 'hotel' | 'place',
            hasService: true, // Has completed service setup
            serviceId: 1, // Grand Hotel Saigon
        }
    },
    tourProvider: {
        token: 'mock-token-tour',
        user: {
            userID: 3,
            name: 'Tour Hà Nội',
            email: 'tour@test.com',
            role: 'provider',
            phoneNumber: '0903456789',
            address: 'Hà Nội',
            providerType: 'place' as 'hotel' | 'place',
            hasService: true, // Has completed service setup
            serviceId: 6, // Ha Long Bay Cruise
        }
    },
    admin: {
        token: 'mock-token-admin',
        user: {
            userID: 4,
            name: 'Admin System',
            email: 'admin@test.com',
            role: 'admin',
            phoneNumber: '0904567890',
            address: 'Hà Nội',
            status: 'active',
        }
    },
    pendingProvider: {
        token: 'mock-token-pending',
        user: {
            userID: 5,
            name: 'Pending Hotel',
            email: 'pending@hotel.com',
            role: 'provider',
            phoneNumber: '0905678901',
            address: 'Đà Nẵng',
            providerType: 'hotel',
            status: 'pending',
            hasService: false,
        }
    }
} as Record<string, LoginResponse>;

interface User {
    userID: number;
    name: string;
    email: string;
    role: string;
    phoneNumber?: string;
    address?: string;
    avatarUrl?: string;
    providerType?: 'hotel' | 'place'; // For providers
    hasService?: boolean; // For providers - whether they have completed service setup
    serviceId?: number; // For providers - their service ID
    status?: 'active' | 'blocked' | 'pending';
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
    role?: string; // USER, PROVIDER, etc.
    providerType?: 'hotel' | 'place'; // For providers only
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser: LoginResponse | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<any>;
    checkAuth: () => Promise<void>;
    completeServiceSetup: () => void;
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

            // Mapping backend DTO to frontend User interface
            const rawRole = userResponse.role?.toUpperCase() || 'USER';
            const normalizedRole = rawRole.startsWith('PROVIDER_') ? 'provider' : rawRole.toLowerCase();

            // Extract serviceId safely based on current BE behavior
            // "Mặc định chọn 7 if available"
            const serviceIds: any[] = (userResponse as any).serviceIds || [];
            let fetchedServiceId: number = 7; // Khởi tạo mặc định là 7 như yêu cầu
            
            if (serviceIds.includes('7') || serviceIds.includes(7)) {
                fetchedServiceId = 7;
            } else if (Array.isArray((userResponse as any).services) && (userResponse as any).services.length > 0) {
                const firstService = (userResponse as any).services[0];
                fetchedServiceId = typeof firstService === 'object' ? firstService.id : firstService;
            } else if (serviceIds.length > 0) {
                fetchedServiceId = Number(serviceIds[0]);
            } else if ((userResponse as any).serviceId) {
                fetchedServiceId = Number((userResponse as any).serviceId);
            }

            const user: User = {
                userID: userResponse.userID ?? 0,
                name: userResponse.fullname || userResponse.username || 'User',
                email: userResponse.email,
                role: normalizedRole,
                phoneNumber: userResponse.phone,
                address: userResponse.address,
                avatarUrl: userResponse.avatarUrl,
                // Derive providerType from specific provider role
                providerType: rawRole === 'PROVIDER_HOTEL' ? 'hotel' : 
                              rawRole === 'PROVIDER_VENUE' ? 'place' : undefined,
                serviceId: fetchedServiceId,
                hasService: !!fetchedServiceId,
                // Add the original specific role for component-level checks if needed
                status: userResponse.status || 'active'
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

        console.log(`LOGIN DATA: ${email}, ${password}`)
        try {
            //  MOCK MODE: Test with predefined users
            if (USE_MOCK_AUTH) {
                console.log(' MOCK AUTH MODE - Testing with mock users');

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                let mockResponse: LoginResponse | null = null;

                if (email === 'customer@test.com') {
                    mockResponse = MOCK_USERS.customer;
                } else if (email === 'hotel@test.com') {
                    mockResponse = MOCK_USERS.hotelProvider;
                } else if (email === 'tour@test.com') {
                    mockResponse = MOCK_USERS.tourProvider;
                } else if (email === 'admin@test.com') {
                    mockResponse = MOCK_USERS.admin;
                } else if (email === 'pending@hotel.com') {
                    mockResponse = MOCK_USERS.pendingProvider;
                } else {
                    throw new Error('Email không tồn tại. Sử dụng: customer@test.com, hotel@test.com, tour@test.com, admin@test.com hoặc pending@hotel.com');
                }

                if (!mockResponse) {
                    throw new Error('Mock response could not be loaded');
                }

                console.log('Mock login successful:', mockResponse);

                // Save mock data
                localStorage.setItem('token', mockResponse.token);
                localStorage.setItem('currentUser', JSON.stringify(mockResponse));

                setCurrentUser(mockResponse);
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            // Real Backend API
            const response = await apiClient.auth.login({
                email,
                password,
                remember_me: true
            }) as unknown as LoginResponse;
            console.log("Đăng nhập thành công:", response);

            // Map fullname to name if needed
            if ((response.user as any).fullname && !response.user.name) {
                response.user.name = (response.user as any).fullname;
            }

            // Normalize role and set providerType
            const rawRole = (response.user.role as string)?.toUpperCase() || 'USER';
            if (rawRole.startsWith('PROVIDER_')) {
                response.user.role = 'provider';
                response.user.providerType = rawRole === 'PROVIDER_HOTEL' ? 'hotel' : 'place';
            } else {
                response.user.role = rawRole.toLowerCase();
            }

            // Save JWT token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response));

            setCurrentUser(response);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Đăng nhập thất bại:', error);
            console.error('FULL ERROR OBJECT:', JSON.stringify(error, null, 2));

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

    const completeServiceSetup = () => {
        if (currentUser && currentUser.user) {
            const updatedUser = {
                ...currentUser,
                user: {
                    ...currentUser.user,
                    hasService: true
                }
            };
            setCurrentUser(updatedUser);
            // Also update localStorage to persist the change
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            // In a real app, you would also update this in the backend
            // apiClient.users.updateProfile({ hasService: true });
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
            checkAuth,
            completeServiceSetup
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