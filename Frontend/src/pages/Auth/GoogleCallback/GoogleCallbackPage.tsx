// src/pages/Auth/GoogleCallback/GoogleCallbackPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

    useEffect(() => {
        const handleGoogleCallback = async () => {
            try {
                // Get token and role from URL
                const token = searchParams.get('token');
                const role = searchParams.get('role');

                if (!token) {
                    throw new Error('No token received from Google authentication');
                }

                // Save token to localStorage
                localStorage.setItem('token', token);

                // Create minimal user object for localStorage (will be refreshed by useAuth)
                const minimalUser = {
                    token,
                    user: {
                        role: role || 'USER'
                    }
                };
                localStorage.setItem('currentUser', JSON.stringify(minimalUser));

                setStatus('success');
                toast.success('Đăng nhập Google thành công!');

                // Redirect based on role
                setTimeout(() => {
                    const redirectPath = role === 'PROVIDER' ? '/admin/dashboard' : '/homepage';
                    // Use window.location to force page reload and let useAuth hook detect the token
                    window.location.href = redirectPath;
                }, 1000);

            } catch (error: any) {
                console.error('Google callback error:', error);
                setStatus('error');
                toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');

                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            }
        };

        handleGoogleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                {status === 'processing' && (
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý...</h2>
                        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h2>
                        <p className="text-gray-600">Đang chuyển hướng...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
                        <p className="text-gray-600">Đang quay lại trang đăng nhập...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleCallbackPage;
