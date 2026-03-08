// src/mocks/aiPlanner.ts
import type { PlanResponse } from '@/types/aiPlanner.types';

export const MOCK_PLAN_RESPONSE: PlanResponse = {
    itinerary: [
        {
            day_label: "Ngày 1 — Khám phá trung tâm",
            morning_activities: [
                {
                    name: "Hồ Hoàn Kiếm & Tháp Rùa",
                    description: "Dạo bộ quanh hồ, ghé thăm đền Ngọc Sơn và cầu Thê Húc nổi tiếng.",
                    duration: "2 giờ",
                    estimated_cost: "Miễn phí",
                    location: "Hồ Hoàn Kiếm, Hà Nội",
                },
                {
                    name: "Phố cà phê Đinh Tiên Hoàng",
                    description: "Thưởng thức cà phê trứng đặc trưng Hà Nội tại các quán ven hồ.",
                    duration: "1 giờ",
                    estimated_cost: "50.000đ",
                    location: "Đinh Tiên Hoàng, Hoàn Kiếm",
                },
            ],
            afternoon_activities: [
                {
                    name: "Văn Miếu – Quốc Tử Giám",
                    description: "Tham quan trường đại học đầu tiên của Việt Nam, kiến trúc cổ kính.",
                    duration: "1.5 giờ",
                    estimated_cost: "30.000đ",
                    location: "58 Quốc Tử Giám, Đống Đa",
                },
                {
                    name: "Bảo tàng Lịch sử Quốc gia",
                    description: "Khám phá lịch sử Việt Nam từ thời tiền sử đến hiện đại.",
                    duration: "1.5 giờ",
                    estimated_cost: "40.000đ",
                    location: "1 Tràng Tiền, Hoàn Kiếm",
                },
            ],
            evening_activities: [
                {
                    name: "Phố cổ Hà Nội & Bún chả Hương Liên",
                    description: "Dạo phố cổ, thưởng thức bún chả nổi tiếng (nơi Obama từng ghé ăn!).",
                    duration: "2 giờ",
                    estimated_cost: "80.000đ",
                    location: "Hàng Mắm, Hoàn Kiếm",
                },
            ],
        },
        {
            day_label: "Ngày 2 — Làng nghề & Ẩm thực",
            morning_activities: [
                {
                    name: "Làng gốm Bát Tràng",
                    description: "Tham quan làng nghề gốm cổ, tự tay làm gốm và mang về làm quà.",
                    duration: "3 giờ",
                    estimated_cost: "100.000đ",
                    location: "Bát Tràng, Gia Lâm",
                },
            ],
            afternoon_activities: [
                {
                    name: "Hàng Đào & Đồng Xuân",
                    description: "Mua sắm vải, thổ cẩm, đặc sản tại chợ lớn nhất Hà Nội.",
                    duration: "2 giờ",
                    estimated_cost: "200.000đ+",
                    location: "Chợ Đồng Xuân, Hoàn Kiếm",
                },
                {
                    name: "Bánh Mì 25",
                    description: "Ăn nhẹ bánh mì Việt Nam nổi tiếng trên các tạp chí quốc tế.",
                    duration: "30 phút",
                    estimated_cost: "30.000đ",
                    location: "25 Hàng Cá, Hoàn Kiếm",
                },
            ],
            evening_activities: [
                {
                    name: "Phố đi bộ Hồ Gươm & Show Thăng Long",
                    description: "Xem múa rối nước tại nhà hát Thăng Long, đặc sắc nhất TP.",
                    duration: "2.5 giờ",
                    estimated_cost: "100.000đ",
                    location: "Đinh Tiên Hoàng, Hoàn Kiếm",
                },
            ],
        },
        {
            day_label: "Ngày 3 — Nghỉ ngơi & Khởi hành",
            morning_activities: [
                {
                    name: "Lăng Chủ tịch Hồ Chí Minh",
                    description: "Viếng lăng vào buổi sáng sớm, chiêm ngưỡng quảng trường Ba Đình.",
                    duration: "2 giờ",
                    estimated_cost: "Miễn phí",
                    location: "Ba Đình, Hà Nội",
                },
                {
                    name: "Bảo tàng Dân tộc học",
                    description: "Tìm hiểu văn hóa 54 dân tộc Việt Nam qua hiện vật và kiến trúc.",
                    duration: "1.5 giờ",
                    estimated_cost: "40.000đ",
                    location: "Nguyễn Văn Huyên, Cầu Giấy",
                },
            ],
            afternoon_activities: [
                {
                    name: "Mua quà lưu niệm tại Hàng Gai",
                    description: "Chọn mua lụa, tranh thêu, đồ thủ công mỹ nghệ trước khi về.",
                    duration: "1 giờ",
                    estimated_cost: "Tùy ý",
                    location: "Hàng Gai, Hoàn Kiếm",
                },
            ],
            evening_activities: [],
        },
    ],
};

export const MOCK_LIBRARY_ACTIVITIES = [
    { id: 'lib-1', name: 'Hồ Tây', description: 'Hồ lớn nhất Hà Nội, lý tưởng buổi sáng', duration: '1.5 giờ', estimated_cost: 'Miễn phí', location: 'Tây Hồ' },
    { id: 'lib-2', name: 'Nhà tù Hỏa Lò', description: 'Di tích lịch sử thời Pháp thuộc', duration: '1 giờ', estimated_cost: '30.000đ', location: 'Hỏa Lò, Hoàn Kiếm' },
    { id: 'lib-3', name: 'Cầu Long Biên', description: 'Cây cầu thép biểu tượng của Hà Nội', duration: '45 phút', estimated_cost: 'Miễn phí', location: 'Long Biên' },
    { id: 'lib-4', name: 'Chùa Một Cột', description: 'Kiến trúc độc đáo nghìn năm tuổi', duration: '30 phút', estimated_cost: 'Miễn phí', location: 'Ba Đình' },
    { id: 'lib-5', name: 'Phở Thìn Bờ Hồ', description: 'Phở bò nổi tiếng nhất Hà Nội', duration: '45 phút', estimated_cost: '70.000đ', location: 'Đinh Tiên Hoàng' },
    { id: 'lib-6', name: 'Hoàng thành Thăng Long', description: 'Di sản thế giới UNESCO tại trung tâm HN', duration: '2 giờ', estimated_cost: '30.000đ', location: 'Ba Đình' },
];
