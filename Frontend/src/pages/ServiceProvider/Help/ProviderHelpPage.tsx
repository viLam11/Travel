import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  CreditCard, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink,
  LifeBuoy,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Input } from '@/components/ui/admin/input';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const FAQ_DATA = [
  {
    question: "Làm thế nào để bắt đầu đăng tải dịch vụ đầu tiên?",
    answer: "Để bắt đầu, bạn hãy nhấn vào nút 'Thêm dịch vụ' ở thanh Sidebar hoặc Dashboard. Sau đó, hãy điền đầy đủ các thông tin bắt buộc như tên dịch vụ, mô tả, hình ảnh và bảng giá. Sau khi hoàn tất, Admin sẽ kiểm duyệt và kích hoạt dịch vụ của bạn."
  },
  {
    question: "Quy trình thanh toán và đối soát diễn ra như thế nào?",
    answer: "Hệ thống sẽ đối soát doanh thu của bạn vào ngày 1 và ngày 15 hàng tháng. Tiền sẽ được chuyển vào tài khoản ngân hàng bạn đã đăng ký trong mục Cài đặt thanh toán trong vòng 3-5 ngày làm việc."
  },
  {
    question: "Tôi có thể thay đổi chính sách hủy phòng không?",
    answer: "Có, bạn có thể chỉnh sửa chính sách hủy trong phần 'Quản lý dịch vụ' -> 'Chỉnh sửa' -> 'Chính sách'. Tuy nhiên, các thay đổi chỉ áp dụng cho những lượt đặt chỗ mới sau thời điểm chỉnh sửa."
  },
  {
    question: "Làm sao để xử lý khi khách hàng yêu cầu hoàn tiền?",
    answer: "Bạn nên trao đổi trực tiếp với khách hàng qua kênh chat. Nếu hai bên đồng ý, bạn có thể thực hiện thao tác hoàn tiền trong chi tiết đơn hàng hoặc liên hệ Admin để được hỗ trợ xử lý kỹ thuật."
  }
];

const ProviderHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: "Bắt đầu",
      description: "Hướng dẫn thiết lập tài khoản và tạo dịch vụ đầu tiên.",
      icon: PlusCircle,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Đơn hàng & Khách",
      description: "Cách quản lý đặt chỗ, xác nhận và phản hồi khách hàng.",
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Thanh toán",
      description: "Thông tin về phí hoa hồng, chu kỳ đối soát và rút tiền.",
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Bảo mật",
      description: "Quy định về an toàn thông tin và chính sách đối tác.",
      icon: ShieldCheck,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-12 mt-6 px-4 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-primary p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-white/20 text-white border-none mb-4 hover:bg-white/30 transition-colors uppercase font-bold tracking-wider text-[10px] px-3">
            Trung tâm hỗ trợ đối tác
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-primary-foreground/80 mb-8 text-lg font-medium">
            Tìm kiếm câu trả lời hoặc liên hệ với đội ngũ hỗ trợ để bắt đầu kinh doanh hiệu quả hơn.
          </p>
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 group-focus-within:scale-110 transition-transform" />
            <Input 
              placeholder="Nhập vấn đề bạn đang gặp phải..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 pr-4 rounded-2xl bg-white text-gray-900 border-none shadow-lg focus:ring-4 focus:ring-white/20 text-base"
            />
          </div>
        </div>
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-none bg-card cursor-pointer rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className={`${cat.bg} ${cat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{cat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                XEM THÊM <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-bold">Câu hỏi phổ biến</h2>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => (
              <div key={idx} className="bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                <details className="group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <span className="font-bold text-gray-700 group-open:text-primary transition-colors">{faq.question}</span>
                    <HelpCircle className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-dashed border-border/40 mt-2">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full text-primary font-bold hover:bg-primary/5 py-6">
            Xem tất cả tài liệu hướng dẫn <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Support Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold">Hỗ trợ trực tiếp</h2>
          </div>
          <Card className="bg-indigo-600 text-white border-none rounded-2xl overflow-hidden relative group shadow-xl shadow-indigo-200">
            <CardContent className="p-8 relative z-10">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Chat với Admin</h3>
              <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
                Đội ngũ của chúng tôi luôn sẵn sàng giải đáp các thắc mắc về kỹ thuật và chính sách 24/7.
              </p>
              <Button 
                onClick={() => navigate(ROUTES.PROVIDER_MESSAGES, { state: { openAdminChat: true } })}
                className="w-full bg-white text-indigo-600 hover:bg-indigo-50 h-12 rounded-xl font-bold transition-all cursor-pointer shadow-md"
              >
                Bắt đầu trò chuyện
              </Button>
            </CardContent>
            {/* Decoration */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
          </Card>

          <Card className="border-dashed border-2 border-border bg-muted/20 rounded-2xl">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <LifeBuoy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Gửi Ticket hỗ trợ</h4>
                <p className="text-xs text-muted-foreground mt-1">Dành cho các vấn đề phức tạp cần theo dõi tiến độ.</p>
              </div>
              <Button variant="outline" className="w-full rounded-xl text-xs font-bold cursor-pointer h-10">
                Gửi yêu cầu mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderHelpPage;
