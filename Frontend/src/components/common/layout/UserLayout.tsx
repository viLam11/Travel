// src/components/layouts/UserLayout.tsx
import { useEffect, type FC } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import Navigation from "@/components/common/layout/NavigationUser";
import AIChatWidget from "@/components/chat/AIChatWidget";

const UserLayout: FC = () => {
  const location = useLocation();

  useEffect(() => {
    let title = "Travello - Nền tảng đặt phòng khách sạn & du lịch";
    let description = "Travello - Nền tảng đặt phòng khách sạn, vé vui chơi và tour du lịch hàng đầu Việt Nam. Trải nghiệm kỳ nghỉ tuyệt vời với giá tốt nhất.";

    const path = location.pathname;
    if (path.includes("/homepage")) {
      title = "Travello - Nền tảng đặt phòng khách sạn & du lịch";
      description = "Trang chủ Travello - Khám phá các địa điểm du lịch, khách sạn giá tốt và lên kế hoạch du lịch tự động bằng AI.";
    } else if (path.includes("/destinations")) {
      title = "Khám phá địa điểm du lịch nổi bật | Travello";
      description = "Tìm kiếm các địa điểm tham quan, vui chơi giải trí hàng đầu Việt Nam tại Travello. Đặt vé trực tuyến nhanh chóng.";
    } else if (path.includes("/hotels")) {
      title = "Đặt phòng khách sạn giá tốt nhất | Travello";
      description = "Tìm kiếm và so sánh hàng ngàn khách sạn, resort, homestay chất lượng cao với giá ưu đãi cực hấp dẫn tại Travello.";
    } else if (path.includes("/blog")) {
      title = "Cẩm nang du lịch & Kinh nghiệm thực tế | Travello";
      description = "Đọc các bài viết chia sẻ kinh nghiệm du lịch, đánh giá địa điểm, ẩm thực từ cộng đồng du lịch Travello.";
    } else if (path.includes("/ai-planner")) {
      title = "Lập kế hoạch du lịch bằng AI tự động | Travello";
      description = "Tạo lịch trình du lịch cá nhân hóa chỉ trong vài giây với sự trợ giúp của trí tuệ nhân tạo AI từ Travello.";
    } else if (path.includes("/user/profile")) {
      title = "Thông tin tài khoản | Travello";
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Scroll to top on every navigation, restore position on back/forward */}
      <ScrollRestoration />
      <Navigation />
      <main className="w-full min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <AIChatWidget />
    </div>
  );
};

export default UserLayout;