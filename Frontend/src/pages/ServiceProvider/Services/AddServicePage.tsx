import React, { useState } from 'react';
import { Upload, X, ChevronRight, ChevronLeft, Plus, Trash2, MapPin, Calendar, Clock, CheckCircle, Users, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Textarea } from '@/components/ui/admin/textarea';
import { Label } from '@/components/ui/admin/label';
import { Badge } from '@/components/ui/admin/badge';

// Types
interface AdditionalService {
  name: string;
  price: number;
}

interface Discount {
  code: string;
  value: number;
  applied: boolean;
}

interface Feature {
  title: string;
  desc: string;
  icon: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  location: string;
  address: string;
  openingHours: string;
  duration: string;
  priceAdult: number;
  priceChild: number;
  thumbnailImage: string | null;
  additionalImages: string[];
  features: Feature[];
  additionalServices: AdditionalService[];
  discounts: Discount[];
  availability: {
    [key: string]: { [day: string]: string };
  };
}

const AdminAddServicePage: React.FC = () => {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    location: '',
    address: '',
    openingHours: '08:00 - 18:00',
    duration: 'Cả ngày',
    priceAdult: 0,
    priceChild: 0,
    thumbnailImage: null,
    additionalImages: [],
    features: [],
    additionalServices: [],
    discounts: [],
    availability: {}
  });

  // Temporary inputs
  const [newFeature, setNewFeature] = useState<Feature>({ title: '', desc: '', icon: 'info' });
  const [newService, setNewService] = useState<AdditionalService>({ name: '', price: 0 });
  const [newDiscount, setNewDiscount] = useState<Discount>({ code: '', value: 0, applied: true });
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-09');
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: string }>({});

  // Image handlers
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnailImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const readFile = (index: number) => {
        if (index >= files.length) {
          setFormData(prev => ({
            ...prev,
            additionalImages: [...prev.additionalImages, ...newImages]
          }));
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          readFile(index + 1);
        };
        reader.readAsDataURL(files[index]);
      };
      readFile(0);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  // Feature handlers
  const addFeature = () => {
    if (newFeature.title && newFeature.desc) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature }]
      }));
      setNewFeature({ title: '', desc: '', icon: 'info' });
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Additional service handlers
  const addAdditionalService = () => {
    if (newService.name && newService.price > 0) {
      setFormData(prev => ({
        ...prev,
        additionalServices: [...prev.additionalServices, { ...newService }]
      }));
      setNewService({ name: '', price: 0 });
    }
  };

  const removeAdditionalService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index)
    }));
  };

  // Discount handlers
  const addDiscount = () => {
    if (newDiscount.code && newDiscount.value > 0) {
      setFormData(prev => ({
        ...prev,
        discounts: [...prev.discounts, { ...newDiscount }]
      }));
      setNewDiscount({ code: '', value: 0, applied: true });
    }
  };

  const removeDiscount = (index: number) => {
    setFormData(prev => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index)
    }));
  };

  // Calendar handlers
  const toggleDayAvailability = (day: number) => {
    setSelectedDays(prev => {
      const key = day.toString();
      if (prev[key]) {
        const newDays = { ...prev };
        delete newDays[key];
        return newDays;
      } else {
        return { ...prev, [key]: '100K' };
      }
    });
  };

  const saveMonthAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [selectedMonth]: selectedDays
      }
    }));
  };

  // Navigation
  const proceedToReview = () => {
    saveMonthAvailability();
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToForm = () => {
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit
  const handleSubmit = async () => {
    alert('Dịch vụ đã được tạo thành công!');
    
    // Reset
    setFormData({
      name: '',
      description: '',
      location: '',
      address: '',
      openingHours: '08:00 - 18:00',
      duration: 'Cả ngày',
      priceAdult: 0,
      priceChild: 0,
      thumbnailImage: null,
      additionalImages: [],
      features: [],
      additionalServices: [],
      discounts: [],
      availability: {}
    });
    setSelectedDays({});
    setStep('form');
  };

  // Calendar data
  const months = ['Tháng 9/2025', 'Tháng 10/2025', 'Tháng 11/2025'];
  const monthKeys = ['2025-09', '2025-10', '2025-11'];
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const getDaysInMonth = (monthKey: string) => {
    const days: (null | { day: number })[] = [];
    const firstDay = monthKey === '2025-09' ? 1 : 0;

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    const maxDay = monthKey === '2025-09' ? 30 : (monthKey === '2025-10' ? 31 : 30);

    for (let i = 1; i <= maxDay; i++) {
      days.push({ day: i });
    }

    return days;
  };

  const getFeatureIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      mapPin: <MapPin className="w-5 h-5 text-primary" />,
      users: <Users className="w-5 h-5 text-primary" />,
      clock: <Clock className="w-5 h-5 text-primary" />,
      info: <Info className="w-5 h-5 text-primary" />
    };
    return icons[iconName] || <Info className="w-5 h-5 text-primary" />;
  };

  // Mock service object for ServiceDetail-like preview
  const mockService = {
    name: formData.name,
    rating: 4.8,
    reviews: 0,
    location: formData.location,
    address: formData.address,
    description: formData.description,
    openingHours: formData.openingHours,
    duration: formData.duration,
    priceAdult: formData.priceAdult,
    priceChild: formData.priceChild,
    images: [formData.thumbnailImage || '', ...formData.additionalImages].filter(Boolean),
    thumbnails: formData.additionalImages.slice(0, 4),
    features: formData.features,
    additionalServices: formData.additionalServices,
    discounts: formData.discounts,
    availability: formData.availability
  };

  // ==================== REVIEW STEP ====================
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Title Section */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold flex-1">{mockService.name}</h1>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{mockService.location}</span>
                </div>
                <Badge variant="secondary">Preview Mode</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="order-2 lg:order-1 lg:w-[120px] flex-shrink-0">
              <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
                {mockService.thumbnails.slice(0, 4).map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 flex-1">
              <div className="relative aspect-[16/10] bg-muted rounded-xl overflow-hidden group">
                {mockService.images[currentImageIndex] && (
                  <img src={mockService.images[currentImageIndex]} alt={mockService.name} className="w-full h-full object-cover" />
                )}
                
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? mockService.images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === mockService.images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {mockService.images.length}
                </div>
              </div>
            </div>
          </div>

          {/* Content + Booking Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
                <CardHeader>
                  <CardTitle>Thông tin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">{mockService.description}</p>

                  {mockService.features.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mockService.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            {getFeatureIcon(feature.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-0.5">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Calendar */}
              <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
                <CardHeader>
                  <CardTitle className="text-sm">Đặt lịch</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="grid grid-cols-3 border-b border-sidebar-border mb-1.5">
                    {months.map((month, idx) => (
                      <button
                        key={month}
                        className={`py-1 text-[9px] font-medium transition-colors ${
                          selectedMonth === monthKeys[idx]
                            ? 'bg-primary/10 text-primary border-b-2 border-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="grid grid-cols-7 gap-0.5">
                      {daysOfWeek.map(day => (
                        <div key={day} className="text-center text-[7px] font-medium text-muted-foreground py-0.5">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-0.5">
                      {getDaysInMonth(selectedMonth).map((day, idx) => (
                        <div key={idx} className="aspect-square max-w-[28px]">
                          {day ? (
                            <div className={`w-full h-full flex flex-col items-center justify-center rounded text-[8px] ${
                              mockService.availability[selectedMonth]?.[day.day.toString()]
                                ? 'bg-muted text-primary font-medium'
                                : 'bg-muted/30 text-muted-foreground'
                            }`}>
                              <span>{day.day}</span>
                              {mockService.availability[selectedMonth]?.[day.day.toString()] && (
                                <span className="text-[6px] font-semibold">
                                  {mockService.availability[selectedMonth][day.day.toString()]}
                                </span>
                              )}
                            </div>
                          ) : <div />}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-sm">ĐƠN ĐẶT DỊCH VỤ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">Địa điểm:</p>
                        <p className="text-xs text-muted-foreground">{mockService.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">Thời gian:</p>
                        <p className="text-xs text-muted-foreground">{mockService.openingHours}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">Thời hạn:</p>
                        <p className="text-xs text-muted-foreground">{mockService.duration}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">Giá cả</h4>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Người lớn (18+):</span>
                      <span className="font-bold text-primary">{mockService.priceAdult.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Trẻ em (&lt;6 tuổi):</span>
                      <span className="font-bold text-primary">{mockService.priceChild.toLocaleString()}đ</span>
                    </div>
                  </div>

                  {mockService.additionalServices.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="font-semibold text-sm">Dịch vụ thêm</h4>
                      {mockService.additionalServices.map((s, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{s.name}</span>
                          <span className="font-semibold">{s.price.toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {mockService.discounts.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-2">Mã giảm giá</h4>
                      {mockService.discounts.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-primary/10 p-2 rounded-lg mb-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="font-medium text-xs">{d.code}</span>
                          </div>
                          <span className="font-semibold text-primary text-xs">-{d.value.toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={backToForm} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1">
                      Tạo dịch vụ
                      <CheckCircle className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== FORM STEP ====================
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo dịch vụ mới</h1>
          <p className="text-muted-foreground mt-2">Điền đầy đủ thông tin để tạo dịch vụ mới</p>
        </div>

        {/* Basic Information */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên dịch vụ <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Dinh Độc Lập - Landmark Lịch Sử"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả chi tiết về dịch vụ..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm <span className="text-destructive">*</span></Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="VD: Hồ Chí Minh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ <span className="text-destructive">*</span></Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="VD: 135 Nam Kỳ Khởi Nghĩa..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingHours">Giờ mở cửa</Label>
                <Input
                  id="openingHours"
                  value={formData.openingHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                  placeholder="VD: 08:00 - 18:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Thời hạn</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="VD: Cả ngày, 2 giờ..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
          <CardHeader>
            <CardTitle>Giá cả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceAdult">Giá người lớn (VNĐ) <span className="text-destructive">*</span></Label>
                <Input
                  id="priceAdult"
                  type="number"
                  value={formData.priceAdult}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceAdult: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceChild">Giá trẻ em (VNĐ) <span className="text-destructive">*</span></Label>
                <Input
                  id="priceChild"
                  type="number"
                  value={formData.priceChild}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceChild: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
          <CardHeader>
            <CardTitle>Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Ảnh đại diện <span className="text-destructive">*</span></Label>
              {formData.thumbnailImage ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-sidebar-border">
                  <img src={formData.thumbnailImage} alt="Thumbnail" className="w-full h-full object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnailImage: null }))}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-sidebar-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Nhấp để chọn ảnh</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG (tối đa 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Additional Images */}
            <div className="space-y-2">
              <Label>Ảnh phụ</Label>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {formData.additionalImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-sidebar-border">
                    <img src={img} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeAdditionalImage(idx)}
                      className="absolute top-1 right-1 h-6 w-6"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-sidebar-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Thêm ảnh phụ</p>
                <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesUpload} className="hidden" />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
          <CardHeader>
            <CardTitle>Tiện ích</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-sidebar-border rounded-lg bg-card">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFeature(idx)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={newFeature.title}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Tiêu đề tiện ích..."
                />
                <Input
                  value={newFeature.desc}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Mô tả..."
                />
              </div>
              <Button onClick={addFeature} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm tiện ích
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Services */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
          <CardHeader>
            <CardTitle>Dịch vụ thêm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.additionalServices.length > 0 && (
              <div className="space-y-2">
                {formData.additionalServices.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-sidebar-border rounded-lg bg-card">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-sm text-primary font-semibold">{service.price.toLocaleString()}đ</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAdditionalService(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tên dịch vụ..."
                />
                <Input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="Giá (VNĐ)"
                />
              </div>
              <Button onClick={addAdditionalService} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm dịch vụ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Discounts */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
          <CardHeader>
            <CardTitle>Mã giảm giá / Ưu đãi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.discounts.length > 0 && (
              <div className="space-y-2">
                {formData.discounts.map((discount, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-sidebar-border rounded-lg bg-card">
                    <div className="flex items-center gap-2 flex-1">
                      <div>
                        <p className="font-medium text-sm">{discount.code}</p>
                        <p className="text-sm font-semibold text-primary">-{discount.value.toLocaleString()}đ</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeDiscount(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Mã giảm giá..."
                />
                <Input
                  type="number"
                  value={newDiscount.value}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, value: Number(e.target.value) }))}
                  placeholder="Giá trị giảm (VNĐ)"
                />
              </div>
              <Button onClick={addDiscount} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm mã giảm giá
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Availability Calendar - COMPACT VERSION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
              <CardHeader>
                <CardTitle>Đặt lịch trống</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-sidebar-border rounded-lg overflow-hidden shadow-sm max-w-md">
                  <div className="grid grid-cols-3 border-b border-sidebar-border">
                    {months.map((month, idx) => (
                      <button
                        key={month}
                        onClick={() => {
                          saveMonthAvailability();
                          setSelectedMonth(monthKeys[idx]);
                          setSelectedDays(formData.availability[monthKeys[idx]] || {});
                        }}
                        className={`py-1.5 text-[10px] font-medium transition-colors ${
                          selectedMonth === monthKeys[idx]
                            ? 'bg-primary/10 text-primary border-b-2 border-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-2">
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {daysOfWeek.map(day => (
                        <div key={day} className="text-center text-[8px] font-medium text-muted-foreground py-0.5">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-0.5">
                      {getDaysInMonth(selectedMonth).map((day, idx) => (
                        <div key={idx} className="aspect-square max-w-[32px]">
                          {day ? (
                            <button
                              onClick={() => toggleDayAvailability(day.day)}
                              className={`w-full h-full flex items-center justify-center rounded text-[9px] font-medium transition-all ${
                                selectedDays[day.day.toString()]
                                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {day.day}
                            </button>
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 p-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-[9px] text-primary">
                        <strong>{Object.keys(selectedDays).length}</strong> ngày đã chọn cho {months[monthKeys.indexOf(selectedMonth)]}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Summary & Tips */}
          <div className="lg:col-span-1 space-y-4">
            {/* Summary Card */}
            <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sm">Tóm tắt thông tin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Tên dịch vụ:</span>
                    <span className="font-medium text-right max-w-[150px] truncate">{formData.name || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Địa điểm:</span>
                    <span className="font-medium">{formData.location || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Giá người lớn:</span>
                    <span className="font-semibold text-primary">{formData.priceAdult > 0 ? `${formData.priceAdult.toLocaleString()}đ` : '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Giá trẻ em:</span>
                    <span className="font-semibold text-primary">{formData.priceChild > 0 ? `${formData.priceChild.toLocaleString()}đ` : '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Ảnh đại diện:</span>
                    <span className="font-medium">{formData.thumbnailImage ? '✓' : '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Ảnh phụ:</span>
                    <span className="font-medium">{formData.additionalImages.length} ảnh</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Tiện ích:</span>
                    <span className="font-medium">{formData.features.length} mục</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                    <span className="text-muted-foreground">Dịch vụ thêm:</span>
                    <span className="font-medium">{formData.additionalServices.length} mục</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Mã giảm giá:</span>
                    <span className="font-medium">{formData.discounts.length} mã</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Gợi ý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <p>Hãy điền đầy đủ thông tin để tăng độ tin cậy</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <p>Thêm ít nhất 4-5 ảnh chất lượng cao</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <p>Mô tả chi tiết giúp khách hàng hiểu rõ hơn</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <p>Đặt lịch trống giúp khách dễ dàng đặt chỗ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sm">Tiến độ hoàn thành</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Thông tin cơ bản</span>
                    <span className="font-medium">{formData.name && formData.description && formData.location ? '✓' : '-'}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${formData.name && formData.description && formData.location ? 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Giá cả</span>
                    <span className="font-medium">{formData.priceAdult > 0 ? '✓' : '-'}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${formData.priceAdult > 0 ? 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Hình ảnh</span>
                    <span className="font-medium">{formData.thumbnailImage ? '✓' : '-'}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${formData.thumbnailImage ? 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Lịch trống</span>
                    <span className="font-medium">{Object.keys(selectedDays).length > 0 ? '✓' : '-'}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${Object.keys(selectedDays).length > 0 ? 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pb-6">
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('Bạn có chắc muốn hủy? Dữ liệu sẽ không được lưu.')) {
                window.location.reload();
              }
            }}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={proceedToReview}
            className="flex-1"
          >
            Xem lại thông tin
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddServicePage;