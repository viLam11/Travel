import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '@/services/apiClient';

// MOCK AUTH MODE - Set to true to test with mock users
const USE_MOCK_AUTH = false; // Change to true to test with mock users

// Handle Spring Security GrantedAuthority objects, string roles, ROLE_ prefix
const parseRoleEntry = (r: any): string => {
    let str = '';
    if (typeof r === 'string') str = r;
    else if (r && typeof r === 'object') str = r.authority || r.name || r.role || r.value || '';
    else str = String(r ?? '');
    return str.trim().toUpperCase().replace(/^ROLE_/, '');
};

const extractRawRoles = (roleData: any): string[] => {
    if (Array.isArray(roleData)) return roleData.map(parseRoleEntry).filter(Boolean);
    if (typeof roleData === 'string') return roleData.split(',').map(s => parseRoleEntry(s)).filter(Boolean);
    return [];
};


// Mock Users for Testing
const MOCK_USERS = {
    customer: {
        token: 'mock-token-customer',
        user: {
            userID: '1',
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
            userID: '2',
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
            userID: '3',
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
            userID: '4',
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
            userID: '5',
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
    userID: string;
    name: string;
    username?: string;
    fullname?: string;
    email: string;
    role: string; // Primary role for backward compatibility
    rawRoles?: string[]; // Array of all roles: ['PROVIDER_HOTEL', 'PROVIDER_VENUE', etc]
    phoneNumber?: string;
    address?: string;
    avatarUrl?: string;
    providerType?: 'hotel' | 'place' | 'both'; // For providers
    hasService?: boolean; // For providers - whether they have completed service setup
    serviceId?: string | number; // Primary service ID (for backward compatibility)
    services?: any[]; // Array of all services owned by the provider
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
    hasRole: (role: string) => boolean;
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
            console.log('[Auth] Fetching profile from /users/me...');
            const userResponse = await apiClient.users.getProfile();
            console.log('[Auth] Profile fetched successfully:', userResponse);

            // Extract roles array from backend response (handles string[], object[], comma-string, ROLE_ prefix)
            const rawRoles: string[] = extractRawRoles((userResponse as any).roles ?? (userResponse as any).role ?? 'USER');
            console.log('[Auth] Parsed rawRoles (checkAuth):', rawRoles);

            // Determine primary normalized role
            const isProvider = rawRoles.some(r => r.startsWith('PROVIDER_'));
            const isAdmin = rawRoles.some(r => r === 'ADMIN');
            const normalizedRole = isAdmin ? 'admin' : (isProvider ? 'provider' : 'user');

            // Strict check: if active is false or status is blocked, kick out immediately
            if (userResponse.active === false || userResponse.status === 'blocked') {
                const msg = 'Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa. Vui lòng liên hệ quản trị viên.';
                console.warn('[Auth] Account inactive/blocked. Clearing session.');
                
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
                setIsAuthenticated(false);
                
                // Store message to show after redirect
                sessionStorage.setItem('auth_error', msg);
                
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                } else {
                    // If already on login page, show it immediately
                    toast.error(msg);
                }
                return;
            }


            // Extract serviceId safely and keep all services
            let fetchedServiceId: string | number | undefined = undefined;
            let providerServices: any[] = [];

            if (Array.isArray((userResponse as any).services) && (userResponse as any).services.length > 0) {
                providerServices = (userResponse as any).services;
                const firstService = providerServices[0];
                fetchedServiceId = typeof firstService === 'object' ? firstService.id : firstService;
            } else if (Array.isArray((userResponse as any).serviceIds) && (userResponse as any).serviceIds.length > 0) {
                providerServices = (userResponse as any).serviceIds;
                fetchedServiceId = providerServices[0];
            } else if ((userResponse as any).serviceId) {
                fetchedServiceId = (userResponse as any).serviceId;
                providerServices = [fetchedServiceId];
            }

            const user: User = {
                userID: (userResponse.userID || userResponse.id)?.toString() || '',
                name: userResponse.fullname || userResponse.username || userResponse.name || 'User',
                username: userResponse.username,
                fullname: userResponse.fullname,
                email: userResponse.email,
                role: normalizedRole,
                phoneNumber: userResponse.phone || userResponse.phoneNumber,
                address: userResponse.address,
                avatarUrl: userResponse.avatarUrl,
                rawRoles: rawRoles,
                // Derive providerType from specific provider roles
                providerType: (rawRoles.includes('PROVIDER_HOTEL') && rawRoles.includes('PROVIDER_VENUE')) ? 'both' :
                              rawRoles.includes('PROVIDER_HOTEL') ? 'hotel' :
                              rawRoles.includes('PROVIDER_VENUE') ? 'place' : undefined,
                serviceId: fetchedServiceId,
                services: providerServices,
                hasService: providerServices.length > 0 || !!fetchedServiceId,
                status: (userResponse.active === false && normalizedRole === 'provider') ? 'pending' : (userResponse.status || 'active')
            };

            const authData: LoginResponse = { token, user };
            console.log('Final Auth Data (checkAuth):', authData);

            setCurrentUser(authData);
            setIsAuthenticated(true);

            // Update localStorage with fresh data
            localStorage.setItem('currentUser', JSON.stringify(authData));
        } catch (error: any) {
            console.error('Failed to fetch user profile:', error);
            // If error happens (e.g., 401 Unauthorized or blocked), log out immediately
            const status = error?.response?.status || error?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
                setIsAuthenticated(false);
                window.location.href = '/login';
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('[Auth] Initializing authentication state...');
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

        // Check for pending error messages from previous redirects
        const pendingError = sessionStorage.getItem('auth_error');
        if (pendingError) {
            toast.error(pendingError);
            sessionStorage.removeItem('auth_error');
        }
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
                password
            }) as any;
            console.log("Login API RAW Response:", response);

            // Handle structure where user and role might be sibling or nested
            const rawUser = response.user || response;
            
            // Extract roles array (handles string[], object[], comma-string, ROLE_ prefix)
            const rawRoles: string[] = extractRawRoles(rawUser.roles ?? rawUser.role ?? response.role ?? 'USER');
            console.log('[Auth] Parsed rawRoles (login):', rawRoles);

            // Determine primary normalized role
            const isProvider = rawRoles.some(r => r.startsWith('PROVIDER_'));
            const isAdmin = rawRoles.some(r => r === 'ADMIN');
            const normalizedRole = isAdmin ? 'admin' : (isProvider ? 'provider' : 'user');

            // Check if account is blocked/inactive
            const userStatus = rawUser.status || 'active';
            if (rawUser.active === false || userStatus === 'blocked') {
                const msg = 'Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa. Vui lòng liên hệ quản trị viên.';
                toast.error(msg);
                throw new Error(msg);
            }

            // Safely extract service info
            let fetchedServiceId: string | number | undefined = undefined;
            let providerServices: any[] = [];
            
            if (Array.isArray(rawUser.services) && rawUser.services.length > 0) {
                providerServices = rawUser.services;
                const firstService = providerServices[0];
                fetchedServiceId = typeof firstService === 'object' ? firstService.id : firstService;
            } else if (Array.isArray(rawUser.serviceIds) && rawUser.serviceIds.length > 0) {
                providerServices = rawUser.serviceIds;
                fetchedServiceId = providerServices[0];
            } else if (rawUser.serviceId) {
                fetchedServiceId = rawUser.serviceId;
                providerServices = [fetchedServiceId];
            }

            const user: User = {
                userID: (rawUser.userID || rawUser.id)?.toString() || '',
                name: rawUser.fullname || rawUser.username || rawUser.name || 'User',
                username: rawUser.username,
                fullname: rawUser.fullname,
                email: rawUser.email,
                role: normalizedRole,
                phoneNumber: rawUser.phone || rawUser.phoneNumber,
                address: rawUser.address,
                avatarUrl: rawUser.avatarUrl,
                rawRoles: rawRoles,
                providerType: (rawRoles.includes('PROVIDER_HOTEL') && rawRoles.includes('PROVIDER_VENUE')) ? 'both' :
                              rawRoles.includes('PROVIDER_HOTEL') ? 'hotel' :
                              rawRoles.includes('PROVIDER_VENUE') ? 'place' : undefined,
                serviceId: fetchedServiceId,
                services: providerServices,
                hasService: providerServices.length > 0 || !!fetchedServiceId,
                status: userStatus
            };

            const authData: LoginResponse = {
                token: response.token,
                user
            };

            console.log('Final Mapped Auth Data (login):', authData);

            // Save JWT token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(authData));

            setCurrentUser(authData);
            setIsAuthenticated(true);
            
            toast.success(`Chào mừng trở lại, ${user.name || 'Người dùng'}!`);

            // Re-sync profile from /users/me to ensure we have the most complete data (like serviceIds)
            // which might be missing from the initial login response
            console.log('[Auth] Login successful, re-syncing full profile...');
            await checkAuth();
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
    const hasRole = (role: string): boolean => {
        if (!currentUser?.user) return false;
        const searchRole = role.toUpperCase();
        if (currentUser.user.rawRoles && currentUser.user.rawRoles.length > 0) {
            return currentUser.user.rawRoles.includes(searchRole);
        }
        // Fallback for mock users or old data
        const fallbackRawRole = currentUser.user.providerType === 'hotel' ? 'PROVIDER_HOTEL' : 
                                currentUser.user.providerType === 'place' ? 'PROVIDER_VENUE' : 
                                currentUser.user.role.toUpperCase();
        return fallbackRawRole.includes(searchRole);
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
            completeServiceSetup,
            hasRole
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