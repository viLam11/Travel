// src/components/common/layout/AdminLayout.tsx
import type { FC, ReactNode } from "react";

import { Outlet } from "react-router-dom";
import { AdminSideBar, SiteHeader } from "@/components/common/navigation";
import NavigationProgress from "@/components/common/navigation/NavigationProgress";
import { SidebarProvider, SidebarInset } from "@/components/ui/admin/sidebar";
import { Container } from "@/components/common/container";
import "@/admin.css";
import { AdminThemeProvider, useAdminTheme } from "@/contexts/AdminThemeContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/admin/button";
import { useNavigate } from "react-router-dom";

interface AdminLayoutProps {
    children?: ReactNode;
    showHeader?: boolean;
}

const AdminLayoutContent: FC<AdminLayoutProps> = ({
    children,
    showHeader = true
}) => {
    const { isDark } = useAdminTheme();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Check if the user is a pending provider
    const isPendingProvider = currentUser?.user?.role === 'provider' && currentUser?.user?.status === 'pending';

    if (isPendingProvider) {
        return (
            <div className={cn("min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4", isDark ? "dark bg-gray-900" : "")}>
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
                    <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-6">
                        <Clock className="w-10 h-10" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Tài Khoản Đang Chờ Duyệt
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        Cảm ơn bạn đã đăng ký trở thành Chủ dịch vụ. Hồ sơ của bạn hiện đang được ban quản trị xem xét. Quá trình này thường mất từ <span className="font-semibold text-gray-800 dark:text-gray-200">24-48 giờ làm việc</span>.
                    </p>

                    <div className="space-y-4 text-left bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700 mb-8">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-gray-900 dark:text-white">Đăng ký thành công</p>
                                <p className="text-gray-500 dark:text-gray-400">Thông tin của bạn đã được ghi nhận.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-gray-900 dark:text-white">Admin đang kiểm duyệt</p>
                                <p className="text-gray-500 dark:text-gray-400">Chúng tôi sẽ gửi email thông báo khi hoàn tất.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/homepage')}
                            className="flex-1 cursor-pointer"
                        >
                            Về trang chủ
                        </Button>
                        <Button
                            onClick={async () => {
                                await logout();
                                navigate('/login');
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("admin-theme flex h-screen overflow-hidden", isDark ? "dark" : "")}>
            <NavigationProgress />
            <SidebarProvider
                defaultOpen={true}
                style={{
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties}
            >
                <AdminSideBar variant="inset" collapsible="icon" />
                <SidebarInset className="overflow-x-hidden">
                    {showHeader && (
                        <header className="sticky top-0 z-10 bg-background border-b">
                            <SiteHeader />
                        </header>
                    )}
                    <main className="flex-1 overflow-auto">
                        <Container className="py-6" maxWidth="full" withPadding={true}>
                            {children || <Outlet />}
                        </Container>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
};
const AdminLayout: FC<AdminLayoutProps> = (props) => {
    return (
        <AdminThemeProvider>
            <AdminLayoutContent {...props} />
        </AdminThemeProvider>
    );
}

export default AdminLayout;