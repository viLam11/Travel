// src/components/modals/ServiceBookingModal.tsx
import React from 'react';
import { X, Plus, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import type { ServiceDetail } from '@/types/serviceDetail.types';
import { serviceDetailApi } from '../../../../api/serviceDetailApi';
import type { Discount } from '../../../../types/serviceDetail.types';
import CustomSelect from '@/components/common/CustomSelect';

interface ServiceBookingModalProps {
  ticketList: any[];
  setTicketList: (tickets: any[]) => void;
  isOpen: boolean;
  onClose: () => void;
  service: ServiceDetail;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingDuration: string;
  setBookingDuration: (duration: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerNote: string;
  setCustomerNote: (note: string) => void;
  adultCount: number;
  childCount: number;
  paymentMethod: 'MOMO' | 'VNPAY';
  setPaymentMethod: (method: 'MOMO' | 'VNPAY') => void;
  showDiscountSection: boolean;
  setShowDiscountSection: (show: boolean) => void;
  onConfirm: () => void;
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  ticketList,
  setTicketList,
  isOpen,
  onClose,
  service,
  bookingDate,
  setBookingDate,
  bookingDuration,
  setBookingDuration,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  customerNote,
  setCustomerNote,
  adultCount,
  childCount,
  paymentMethod,
  setPaymentMethod,
  showDiscountSection,
  setShowDiscountSection,
  onConfirm
}) => {
  if (!isOpen) return null;

  const [showCustomerInfo, setShowCustomerInfo] = React.useState(true);
  const [availableDiscounts, setAvailableDiscounts] = React.useState<Discount[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = React.useState<string[]>([]);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = React.useState<string[]>(
  service.additionalServices.map(s => s.name) // Mặc định chọn tất cả
  );

  const basePrice = (adultCount * service.priceAdult) + (childCount * service.priceChild) + 
    service.additionalServices
    .filter(s => selectedAdditionalServices.includes(s.name))  // Lọc theo đã chọn
    .reduce((sum, s) => sum + s.price, 0);

  const isDiscountEligible = (discount: Discount): boolean => {
    if (discount.minSpend && basePrice < discount.minSpend) {
      return false;
    }
    return true;
  };

  // Fetch real discounts from API
  React.useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const data = await serviceDetailApi.getSatisfiedDiscounts(service.id, ''); // placeCode if available
        setAvailableDiscounts(data);
      } catch (error) {
        console.error('Failed to fetch discounts:', error);
      }
    };
    if (isOpen) {
      fetchDiscounts();
    }
  }, [isOpen, service.id]);

  // Auto-select first eligible discount if any
  React.useEffect(() => {
    if (availableDiscounts.length > 0) {
      const eligible = availableDiscounts.filter(d => isDiscountEligible(d));
      if (eligible.length > 0 && selectedDiscounts.length === 0) {
        setSelectedDiscounts([eligible[0].id]);
      }
    }
  }, [availableDiscounts, basePrice]);

  const toggleDiscount = (discountId: string) => {
    const discount = availableDiscounts.find(d => d.id === discountId);
    if (!discount || !isDiscountEligible(discount)) return;

    setSelectedDiscounts(prev => 
      prev.includes(discountId)
        ? prev.filter(id => id !== discountId)
        : [...prev, discountId]
    );
  };

  const toggleAdditionalService = (serviceName: string) => {
    setSelectedAdditionalServices(prev => 
      prev.includes(serviceName)
        ? prev.filter(name => name !== serviceName)  // Bỏ chọn
        : [...prev, serviceName]                      // Thêm vào
    );
  };  


  const calculateDiscountAmount = (discount: Discount): number => {
    if (discount.percentage) {
      const amount = Math.round(basePrice * (discount.percentage / 100));
      return discount.maxDiscountAmount ? Math.min(amount, discount.maxDiscountAmount) : amount;
    }
    return discount.fixedPrice || 0;
  };

  const totalDiscount = selectedDiscounts.reduce((sum, id) => {
    const discount = availableDiscounts.find(d => d.id === id);
    return discount ? sum + calculateDiscountAmount(discount) : sum;
  }, 0);
   
  const finalPriceWithDiscounts = Math.max(0, basePrice - totalDiscount);

  // Sort discounts: eligible first, then non-eligible
  const sortedDiscounts = [...availableDiscounts].sort((a, b) => {
    const aEligible = isDiscountEligible(a);
    const bEligible = isDiscountEligible(b);
    if (aEligible && !bEligible) return -1;
    if (!aEligible && bEligible) return 1;
    return 0;
  });

  const isFormValid = () => {
    return (
      bookingDate.trim() !== '' &&
      bookingDuration.trim() !== '' &&
      customerName.trim() !== '' &&
      customerPhone.trim() !== '' &&
      customerEmail.trim() !== '' &&
      (adultCount > 0 || childCount > 0) // Ít nhất 1 vé
    );
  };


  const durationOptions = [
    { value: '1 ngày', label: '1 ngày' },
    { value: '2 ngày', label: '2 ngày' },
    { value: '3 ngày', label: '3 ngày' },
    { value: '1 tuần', label: '1 tuần' }
  ];


  const updateTicketQuantity = (id: number, delta: number) => {
  const newList = [...ticketList]; 
    const index = newList.findIndex(t => t.id === id);
  
  if (index !== -1) {
    // Chỉ thay đổi đúng phần tử tại vị trí đó
    const currentCount = newList[index].count || 0;
    newList[index] = {
      ...newList[index],
      count: Math.max(0, currentCount + delta)
    };
    setTicketList(newList);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Đơn đặt dịch vụ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-5">
              {/* Date & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ngày đặt <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all"
                    />
                  </div>
                </div>
                <CustomSelect
                  label="Hiệu lực"
                  value={bookingDuration}
                  onChange={(val) => setBookingDuration(val as string)}
                  options={durationOptions}
                />
              </div>

              {/* Customer Information */}
              <div>
                
                <button
                  onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                  className="flex md:hidden items-center justify-between w-full text-left mb-3 cursor-pointer"
                >
                  <h3 className="text-base font-bold text-gray-900">Thông tin khách hàng</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-900 transition-transform ${showCustomerInfo ? 'rotate-180' : ''}`}
                  />
                </button>
                <h3 className="hidden md:block text-base font-bold text-gray-900 mb-3">Thông tin khách hàng</h3>
                
                <div className={`space-y-3 ${showCustomerInfo ? 'block' : 'hidden md:block'}`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nhập họ tên..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Nhập email..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ghi chú thêm
                    </label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="Thêm ghi chú..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <button
                      onClick={() => setShowCustomerInfo(false)}
                      className="md:hidden w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4 rotate-180" />
                      Thu gọn
                  </button>
                </div>

                  {/* Ticket Types */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-3">Các loại vé:</h3>
                    {/* <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Người trưởng thành (trên 18):
                            </p>
                            <p className="text-sm font-bold text-orange-500">
                              {service.priceAdult.toLocaleString()} VNĐ / người
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold">{adultCount}</span>
                            <button
                              onClick={() => setAdultCount(adultCount + 1)}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Trẻ em (dưới 6 tuổi):
                            </p>
                            <p className="text-sm font-bold text-orange-500">
                              {service.priceChild.toLocaleString()} VNĐ / người
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setChildCount(Math.max(0, childCount - 1))}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold">{childCount}</span>
                            <button
                              onClick={() => setChildCount(childCount + 1)}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div> */}

                    {ticketList.map((ticket) => (
                      <div key={ticket.id} className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {ticket.name}:
                            </p>
                            <p className="text-sm font-bold text-orange-500">
                              {ticket.price} VNĐ / người
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateTicketQuantity(ticket.id, -1)}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold">{ticket.count}</span>
                            <button
                              onClick={() => updateTicketQuantity(ticket.id, +1)}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      </div>
                    ))}


                  </div>
            
                  {service.additionalServices && service.additionalServices.length > 0 && (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-3">Dịch vụ bổ sung:</h3>
                      <div className="space-y-2">
                        {service.additionalServices.map((addService) => {
                          const isSelected = selectedAdditionalServices.includes(addService.name);
                          return (
                            <button
                              key={addService.name}
                              onClick={() => toggleAdditionalService(addService.name)}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-orange-400 bg-orange-50'
                                  : 'border-gray-200 hover:border-orange-300 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* Checkbox custom */}
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    isSelected 
                                      ? 'bg-orange-500 border-orange-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  {/* Tên dịch vụ */}
                                  <span className={`text-sm font-semibold ${
                                    isSelected ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {addService.name}
                                  </span>
                                </div>
                                
                                {/* PHẦN NÀY LÀ: Giá */}
                                <span className={`text-sm font-bold ${
                                  isSelected ? 'text-orange-500' : 'text-gray-600'
                                }`}>
                                  +{addService.price.toLocaleString()} VNĐ
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* </div> */}
              </div>
            </div>

            {/* Right Column - Pricing Summary */}
            <div className="space-y-5">

              {/* Discounts */}
              <div>
                <button
                  onClick={() => setShowDiscountSection(!showDiscountSection)}
                  className="flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <h3 className="text-base font-bold text-gray-900">Ưu đãi</h3>
                  <Plus 
                    className={`w-5 h-5 text-gray-900 transition-transform ${showDiscountSection ? 'rotate-45' : ''}`}
                    style={{ position: 'static' }}
                  />
                </button>

                {showDiscountSection && (
                  <div className="mt-3 space-y-2 max-h-[265px] overflow-y-auto pr-2">
                    {sortedDiscounts.map((discount) => {
                      const isEligible = isDiscountEligible(discount);
                      const isSelected = selectedDiscounts.includes(discount.id);
                      
                      return (
                        <button
                          key={discount.id}
                          onClick={() => toggleDiscount(discount.id)}
                          disabled={!isEligible}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected && isEligible
                              ? 'border-orange-500 bg-orange-50'
                              : isEligible
                              ? 'border-gray-200 hover:border-orange-300 bg-white'
                              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isSelected && isEligible ? (
                                  <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                ) : !isEligible ? (
                                  <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                <span className={`text-sm font-semibold ${
                                  isEligible ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                  {discount.code}
                                </span>
                              </div>
                              <p className={`text-xs ${isEligible ? 'text-gray-600' : 'text-gray-400'}`}>
                                {discount.description}
                              </p>
                              {!isEligible && discount.minSpend && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Cần chi tiêu tối thiểu {discount.minSpend.toLocaleString()} VNĐ
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${
                                isEligible ? 'text-orange-500' : 'text-gray-400'
                              }`}>
                                {discount.percentage 
                                  ? `-${discount.percentage}%`
                                  : `-${(discount.fixedPrice || 0).toLocaleString()} VNĐ`}
                              </p>
                              {isEligible && isSelected && (
                                <p className="text-xs text-gray-600 mt-0.5">
                                  -{calculateDiscountAmount(discount).toLocaleString()} đ
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">Hình thức thanh toán</h3>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="MOMO"
                      checked={paymentMethod === 'MOMO'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'MOMO' | 'VNPAY')}
                      className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">💳</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Ví MoMo</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Tổng chi phí</h3>

                <div className="space-y-2 text-sm">
                  {adultCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Vé người trưởng thành x {adultCount}</span>
                    <span className="font-semibold">
                      {(adultCount * service.priceAdult).toLocaleString()} VNĐ
                    </span>
                  </div>)}

                  {childCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Vé trẻ em x {childCount}</span>
                      <span className="font-semibold">
                        {(childCount * service.priceChild).toLocaleString()} VNĐ
                      </span>
                    </div>
                  )}
                  {service.additionalServices
                    .filter(s => selectedAdditionalServices.includes(s.name))
                    .map((addService) => (
                      <div key={addService.name} className="flex items-center justify-between">
                        <span className="text-gray-700">{addService.name}</span>
                        <span className="font-semibold">
                          {addService.price.toLocaleString()} VNĐ
                        </span>
                      </div>
                  ))}
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-orange-600">
                      <span>Ưu đãi ({selectedDiscounts.length})</span>
                      <span className="font-semibold">
                        -{totalDiscount.toLocaleString()} VNĐ
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-2 mt-2"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">Tổng cộng:</span>
                    <span className="font-bold text-orange-500 text-lg">
                      {finalPriceWithDiscounts.toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              {}
              <button
                onClick={onConfirm}
                disabled={!isFormValid()}
                className={`w-full py-3.5 rounded-lg font-bold text-base transition-all ${
                  isFormValid()
                    ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isFormValid() ? 'XÁC NHẬN' : 'VUI LÒNG ĐIỀN ĐẦY ĐỦ THÔNG TIN'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingModal;