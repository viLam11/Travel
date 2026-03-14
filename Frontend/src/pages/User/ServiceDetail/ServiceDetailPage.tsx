// src/pages/ServiceDetailPage/ServiceDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Clock,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import BreadcrumbSection from '../../../components/common/BreadcrumbSection'
import Footer from "../../../components/common/layout/Footer";
import ServiceBookingModal from "../../../components/page/serviceDetail/modals/ServiceBookingModal";
import RoomBookingModal from "../../../components/page/serviceDetail/modals/RoomBookingModal";
import ReviewsSection from "../../../components/page/serviceDetail/reviews/ReviewsSection";
import BookingCard from "../../../components/page/serviceDetail/booking/BookingCard";
import ServiceInfoTab from "../../../components/page/serviceDetail/info/ServiceInfoTab";
import HotelInfoTab from "../../../components/page/serviceDetail/info/HotelInfoTab";
import RoomsTab from "../../../components/page/serviceDetail/info/RoomsTab";
import TicketsTab from "../../../components/page/serviceDetail/info/TicketsTab";
import type { Discount } from "@/types/serviceDetail.types";
import { getDestinationInfo } from "../../../constants/regions";
import type { AppDispatch, RootState } from "../../../store";
import {
  loadServiceDetail,
  clearServiceDetail,
} from "../../../store/slices/serviceDetailSlice";
import { useAuth } from '@/hooks/useAuth';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { discountApi } from '@/api/discountApi';
import toast from 'react-hot-toast';
import AuthModal from '@/components/common/AuthModal';
import ServiceChatWidget from '@/components/chat/ServiceChatWidget';
import apiClient from '@/services/apiClient';

// ─── Toggle mock / real API ───────────────────────────────────────────────────
const USE_MOCK = false; // set true để dùng mock data, false để gọi API thật
// ─────────────────────────────────────────────────────────────────────────────

const ServiceDetailPage: React.FC = () => {
  const { region, destination, serviceType, idSlug, id: directId } = useParams<{
    region: string;
    destination: string;
    serviceType: string;
    idSlug: string;
    id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Resolve numeric provinceCode for API calls (e.g., "ha-noi" -> "01")
  const destInfo = destination ? getDestinationInfo(destination) : null;
  const resolvedProvinceID = destInfo?.id || destination || '';

  // Auth hooks
  const { isAuthenticated, currentUser } = useAuth();
  const { requireAuth, showAuthModal, authMessage, closeAuthModal } = useAuthCheck();

  // Redux state
  const {
    data: service,
    loading,
    error,
  } = useSelector((state: RootState) => state.serviceDetail);

  // Helper: extract numeric ID from slug (e.g. "123-ten-dich-vu" → "123")
  const extractId = (slug: string | undefined): string => {
    if (!slug) return '';
    return slug.split('-')[0];
  };

  const id = directId || extractId(idSlug);

  const MOCK_ROOMS = [
    { id: 101, name: 'Room 101', type: 'Tiêu chuẩn', price: 120, capacity: 2, amenities: ['WiFi', 'Điều hòa', 'TV'], available: true, currentBookings: [{ roomId: 101, checkIn: '2025-10-20', checkOut: '2025-10-22' }] },
    { id: 102, name: 'Room 102', type: 'Tiêu chuẩn', price: 120, capacity: 2, amenities: ['WiFi', 'Điều hòa', 'TV'], available: true, currentBookings: [] },
    { id: 103, name: 'Room 103', type: 'Tiêu chuẩn', price: 120, capacity: 3, amenities: ['WiFi', 'Điều hòa', 'TV', 'Minibar'], available: true, currentBookings: [] },
    { id: 201, name: 'Room 201', type: 'Cao cấp', price: 180, capacity: 4, amenities: ['WiFi', 'Điều hòa', 'TV', 'Minibar', 'Bồn tắm'], available: true, currentBookings: [{ roomId: 201, checkIn: '2025-10-25', checkOut: '2025-10-27' }] },
    { id: 202, name: 'Room 202', type: 'Cao cấp', price: 180, capacity: 4, amenities: ['WiFi', 'Điều hòa', 'TV', 'Minibar', 'Bồn tắm'], available: true, currentBookings: [] },
    { id: 301, name: 'Room 301', type: 'Suite', price: 300, capacity: 6, amenities: ['WiFi', 'Điều hòa', 'TV', 'Minibar', 'Ban công', 'Bếp nhỏ'], available: true, currentBookings: [] },
    { id: 302, name: 'Room 302', type: 'Suite', price: 300, capacity: 6, amenities: ['WiFi', 'Điều hòa', 'TV', 'Minibar', 'Ban công', 'Bếp nhỏ'], available: false, currentBookings: [] },
  ];

  // Local state
  const [activeTab, setActiveTab] = useState<"info" | "rooms" | "reviews">("info");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2025-09");
  const [adultCount, setAdultCount] = useState(4);
  const [childCount, setChildCount] = useState(4);

  // Booking modal state
  const [showServiceBookingModal, setShowServiceBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingDuration, setBookingDuration] = useState("1 ngày");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'VNPAY' | 'ZALOPAY'>(
    'MOMO'
  );
  const [showDiscountSection, setShowDiscountSection] = useState(true);
  const [ticketList, setTicketList] = useState<any[]>([]);

  const [allRooms, setAllRooms] = useState<any[]>([]);


  // Room booking modal state - Updated for multiple rooms
  const [showRoomBookingModal, setShowRoomBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [roomType, setRoomType] = useState("Bất kỳ phòng trống");
  const [selectedRooms, setSelectedRooms] = useState<(string | number)[]>([]); // Changed to (string | number)[] to support both legacy and UUID
  const [roomFirstName, setRoomFirstName] = useState("");
  const [roomEmail, setRoomEmail] = useState("");
  const [roomPhone, setRoomPhone] = useState("");
  const [roomAddress, setRoomAddress] = useState("");
  const [roomCity, setRoomCity] = useState("");
  const [roomCountry, setRoomCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [roomPaymentMethod, setRoomPaymentMethod] = useState<'MOMO' | 'VNPAY' | 'ZALOPAY'>(
    'MOMO'
  );

  // Reviews state
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImagePreviewUrls, setReviewImagePreviewUrls] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewCost, setReviewCost] = useState("");
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [apiReviews, setApiReviews] = useState<any[]>([]); // Data from API
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [apiDiscounts, setApiDiscounts] = useState<any[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [totalApiReviews, setTotalApiReviews] = useState(0);

  // Load rooms/tickets from API when serviceId is available
  const fetchReviews = async () => {
    try {
      if (USE_MOCK) return; // Skip if forcing mock
      if (!id) return;
      setIsLoadingReviews(true);
      const response = await apiClient.comments.getByServiceId(id);
      // Response structure from backend is PageResponse which has 'content' directly or standard Axios 'data'
      // apiClient.get returns response.data directly
      if (response?.content) {
        setApiReviews(response.content);
        setTotalApiReviews(response.totalElements || response.content.length);
      } else if (Array.isArray(response)) {
        setApiReviews(response);
        setTotalApiReviews(response.length);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      if (USE_MOCK) return;
      if (!id || !resolvedProvinceID) return;
      const data = await discountApi.getSatisfiedDiscounts(id, resolvedProvinceID);
      if (Array.isArray(data) && data.length > 0) {
        setApiDiscounts(data);
      }
    } catch (error) {
      console.error("Failed to fetch discounts", error);
    }
  };

  useEffect(() => {
    const loadRoomsOrTickets = async () => {
      if (!id) return;

      if (USE_MOCK) {
        setAllRooms(MOCK_ROOMS);
        return;
      }

      try {
        const data: any[] = await apiClient.tickets.getByServiceId(id);
        // Map backend ticket/room response to UI shape
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.roomID || item.id, // Fallback to roomID for hotels
          name: item.roomName ?? item.name ?? `Room ${item.roomID || item.id}`,
          type: item.roomType ?? item.ticketType ?? '',
          price: item.price ?? item.pricePerNight ?? 0,
          capacity: item.capacity ?? item.maxGuests ?? 2,
          amenities: item.amenities ?? [],
          available: item.available ?? item.isAvailable ?? true,
          currentBookings: item.currentBookings ?? [],
          description: item.description ?? '',
          quantity: item.quantity ?? item.remainingQuantity ?? 0,
          count: 0 // Initialize count for UI
        }));

        if (serviceType === 'hotel') {
          setAllRooms(mapped);
        } else {
          setTicketList(mapped);
          setAllRooms([]);
        }
      } catch (err) {
        console.error('Failed to load rooms/tickets', err);
        if (serviceType === 'hotel') {
          setAllRooms(MOCK_ROOMS);
        } else {
          setTicketList([]);
        }
      }
    };

    loadRoomsOrTickets();
    if (id) {
        fetchReviews();
        fetchDiscounts();
    }
  }, [id, serviceType, resolvedProvinceID]); // Stabilize dependency array


  // Load service detail
  useEffect(() => {
    // If none of the access methods are provided, go home
    if (!directId && (!destination || !serviceType || !idSlug || !region)) {
      navigate('/homepage');
      return;
    }

    const finalId = directId || extractId(idSlug);
    dispatch(loadServiceDetail({ 
      destination: destination || undefined, 
      serviceType: serviceType || undefined, 
      id: finalId 
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      dispatch(clearServiceDetail());
    };
  }, [directId, destination, serviceType, idSlug, region, dispatch, navigate]);

  // Handlers
  const handlePrevImage = () => {
    if (!service) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? service.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!service) return;
    setCurrentImageIndex((prev) =>
      prev === service.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleBookNow = () => {
    requireAuth(() => {
      setShowServiceBookingModal(true);
      document.body.style.overflow = "hidden";
    }, 'Vui lòng đăng nhập để đặt dịch vụ');
  };

  const handleCloseModal = () => {
    setShowServiceBookingModal(false);
    document.body.style.overflow = "unset";
  };

  const handleConfirmBooking = async (selectedDiscountIds: string[]) => {
    if (!service) return;

    if (USE_MOCK) {
      // Mock: chỉ log và đóng modal
      console.log('[MOCK] Booking confirmed:', { bookingDate, customerName, customerPhone, customerNote, adultCount, childCount });
      toast.success('[Mock] Đặt dịch vụ thành công!');
      handleCloseModal();
      return;
    }

    if (isBooking) return;
    setIsBooking(true);

    try {
      const tickets = ticketList
        .filter((t: any) => t.count > 0)
        .map((t: any) => ({
          // Standardize ID as string to match UUID expectations
          id: t.id.toString(),
          quantity: Number(t.count),
          // Backend now expects dates per item
          checkInDate: bookingDate ? `${bookingDate}T00:00:00.000Z` : new Date().toISOString(),
          checkOutDate: bookingDate ? `${bookingDate}T23:59:59.000Z` : new Date().toISOString(),
        }));

      const payload = {
        tickets,
        rooms: [],
        guestPhone: customerPhone,
        note: customerNote || undefined,
        discountIds: selectedDiscountIds?.map(id => id.toString()) || [],
      };

      console.log('[DEBUG] Order Payload:', payload);

      const response: any = await apiClient.orders.create(payload);

      toast.success('Đặt dịch vụ thành công!');
      handleCloseModal();
      
      const payUrl = response?.payUrl || response?.order_url || response?.shortLink;
      const orderId = response?.id || response?.orderId || response?.orderID;
      const finalPrice = response?.totalPrice || response?.amount || 0;

      // Only redirect to backend-provided payUrl if MOMO is selected
      if (paymentMethod === 'MOMO' && payUrl) {
        window.location.href = payUrl;
      } else if (orderId) {
        // For VNPAY or ZALOPAY, or if no MOMO link, trigger manual payment flow
        handleSelectPayment(paymentMethod.toLowerCase() as any, orderId.toString(), finalPrice);
      }
    } catch (err: any) {
      console.error('Order creation error details:', err?.response?.data || err);
      
      const rawMessage = err?.response?.data?.message || err?.response?.data || err?.message || '';
      
      // Feature: Friendly error translation for backend data issues
      const errorMessage = translateError(rawMessage);
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  /**
   * Helper to translate technical backend errors to user-friendly messages
   */
  const translateError = (message: string) => {
    if (message.includes('No enum constant') || message.includes('PROVIDER_HOTEL')) {
      return 'Dịch vụ này tạm thời không thể đặt do lỗi dữ liệu từ Nhà cung cấp (PROVIDER_HOTEL). Vui lòng chọn dịch vụ khác.';
    }
    if (message.includes('Unable to find com.travollo.Travel.entity.User with id 5')) {
      return 'Lỗi hệ thống: Không tìm thấy thông tin Nhà cung cấp (ID: 5). Vui lòng báo cáo lỗi này.';
    }
    return message || 'Đặt dịch vụ thất bại. Vui lòng thử lại sau.';
  };

  const handleRoomBookNow = (room?: any) => {
    requireAuth(() => {
      // Pre-fill room type if room is provided
      if (room) {
        setRoomType(room.title);
      }
      setShowRoomBookingModal(true);
      document.body.style.overflow = "hidden";
    }, 'Vui lòng đăng nhập để đặt phòng');
  };

  const handleCloseRoomModal = () => {
    setShowRoomBookingModal(false);
    document.body.style.overflow = "unset";
  };

  const handleConfirmRoomBooking = async (selectedDiscountIds: string[]) => {
    if (selectedRooms.length === 0) {
      toast.error('Vui lòng chọn ít nhất một phòng');
      return;
    }

    if (USE_MOCK) {
      // Mock: chỉ log và đóng modal
      console.log('[MOCK] Room booking confirmed:', { checkInDate, checkOutDate, selectedRooms, roomPhone, specialRequests });
      toast.success('[Mock] Đặt phòng thành công!');
      handleCloseRoomModal();
      return;
    }

    if (isBooking) return;
    setIsBooking(true);

    try {
      const rooms = selectedRooms.map((roomId: string | number) => ({
        id: roomId,
        quantity: 1,
        // Backend now expects dates per item
        checkInDate: checkInDate ? `${checkInDate}T14:00:00.000Z` : new Date().toISOString(),
        checkOutDate: checkOutDate ? `${checkOutDate}T12:00:00.000Z` : new Date().toISOString(),
      }));

      const response: any = await apiClient.orders.create({
        tickets: [],
        rooms,
        guestPhone: roomPhone,
        note: specialRequests || undefined,
        discountIds: selectedDiscountIds,
      });

      const payUrl = response?.payUrl || response?.order_url || response?.shortLink;
      const orderId = response?.id || response?.orderId || response?.orderID;
      const finalPrice = response?.totalPrice || response?.amount || 0;

      // Only redirect to backend-provided payUrl if MOMO is selected
      if (roomPaymentMethod === 'MOMO' && payUrl) {
        window.location.href = payUrl;
      } else if (orderId) {
        // For VNPAY or ZALOPAY, trigger manual payment flow
        handleSelectPayment(roomPaymentMethod.toLowerCase() as any, orderId.toString(), finalPrice);
      }
    } catch (err: any) {
      console.error('Room order create error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Đặt phòng thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const handleSelectPayment = async (method: 'vnpay' | 'zalopay' | 'momo', orderId: string | number, amount: number) => {
    const targetOrderId = orderId;
    const finalAmount = amount;

    if (!targetOrderId) return;
    
    const loadingToast = toast.loading('Đang khởi tạo thanh toán...');
    try {
      let response: any;
      if (method === 'vnpay') {
        response = await apiClient.payments.vnpay.createPayment(
          `Thanh toan don hang ${id}`,
          'other',
          finalAmount,
          'vn'
        );
      } else if (method === 'zalopay') {
        response = await apiClient.payments.zalopay.createOrder(
          currentUser?.user?.name || 'User',
          finalAmount,
          Number(id)
        );
      } else if (method === 'momo') {
        response = await apiClient.payments.momo.createOrder(
          finalAmount,
          id.toString()
        );
      }

      toast.dismiss(loadingToast);
      
      // Redirect to payment URL
      const paymentUrl = response?.paymentUrl || response?.order_url || response?.payUrl || response;
      if (typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
        window.location.href = paymentUrl;
      } else {
        toast.error('Không tìm thấy link thanh toán. Vui lòng kiểm tra lại đơn hàng.');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Lỗi khi khởi tạo thanh toán.');
      console.error('Payment error:', error);
    }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const newPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));
      
      setReviewImages((prev) => [...prev, ...fileArray].slice(0, 12));
      setReviewImagePreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 12));
    }
  };

  const handleRemoveImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
    setReviewImagePreviewUrls((prev) => {
      // Release memory for removed object URL
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (isSubmittingReview) return;
    setIsSubmittingReview(true);
    
    requireAuth(async () => {
      try {
        if (!USE_MOCK) {
          // Call actual backend API
          await apiClient.comments.create(id, reviewText, reviewRating, reviewImages);
          toast.success('Đánh giá của bạn đã được gửi!');
          // Refresh reviews
          setTimeout(() => fetchReviews(), 500); // Small delay to ensure DB is updated
        } else {
          // Mock submission behavior
          const newReview = {
            id: Date.now(),
            author: currentUser?.user?.name || "Bạn", 
            date: new Date().toLocaleDateString("vi-VN"),
            rating: reviewRating,
            title: reviewTitle,
            content: reviewText,
            cost: reviewCost,
            images: reviewImagePreviewUrls,
            helpful: 0,
            notHelpful: 0,
          };
          setUserReviews((prev) => [newReview, ...prev]);
          toast.success('Đánh giá của bạn đã được gửi (Mock)!');
        }

        // Reset form
        setReviewRating(0);
        setReviewTitle("");
        setReviewText("");
        setReviewCost("");
        setReviewImages([]);
        setReviewImagePreviewUrls([]);
      } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error);
        toast.error("Không thể gửi đánh giá, vui lòng thử lại sau.");
      } finally {
        setIsSubmittingReview(false);
      }
    }, 'Vui lòng đăng nhập để đánh giá');
  };



  const getDaysInMonth = (monthKey: string) => {
    if (!service) return [];
    const availability = service.availability[monthKey] || {};
    const days: (null | {
      day: number;
      price: string | null;
      available: boolean;
    })[] = [];
    const firstDay = monthKey === "2025-09" ? 1 : 0;

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    const maxDay = monthKey === "2025-09" ? 30 : monthKey === "2025-10" ? 5 : 0;

    for (let i = 1; i <= maxDay; i++) {
      days.push({
        day: i,
        price: availability[i.toString()] || null,
        available: !!availability[i.toString()],
      });
    }

    return days;
  };

  const getFeatureIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      mapPin: <MapPin className="w-6 h-6 text-orange-500" />,
      utensils: <Info className="w-6 h-6 text-orange-500" />,
      users: <Users className="w-6 h-6 text-orange-500" />,
      clock: <Clock className="w-6 h-6 text-orange-500" />,
      car: <Info className="w-6 h-6 text-orange-500" />,
      percent: <Info className="w-6 h-6 text-orange-500" />,
    };
    return icons[iconName] || <Info className="w-6 h-6 text-orange-500" />;
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      author: "Ali Tufan",
      date: "April 2023",
      rating: 5,
      title: "Take this tour! Its fantastic!",
      content:
        "Great for 4-5 hours to explore. Really a lot to see and tons of photo spots. Even have a passport for you to collect all the stamps as a souvenir. Must see for a Harry Potter fan.",
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
        "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
      ],
      helpful: 0,
      notHelpful: 0,
    },
    {
      id: 2,
      author: "Ali Tufan",
      date: "April 2023",
      rating: 5,
      title: "Take this tour! Its fantastic!",
      content:
        "Great for 4-5 hours to explore. Really a lot to see and tons of photo spots. Even have a passport for you to collect all the stamps as a souvenir. Must see for a Harry Potter fan.",
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
        "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
      ],
      helpful: 0,
      notHelpful: 0,
    },
  ];

  // If we have real API reviews, use them + user's newly mock-added reviews. 
  // Otherwise, fallback to the hardcoded `reviews` array + user's local reviews.
  const hasRealReviews = apiReviews.length > 0;
  
  // Format API reviews to match frontend expected structure
  const formattedApiReviews = apiReviews.map(r => ({
    id: r.id,
    author: r.user?.fullname || r.user?.username || "Người dùng",
    date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
    rating: r.rating || 5,
    title: "", // Backend might not have title
    content: r.content,
    images: r.images?.map((img: any) => img.url) || [],
    helpful: r.likeCount || 0,
    notHelpful: r.dislikeCount || 0,
    userAvatar: r.user?.avatar,
  }));

  const allReviews = hasRealReviews 
    ? [...userReviews, ...formattedApiReviews] 
    : [...userReviews, ...reviews];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> */}
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-white">
        {/* <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> */}
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy dịch vụ
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Dịch vụ này không tồn tại hoặc đã bị xóa"}
            </p>
            <button
              onClick={() => navigate("/homepage")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalPrice = serviceType === 'hotel'
    ? (service.priceAdult + service.priceChild) // Fallback for hotel sidebar if rooms not selected
    : (ticketList.length > 0 
        ? ticketList.reduce((sum, t) => sum + (t.count || 0) * (t.price || 0), 0)
        : (adultCount * (service.priceAdult || 0) + childCount * (service.priceChild || 0))
      ) + service.additionalServices.reduce((sum, s) => sum + s.price, 0);

  // Map API discounts if present, otherwise use service.discounts (mock)
  const activeDiscounts: Discount[] = apiDiscounts.length > 0
    ? apiDiscounts.map(d => ({
        ...d,
        id: d.id || d.code || Math.random().toString(),
        name: d.name || d.code || 'Giảm giá',
        code: d.code || 'DISCOUNT',
        description: d.description || `Giảm giá mã ${d.code || ''}`,
        startDate: d.startDate || '',
        endDate: d.endDate || '',
        quantity: d.quantity || 0,
        minSpend: d.minSpend || 0,
        fixedPrice: d.discountType === 'Fixed' ? (d.fixedPrice || d.value || 0) : 0,
        percentage: d.discountType === 'Percentage' ? (d.percentage || d.value || 0) : 0,
        applied: totalPrice >= (d.minSpend || 0)
      }))
    : service.discounts;

  const calculateDAmount = (d: Discount) => {
    if (d.percentage) {
      const amount = Math.round(totalPrice * (d.percentage / 100));
      return d.maxDiscountAmount ? Math.min(amount, d.maxDiscountAmount) : amount;
    }
    return d.fixedPrice || 0;
  };

  const discountAmount = activeDiscounts
    .filter(d => d.applied)
    .reduce((sum, d) => sum + calculateDAmount(d), 0);
    
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  // Update service object for BookingCard if needed
  const serviceWithAppliedDiscounts = { ...service, discounts: activeDiscounts };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Section - AUTO MODE with Service Name */}
      <BreadcrumbSection
        auto
        serviceName={service.name}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">
              {service.name}
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900">
                  {service.rating}
                </span>
                <span>({service.reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{service.location}</span>
              </div>
              <span className="text-orange-500 font-medium">
                30K+ lượt khách
              </span>
            </div>
            <div className="flex items-center gap-3 ">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500 transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-orange-500 text-orange-500" : ""
                    }`}
                />
                Thêm vào danh sách yêu thích
              </button>
              {/*
                <span className="text-gray-300">|</span>
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                 </button>
                */}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="order-2 lg:order-1 lg:w-[120px] xl:w-[140px] flex-shrink-0">
              <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 lg:gap-3">
                {service.thumbnails.slice(0, 4).map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${currentImageIndex === idx
                      ? "border-orange-500 ring-2 ring-orange-200"
                      : "border-gray-200 hover:border-orange-300"
                      }`}
                  >
                    <img
                      src={thumb}
                      alt={`${service.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 flex-1">
              <div className="relative aspect-[16/10] bg-gray-200 rounded-xl overflow-hidden group">
                <img
                  src={service.images[currentImageIndex]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 lg:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 lg:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
                </button>

                <div className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 bg-black/70 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium">
                  {currentImageIndex + 1} / {service.images.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content + Booking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex gap-6 sm:gap-8">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`pb-3 font-semibold transition-colors relative cursor-pointer ${activeTab === "info"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Thông tin
                  {activeTab === "info" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("rooms")}
                  className={`pb-3 font-semibold transition-colors relative cursor-pointer ${activeTab === "rooms"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {serviceType === 'hotel' ? 'Các loại phòng' : 'Các loại vé'}
                  {activeTab === "rooms" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 font-semibold transition-colors relative cursor-pointer ${activeTab === "reviews"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Đánh giá
                  {activeTab === "reviews" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "info" && (
              serviceType === 'hotel' ? (
                <HotelInfoTab service={service} />
              ) : (
                <ServiceInfoTab
                  service={service}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  getDaysInMonth={getDaysInMonth}
                  getFeatureIcon={getFeatureIcon}
                />
              )
            )}




            {activeTab === "rooms" && (
              serviceType === 'hotel' ? (
                <RoomsTab
                  rooms={allRooms.map(r => ({
                    id: r.id.toString(),
                    title: r.name,
                    desc: r.description || `${r.capacity} khách • ${r.type}`,
                    price: r.price,
                    images: r.images && r.images.length > 0 ? r.images : [service.images[0]],
                    capacity: r.capacity,
                    size: 25, 
                    bedType: r.type,
                    amenities: r.amenities
                  }))}
                  onRoomBookNow={handleRoomBookNow}
                />
              ) : (
                <TicketsTab 
                  tickets={ticketList.map(t => ({
                    id: t.id.toString(),
                    title: t.name,
                    description: t.description,
                    price: t.price,
                    inclusions: t.amenities || []
                  }))} 
                  onTicketBookNow={handleBookNow}
                />
              )
            )}

            {activeTab === "reviews" && (
              <ReviewsSection
                isLoggedIn={isAuthenticated}
                reviewRating={reviewRating}
                setReviewRating={setReviewRating}
                reviewTitle={reviewTitle}
                setReviewTitle={setReviewTitle}
                serviceName={service.name}
                reviewText={reviewText}
                setReviewText={setReviewText}
                reviewCost={reviewCost}
                setReviewCost={setReviewCost}
                reviewImages={reviewImagePreviewUrls} // Updated: use preview urls
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                handleSubmitReview={handleSubmitReview}
                displayedReviews={allReviews}
                showAllReviews={showAllReviews}
                setShowAllReviews={setShowAllReviews}
                totalReviews={hasRealReviews ? totalApiReviews : allReviews.length}
                isSubmitting={isSubmittingReview}
                isLoading={isLoadingReviews}
              />
            )}
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard
              service={serviceWithAppliedDiscounts}
              serviceType={serviceType}
              adultCount={adultCount}
              setAdultCount={setAdultCount}
              childCount={childCount}
              setChildCount={setChildCount}
              finalPrice={finalPrice}
              onBookNow={handleBookNow}
              onRoomBookNow={handleRoomBookNow}
              // Hotel Props
              checkInDate={checkInDate}
              setCheckInDate={setCheckInDate}
              checkOutDate={checkOutDate}
              setCheckOutDate={setCheckOutDate}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
              ticketList={ticketList}
              setTicketList={setTicketList}
            />
          </div>
        </div >
      </div >

      <Footer />

      {/* Booking Modal */}
      {showServiceBookingModal && service && (
        <ServiceBookingModal
          isOpen={showServiceBookingModal}
          onClose={handleCloseModal}
          service={service}
          provinceCode={resolvedProvinceID}
          availableDiscounts={activeDiscounts} 
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          bookingDuration={bookingDuration}
          setBookingDuration={setBookingDuration}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          customerNote={customerNote}
          setCustomerNote={setCustomerNote}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          showDiscountSection={showDiscountSection}
          setShowDiscountSection={setShowDiscountSection}
          ticketList={ticketList}
          setTicketList={setTicketList}
          onConfirm={handleConfirmBooking}
          isSubmitting={isBooking}
        />
      )}

      {/* Room Booking Modal */}
      {showRoomBookingModal && (
        <RoomBookingModal
          isOpen={showRoomBookingModal}
          onClose={handleCloseRoomModal}
          provinceCode={resolvedProvinceID}
          availableDiscounts={activeDiscounts}
          showDiscountSection={showDiscountSection}
          setShowDiscountSection={setShowDiscountSection}
          checkInDate={checkInDate}
          setCheckInDate={setCheckInDate}
          checkOutDate={checkOutDate}
          setCheckOutDate={setCheckOutDate}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        roomType={roomType}
        setRoomType={setRoomType}
        selectedRooms={selectedRooms}
        setSelectedRooms={setSelectedRooms}
        roomFirstName={roomFirstName}
        setRoomFirstName={setRoomFirstName}
        roomEmail={roomEmail}
        setRoomEmail={setRoomEmail}
        roomPhone={roomPhone}
        setRoomPhone={setRoomPhone}
        roomAddress={roomAddress}
        setRoomAddress={setRoomAddress}
        roomCity={roomCity}
        setRoomCity={setRoomCity}
        roomCountry={roomCountry}
        setRoomCountry={setRoomCountry}
        specialRequests={specialRequests}
        setSpecialRequests={setSpecialRequests}
        roomPaymentMethod={roomPaymentMethod}
        setRoomPaymentMethod={setRoomPaymentMethod}
        allRooms={allRooms}
        serviceId={id}
        onConfirm={handleConfirmRoomBooking}
        isSubmitting={isBooking}
      />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        message={authMessage}
      />


      {/* Floating Chat Widget */}
      {service && (
        <ServiceChatWidget
          providerId={`provider_${service.id}`} // In reality, get this from service data
          providerName={`Nhà cung cấp: ${service.name}`} // Just a mock
          serviceId={service.id.toString()}
          serviceName={service.name}
        />
      )}
    </div >
  );
};

export default ServiceDetailPage;
