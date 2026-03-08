// src/pages/Auth/Register/RegisterLandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { User, Hotel, MapPin, ArrowRight } from 'lucide-react';

export default function RegisterLandingPage() {
    const navigate = useNavigate();

    const accountTypes = [
        {
            id: 'customer',
            title: 'Khách hàng',
            description: 'Đăng ký để đặt phòng và khám phá các điểm đến tuyệt vời',
            icon: User,
            color: 'blue',
            gradient: 'from-blue-50 to-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            buttonColor: 'bg-blue-600 hover:bg-blue-700',
            path: '/register/customer',
        },
        {
            id: 'hotel',
            title: 'Chủ khách sạn',
            description: 'Quản lý khách sạn, phòng và đặt chỗ của bạn một cách dễ dàng',
            icon: Hotel,
            color: 'orange',
            gradient: 'from-orange-50 to-orange-100',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            buttonColor: 'bg-orange-600 hover:bg-orange-700',
            path: '/register/hotel-owner',
        },
        {
            id: 'tour',
            title: 'Nhà cung cấp Tour',
            description: 'Cung cấp dịch vụ tham quan và trải nghiệm du lịch độc đáo',
            icon: MapPin,
            color: 'green',
            gradient: 'from-green-50 to-green-100',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            buttonColor: 'bg-green-600 hover:bg-green-700',
            path: '/register/tour-provider',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Chọn loại tài khoản
                    </h1>
                    <p className="text-lg text-gray-600">
                        Đăng ký để bắt đầu sử dụng Travello
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {accountTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <Card
                                key={type.id}
                                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                                onClick={() => navigate(type.path)}
                            >
                                <CardContent className={`p-8 bg-gradient-to-br ${type.gradient} h-full flex flex-col`}>
                                    {/* Icon */}
                                    <div className={`${type.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-8 h-8 ${type.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {type.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed mb-6">
                                            {type.description}
                                        </p>
                                    </div>

                                    {/* Button */}
                                    <Button
                                        className={`w-full ${type.buttonColor} text-white group-hover:gap-3 transition-all`}
                                        size="lg"
                                    >
                                        Đăng ký ngay
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Đã có tài khoản?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            Đăng nhập ngay
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
