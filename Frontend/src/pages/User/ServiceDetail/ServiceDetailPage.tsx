// src/pages/ServiceDetailPage/ServiceDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Clock,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
  SearchX,
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
import { serviceDetailApi } from '@/api/serviceDetailApi';
import { REGIONS, getDestinationInfo, getDestinationByName, getServiceTypeName } from '../../../constants/regions';
import type { BreadcrumbItem } from '@/components/common/Breadcrumb';
import type { AppDispatch, RootState } from "../../../store";
import {
  loadServiceDetail,
  clearServiceDetail,
} from "../../../store/slices/serviceDetailSlice";
import { useAuth } from '@/hooks/useAuth';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { discountApi } from '@/api/discountApi';
import { roomApi } from '@/api/roomApi';
import { ticketApi } from '@/api/ticketApi';
import toast from 'react-hot-toast';
import AuthModal from '@/components/common/AuthModal';
import ServiceChatWidget from '@/components/chat/ServiceChatWidget';
import apiClient from '@/services/apiClient';
import RelatedBlogPosts from '@/components/page/blog/RelatedBlogPosts';
import CloudinaryImage from '@/components/ui/CloudinaryImage';
import { HERO_WIDTHS } from '@/utils/cloudinaryImage';

import { shouldUseMock } from '@/config/mockConfig';

// ─── CẤU HÌNH MOCK DỮ LIỆU CỤC BỘ ──────────────────────────────────────────────
const LOCAL_MOCK_OVERRIDE: boolean | null = false;
const USE_MOCK = shouldUseMock(LOCAL_MOCK_OVERRIDE);
// ──────────────────────────────────────────────────────────────────────────────

const ServiceDetailPage: React.FC = () => {
  const { region, destination, serviceType: urlServiceType, idSlug, id: directId } = useParams<{
    region: string;
    destination: string;
    serviceType: string;
    idSlug: string;
    id: string;
  }>();
  const location = useLocation();
  const serviceType = urlServiceType || (location.pathname.startsWith('/hotels') ? 'hotel' : 'place');
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
    const uuidMatch = slug.match(/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
    if (uuidMatch) return uuidMatch[1];
    const intMatch = slug.match(/^(\d+)-/);
    if (intMatch) return intMatch[1];
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
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`); // yyyy-mm
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
  const [specialRequests, setSpecialRequests] = useState("");
  const [roomPaymentMethod, setRoomPaymentMethod] = useState<'MOMO' | 'VNPAY' | 'ZALOPAY'>(
    'MOMO'
  );
  const [priceCalendar, setPriceCalendar] = useState<any>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [selectedSubCalendarId, setSelectedSubCalendarId] = useState<string | null>(null);

  // Reviews state
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImagePreviewUrls, setReviewImagePreviewUrls] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewCost, setReviewCost] = useState("");
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [apiReviews, setApiReviews] = useState<any[]>([]); // Data from API
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);

  const [apiDiscounts, setApiDiscounts] = useState<any[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [totalApiReviews, setTotalApiReviews] = useState(0);

  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Reset image index when navigating to a different service
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [service?.id]);

  // Load rooms/tickets from API when serviceId is available
  const fetchFavoriteStatus = async () => {
    if (!isAuthenticated || !id) return;
    try {
      const data: any = await apiClient.favorites.getAll(0, 50); // Get first 50 favorites to check
      const list = Array.isArray(data) ? data : (data?.content || []);
      const isFav = list.some((item: any) => item.serviceId?.toString() === id.toString());
      setIsFavorite(isFav);
    } catch (error) {
      console.error("Failed to fetch favorite status", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      requireAuth(() => { }, 'Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    if (isFavoriteLoading || !id) return;
    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        await apiClient.favorites.remove(id);
        setIsFavorite(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await apiClient.favorites.add(id);
        setIsFavorite(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      if (!id) return;
      setIsLoadingReviews(true);
      const response = await apiClient.comments.getByServiceId(id);
      // Response structure from backend is PageResponse which has 'content' directly or standard Axios 'data'
      // apiClient.get returns response.data directly
      if (response?.content) {
        // Lọc chỉ lấy các comment gốc (không có parentID) để tránh hiển thị trùng lặp với phần reply
        const rootComments = response.content.filter((c: any) => !c.parentID);
        setApiReviews(rootComments);
        setTotalApiReviews(response.totalElements || rootComments.length);
      } else if (Array.isArray(response)) {
        const rootComments = response.filter((c: any) => !c.parentID);
        setApiReviews(rootComments);
        setTotalApiReviews(rootComments.length);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
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
        setIsLoadingItems(true);
        setTimeout(() => {
          setAllRooms(MOCK_ROOMS);
          setIsLoadingItems(false);
        }, 800);
        return;
      }

      setIsLoadingItems(true);
      const realId = service?.id || id;
      const effectiveType = service?.type || serviceType;

      // If we don't have a numeric ID yet and the service hasn't loaded, 
      // the ID might be a slug from the URL which the sub-resource APIs (tickets/rooms) might not accept.
      // We should wait for the service detail to load the real numeric ID.
      const isNumericId = /^\d+$/.test(realId);
      if (!isNumericId && !service) {
        console.log(`Skipping items fetch for non-numeric ID "${realId}" until service detail loads.`);
        setIsLoadingItems(false);
        return;
      }

      console.log(`Loading items for service type: ${effectiveType}, ID: ${realId} (original: ${id})`);

      try {
        let data: any = effectiveType === 'hotel'
          ? await roomApi.getRoomsByHotelId(realId)
          : await ticketApi.getTicketsByService(realId);

        console.log('Items API Response:', data);

        // Robust extraction of items from wrapped or direct responses
        const items = Array.isArray(data)
          ? data
          : (data?.result || data?.data || data?.roomList || data?.content || []);

        console.log(`Extracted ${items.length} items`);

        // Map backend ticket/room response to UI shape
        const mapped = items.map((item: any) => {
          // Thử tất cả các field tên có thể từ BE (hotel: roomName, ticket: ticketName, name, title...)
          const resolvedName = item.name
            || item.roomName
            || item.room_name
            || item.ticketName
            || item.ticket_name
            || item.title
            || item.label
            || null;

          // Thử tất cả các field loại phòng/vé
          const resolvedType = item.type
            || item.roomType
            || item.room_type
            || item.ticketType
            || item.ticket_type
            || item.term
            || '';

          return {
            id: item.id || item.roomID || item.ticketID,
            // Chỉ fallback về "Item {id}" nếu không tìm thấy tên nào
            name: resolvedName ?? `Phòng ${resolvedType || (item.id ? String(item.id).slice(0, 8) : '?')}`,
            type: resolvedType,
            price: item.price ? parseFloat(item.price) : (item.pricePerNight ?? 0),
            capacity: item.capacity ?? item.maxGuests ?? 2,
            amenities: item.amenities ?? [],
            available: item.available ?? item.isAvailable ?? true,
            currentBookings: item.currentBookings ?? [],
            description: item.description ?? item.term ?? '',
            quantity: item.quantity ?? item.remainingQuantity ?? 0,
            image: item.roomImgUrl || (item.images && item.images[0]) || '',
            count: 0,
          };
        });

        if (effectiveType === 'hotel') {
          setAllRooms(mapped);
          setTicketList([]);
        } else {
          setTicketList(mapped);
          setAllRooms([]);
        }
      } catch (err) {
        console.error('Failed to load rooms/tickets', err);
        if (effectiveType === 'hotel') {
          setAllRooms(MOCK_ROOMS);
          setTicketList([]);
        } else {
          setTicketList([]);
          setAllRooms([]);
        }
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadRoomsOrTickets();
    if (id) {
      fetchReviews();
      fetchDiscounts();
      fetchFavoriteStatus();
    }
  }, [id, serviceType, service?.type, resolvedProvinceID, isAuthenticated]); // Added service?.type to dependencies


  // Pre-fill user data for RoomBookingModal and ServiceBookingModal
  useEffect(() => {
    if (isAuthenticated && currentUser?.user) {
      const user = currentUser.user;
      const name = user.name || (user as any).fullname || (user as any).username || "";
      const email = user.email || "";
      const phone = (user as any).phone || user.phoneNumber || "";

      setRoomFirstName(prev => prev || name);
      setRoomEmail(prev => prev || email);
      setRoomPhone(prev => prev || phone);

      setCustomerName(prev => prev || name);
      setCustomerEmail(prev => prev || email);
      setCustomerPhone(prev => prev || phone);
    }
  }, [isAuthenticated, currentUser]);

  // Load service detail
  useEffect(() => {
    // If none of the access methods are provided, go home
    if (!directId && (!destination || !idSlug || !region)) {
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

  useEffect(() => {
    if (id && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const fetchCalendar = async () => {
        setIsCalendarLoading(true);
        try {
          const data = await serviceDetailApi.getPriceCalendar(id.toString(), year, month);
          setPriceCalendar(data);

          // Auto select first subCalendar if none selected or current one not in list
          if (data?.subCalendars?.length > 0) {
            const currentExists = data.subCalendars.some((s: any) => s.id === selectedSubCalendarId);
            if (!selectedSubCalendarId || !currentExists) {
              setSelectedSubCalendarId(data.subCalendars[0].id);
            }
          }
        } catch (err) {
          console.error("Failed to fetch calendar", err);
        } finally {
          setIsCalendarLoading(false);
        }
      };
      fetchCalendar();
    }
  }, [id, selectedMonth, selectedSubCalendarId]);

  const handleCalendarDateSelect = (dateStr: string) => {
    if (serviceType === 'hotel') {
      setCheckInDate(dateStr);
      // Tự động set ngày trả phòng là ngày hôm sau nếu chưa có
      const checkIn = new Date(dateStr);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + 1);
      setCheckOutDate(checkOut.toISOString().split('T')[0]);

      handleRoomBookNow();
    } else {
      setBookingDate(dateStr);
      handleBookNow();
    }
  };

  // Handlers
  const handlePrevImage = () => {
    if (!service?.images.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? service.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!service?.images.length) return;
    setCurrentImageIndex((prev) =>
      prev === service.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleBookNow = (ticketId?: string) => {
    requireAuth(() => {
      // Nếu có ticketId, tự động set số lượng vé đó lên 1
      if (ticketId && ticketList.length > 0) {
        const newList = [...ticketList];
        const idx = newList.findIndex(t => t.id.toString() === ticketId.toString());
        if (idx !== -1) {
          newList[idx] = { ...newList[idx], count: 1 };
          setTicketList(newList);
        }
      }

      // Nếu chưa có ngày đặt, mặc định là ngày hôm nay
      if (!bookingDate) {
        setBookingDate(new Date().toISOString().split('T')[0]);
      }

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
      // Tính số ngày từ "Hiệu lực" (bookingDuration) → dùng để tính checkOutDate
      const durationDaysMap: Record<string, number> = {
        '1 ngày': 0,   // checkOut = checkIn (cùng ngày, hết lúc 23:59)
        '2 ngày': 1,
        '3 ngày': 2,
        '1 tuần': 6,
      };
      const offsetDays = durationDaysMap[bookingDuration] ?? 0;

      // Tính checkOutDate = bookingDate + offsetDays
      const calcCheckOutDate = (baseDate: string, offset: number): string => {
        const d = new Date(`${baseDate}T00:00:00`);
        d.setDate(d.getDate() + offset);
        return d.toISOString().split('T')[0];
      };

      const checkOutDateStr = bookingDate
        ? calcCheckOutDate(bookingDate, offsetDays)
        : new Date().toISOString().split('T')[0];

      const tickets = ticketList
        .filter((t: any) => t.count > 0)
        .map((t: any) => ({
          // Standardize ID as string to match UUID expectations
          id: t.id.toString(),
          quantity: Number(t.count),
          // Backend now expects dates per item
          checkInDate: bookingDate ? `${bookingDate}T00:00:00.000Z` : new Date().toISOString(),
          checkOutDate: `${checkOutDateStr}T23:59:59.000Z`,
        }));

      const payload = {
        tickets,
        rooms: [],
        guestPhone: customerPhone,
        note: customerNote || undefined,
        discountIds: selectedDiscountIds?.map(id => id.toString()) || [],
        paymentMethod: paymentMethod === 'ZALOPAY' ? 'VNPAY' : paymentMethod, // Fallback for enum
      };

      console.log('[DEBUG] Order Payload:', payload);

      const response: any = await apiClient.orders.create(payload);

      toast.success('Đặt dịch vụ thành công!');
      handleCloseModal();

      const payUrl = response?.payUrl || response?.order_url || response?.shortLink;
      const orderId = response?.id || response?.orderId || response?.orderID;
      const finalPrice = response?.totalPrice || response?.amount || 0;

      if (payUrl) {
        // Backend returned a payment URL directly (e.g. MOMO or VNPAY from order creation)
        window.location.href = payUrl;
      } else if (paymentMethod === 'VNPAY' && orderId) {
        // Backend did not return a payUrl; create VNPay payment link manually
        handleSelectPayment('vnpay', orderId.toString(), finalPrice);
      } else if (orderId) {
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

        // Tự động chọn phòng này (auto-select)
        if (room.id) {
          setSelectedRooms([room.id]);
        }
      }

      // Nếu chưa có ngày nhận/trả, mặc định là ngày mai và ngày kia (để tránh quá khứ)
      if (!checkInDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        setCheckInDate(tomorrow.toISOString().split('T')[0]);

        if (!checkOutDate) {
          const dayAfter = new Date(tomorrow);
          dayAfter.setDate(tomorrow.getDate() + 1);
          setCheckOutDate(dayAfter.toISOString().split('T')[0]);
        }
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

    if (isBooking) return;
    setIsBooking(true);

    try {
      const rooms = selectedRooms.map((roomId: string | number) => ({
        id: String(roomId),
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
        paymentMethod: roomPaymentMethod === 'ZALOPAY' ? 'VNPAY' : roomPaymentMethod, // Fallback
      });

      const payUrl = response?.payUrl || response?.order_url || response?.shortLink;
      const orderId = response?.id || response?.orderId || response?.orderID;
      const finalPrice = response?.totalPrice || response?.amount || 0;

      if (payUrl) {
        // Backend returned a payment URL directly (e.g. MOMO or VNPAY from order creation)
        window.location.href = payUrl;
      } else if (roomPaymentMethod === 'VNPAY' && orderId) {
        // Backend did not return a payUrl; create VNPay payment link manually
        handleSelectPayment('vnpay', orderId.toString(), finalPrice);
      } else if (orderId) {
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
        // Sử dụng endpoint V2 mới với OrderID thực tế
        response = await apiClient.payments.vnpay.createPaymentV2(
          finalAmount,
          targetOrderId.toString()
        );
      } else if (method === 'zalopay') {
        response = await apiClient.payments.zalopay.createOrder(
          currentUser?.user?.name || 'User',
          finalAmount,
          targetOrderId
        );
      } else if (method === 'momo') {
        response = await apiClient.payments.momo.createOrder(
          finalAmount,
          targetOrderId.toString()
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

    requireAuth(async () => {
      setIsSubmittingReview(true);
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

  const handleEditReview = async (reviewId: number | string, content: string, rating: number) => {
    try {
      await apiClient.comments.update(reviewId, content, rating);
      toast.success("Cập nhật đánh giá thành công");
      fetchReviews();
    } catch (error) {
      console.error("Failed to edit review", error);
      toast.error("Có lỗi xảy ra khi cập nhật đánh giá");
    }
  };

  const handleDeleteReview = async (reviewId: number | string) => {
    try {
      await apiClient.comments.delete(reviewId);
      toast.success("Xóa đánh giá thành công");
      fetchReviews();
    } catch (error) {
      console.error("Failed to delete review", error);
      toast.error("Có lỗi xảy ra khi xóa đánh giá");
    }
  };

  const handleReplyReview = async (reviewId: number | string, content: string) => {
    try {
      await apiClient.comments.reply(reviewId, { content });
      toast.success("Đã gửi phản hồi");
      fetchReviews();
    } catch (error) {
      console.error("Failed to reply review", error);
      toast.error("Có lỗi xảy ra khi gửi phản hồi");
    }
  };



  // Generate 3 dynamic months starting from current month
  const dynamicMonths = Array.from({ length: 3 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return {
      label: `Tháng ${d.getMonth() + 1}/${yyyy}`,
      value: `${yyyy}-${mm}`
    };
  });

  const getDaysInMonth = (monthKey: string) => {
    if (!service) return [];

    // Parse year and month
    const [year, month] = monthKey.split('-').map(Number);
    const firstDayDate = new Date(year, month - 1, 1);
    const lastDayDate = new Date(year, month, 0);
    const maxDay = lastDayDate.getDate();

    // Get day of week for the 1st of the month
    let firstDayIndex = firstDayDate.getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6; // Sunday

    const days: (null | {
      day: number;
      price: string | null;
      rooms: number | null;
      available: boolean;
    })[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Prepare availability map from priceCalendar
    const calendarMap: Record<number, { price: number; rooms: number }> = {};

    // Default values from service base price if calendar fails or is empty
    const defaultPrice = serviceType === 'hotel' ? (service.priceAdult || 0) : (service.priceAdult || 0);

    // If we have priceCalendar from API, process it
    if (priceCalendar && priceCalendar.subCalendars && priceCalendar.subCalendars.length > 0) {
      // Filter subCalendars if one is selected, otherwise use all (fallback)
      const subCalendarsToProcess = selectedSubCalendarId
        ? priceCalendar.subCalendars.filter((s: any) => s.id === selectedSubCalendarId)
        : priceCalendar.subCalendars;

      subCalendarsToProcess.forEach((sub: any) => {
        const subBasePrice = sub.basePrice || priceCalendar.basePrice || defaultPrice;

        // Fill days with subCalendar base price if not already filled by a cheaper one
        for (let d = 1; d <= maxDay; d++) {
          if (!calendarMap[d] || subBasePrice < calendarMap[d].price) {
            calendarMap[d] = { price: subBasePrice, rooms: sub.stock ?? 10 };
          }
        }

        // Apply exceptions for specific dates
        if (sub.exceptions) {
          sub.exceptions.forEach((ex: any) => {
            const exDate = new Date(ex.date);
            if (exDate.getFullYear() === year && exDate.getMonth() + 1 === month) {
              const d = exDate.getDate();
              // If filtering by specific ID, we always take its exception. 
              // Otherwise (fallback) we take cheapest.
              const shouldUpdate = !selectedSubCalendarId
                ? (!calendarMap[d] || ex.price < calendarMap[d].price)
                : true;

              if (shouldUpdate) {
                calendarMap[d] = {
                  price: ex.price,
                  rooms: ex.stock !== undefined ? ex.stock : (ex.availableRooms !== undefined ? ex.availableRooms : 10)
                };
              }
            }
          });
        }
      });
    } else {
      // Fallback: If no calendar data, use base price for all days
      for (let d = 1; d <= maxDay; d++) {
        calendarMap[d] = { price: defaultPrice, rooms: 10 };
      }
    }

    for (let i = 1; i <= maxDay; i++) {
      const calData = calendarMap[i];
      days.push({
        day: i,
        price: calData ? calData.price.toString() : null,
        rooms: calData ? calData.rooms : null,
        available: calData ? calData.rooms > 0 : true,
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


  // If we have real API reviews, use them + user's newly mock-added reviews. 
  // Otherwise, fallback to the hardcoded `reviews` array + user's local reviews.
  const hasRealReviews = apiReviews.length > 0;

  // Format API reviews to match frontend expected structure
  const formattedApiReviews = apiReviews.map(r => ({
    id: r.id,
    author: r.username || r.user?.fullname || r.user?.username || "Người dùng",
    date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
    rating: r.rating || 5,
    title: "",
    content: r.content,
    // Backend trả về `imageList` là mảng string URL, không phải object
    images: Array.isArray(r.imageList)
      ? r.imageList.map((img: any) => typeof img === 'string' ? img : img?.url || img?.imageUrl || '')
      : (Array.isArray(r.images)
        ? r.images.map((img: any) => typeof img === 'string' ? img : img?.url || img?.imageUrl || '')
        : []),
    helpful: r.likes || r.likeCount || 0,
    notHelpful: r.dislikes || r.dislikeCount || 0,
    userAvatar: r.user?.avatar,
    userId: r.userId || r.user?.id || r.user?.userID || r.user?.username,
    replies: Array.isArray(r.replies) ? r.replies.map((reply: any) => ({
      id: reply.id,
      content: reply.content,
      username: reply.username || reply.user?.fullname || reply.user?.username || "Người dùng",
      createdAt: reply.createdAt ? new Date(reply.createdAt).toLocaleDateString("vi-VN") : ""
    })) : []
  }));

  const allReviews = hasRealReviews
    ? [...userReviews, ...formattedApiReviews]
    : [...userReviews];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white animate-pulse">
        {/* Breadcrumb Section Placeholder */}
        <div className="h-14 bg-gray-50 border-b border-gray-100 flex items-center px-4 sm:px-8">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Title Section Placeholder */}
          <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded-xl w-3/4 mb-4"></div>
            <div className="flex items-center gap-4">
              <div className="h-5 bg-gray-100 rounded-lg w-32"></div>
              <div className="h-5 bg-gray-100 rounded-lg w-40"></div>
              <div className="h-5 bg-gray-100 rounded-lg w-24 ml-auto"></div>
            </div>
          </div>

          {/* Image Gallery Placeholder */}
          <div className="mb-8 lg:mb-10">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              <div className="order-2 lg:order-1 lg:w-[120px] xl:w-[140px] flex lg:flex-col gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl"></div>
                ))}
              </div>
              <div className="order-1 lg:order-2 flex-1 aspect-[16/10] bg-gray-200 rounded-2xl"></div>
            </div>
          </div>

          {/* Main Layout Grid Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content Placeholder */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs Placeholder */}
              <div className="flex gap-4 border-b border-gray-100 pb-px">
                <div className="h-10 bg-gray-100 rounded-t-lg w-24"></div>
                <div className="h-10 bg-gray-100 rounded-t-lg w-24"></div>
                <div className="h-10 bg-gray-100 rounded-t-lg w-24"></div>
              </div>

              {/* Content Block Placeholder */}
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 bg-gray-50 rounded w-full"></div>
                ))}
                <div className="h-4 bg-gray-50 rounded w-2/3"></div>
              </div>
            </div>

            {/* Right Sidebar (Booking Card) Placeholder */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 h-[500px] bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-6">
                <div className="h-8 bg-gray-100 rounded-xl w-1/2"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                  <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                </div>
                <div className="h-px bg-gray-100 w-full my-6"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-100 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-14 bg-gray-200 rounded-2xl w-full mt-auto"></div>
              </div>
            </div>
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
            <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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

  const getDaysDiff = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };
  const nights = getDaysDiff();

  // Calculate totals
  const totalPrice = serviceType === 'hotel'
    ? (selectedRooms.length > 0
      ? selectedRooms.reduce<number>((sum, id) => {
        const room = allRooms.find(r => r.id === id);
        return sum + (room ? (Number(room.price) * (nights || 1)) : 0);
      }, 0)
      : 0 // Hiển thị 0 nếu chưa chọn phòng để tránh gây "hết hồn" cho user
    )
    : (ticketList.length > 0
      ? ticketList.reduce<number>((sum, t) => sum + (Number(t.count || 0)) * (Number(t.price || 0)), 0)
      : (Number(adultCount || 0) * (Number(service.priceAdult || 0)) + Number(childCount || 0) * (Number(service.priceChild || 0)))
    );
  // Remove automatic addition of all additional services unless there's a selection logic
  // + service.additionalServices.reduce((sum, s) => sum + s.price, 0);

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Breadcrumb Section - Manual mode với đầy đủ region → province → service */}
      <BreadcrumbSection
        breadcrumbItems={(() => {
          if (!service) return [];
          const items: BreadcrumbItem[] = [{ label: 'Trang chủ', href: '/' }];

          // 1. Resolve Geographic info from service data or URL
          const provinceParam = service.province?.code || service.provinceCode || destination;
          let provinceInfo = provinceParam ? getDestinationInfo(provinceParam.toString()) : null;

          // Fallback: try match by location name if code resolution failed
          if (!provinceInfo && service.location) {
            provinceInfo = getDestinationByName(service.location);
          }

          // Try to get region from province info first, then from URL
          const resolvedRegionSlug = provinceInfo?.region || (region && region !== 'vietnam' && region !== 'undefined' ? region : null);
          const regionInfo = resolvedRegionSlug ? (REGIONS as any)[resolvedRegionSlug] : null;

          if (service.type === 'hotel') {
            items.push({ label: 'Tất cả khách sạn', href: '/hotels' });

            // Region level
            if (regionInfo) {
              items.push({ label: regionInfo.name, href: `/hotels?region=${regionInfo.slug}` });
            }

            // Province level
            if (provinceInfo) {
              items.push({ label: provinceInfo.name, href: `/hotels/${regionInfo?.slug || 'vietnam'}/${provinceInfo.slug}` });
            } else if (service.location && service.location !== 'Việt Nam') {
              items.push({ label: service.location });
            }
          } else {
            items.push({ label: 'Tất cả điểm đến', href: '/destinations' });

            // Region level
            if (regionInfo) {
              items.push({ label: regionInfo.name, href: `/destinations?region=${regionInfo.slug}` });
            }

            // Province level
            if (provinceInfo) {
              items.push({ label: provinceInfo.name, href: `/destinations/${regionInfo?.slug || 'vietnam'}/${provinceInfo.slug}` });
            } else if (service.location && service.location !== 'Việt Nam') {
              items.push({ label: service.location });
            }

            // 2. Add back serviceType step for attractions (e.g. "Các vé tham quan")
            const currentST = serviceType || 'place';
            const serviceTypeName = getServiceTypeName(currentST, true);
            items.push({
              label: serviceTypeName,
              href: `/destinations/${regionInfo?.slug || 'vietnam'}/${provinceInfo?.slug || destination || 'undefined'}/${currentST}`
            });
          }

          items.push({ label: service.name, isActive: true });
          return items;
        })()}
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
            </div>

            {/* Tags Badges Removed from Hero - they are now in the tabs */}


            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border shadow-sm transform active:scale-95 cursor-pointer ${isFavorite
                    ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                    : "bg-white text-gray-600 border-gray-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100"
                    }`}
                >
                  {isFavoriteLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Heart
                      className={`w-4.5 h-4.5 transition-colors ${isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-400"
                        }`}
                    />
                  )}
                  <span>{isFavorite ? "Đã lưu yêu thích" : "Thêm vào yêu thích"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Thumbnails */}
            <div className="order-2 lg:order-1 lg:w-[120px] xl:w-[140px] flex-shrink-0">
              <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 lg:gap-3">
                {(service.imageObjects?.length > 0 ? service.imageObjects : service.images.map(url => ({ id: '', url }))).slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${currentImageIndex === idx
                      ? "border-orange-500 ring-2 ring-orange-200"
                      : "border-gray-200 hover:border-orange-300"
                      }`}
                  >
                    <CloudinaryImage
                      src={img.url}
                      alt={`${service.name} ${idx + 1}`}
                      imageId={img.id || undefined}
                      sizes="140px"
                      widths={[140, 280]}
                      targetWidth={140}
                      objectFit="cover"
                      priority="high"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main image */}
            <div className="order-1 lg:order-2 flex-1">
              <div className="relative aspect-[16/10] bg-gray-200 rounded-xl overflow-hidden group">
                <CloudinaryImage
                  key={currentImageIndex}
                  src={service.images[currentImageIndex] ?? service.images[0]}
                  imageId={service.imageObjects?.[currentImageIndex]?.id || undefined}
                  alt={service.name}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  widths={HERO_WIDTHS}
                  targetWidth={1280}
                  objectFit="cover"
                  priority="high"
                />

                {service.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 lg:p-3 rounded-full shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 lg:p-3 rounded-full shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
                    </button>
                  </>
                )}

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
                <HotelInfoTab
                  service={service}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  getDaysInMonth={getDaysInMonth}
                  dynamicMonths={dynamicMonths}
                  onSelectDate={handleCalendarDateSelect}
                  isCalendarLoading={isCalendarLoading}
                  priceCalendar={priceCalendar}
                  selectedSubCalendarId={selectedSubCalendarId}
                  onSubCalendarChange={setSelectedSubCalendarId}
                />
              ) : (
                <ServiceInfoTab
                  service={service}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  getDaysInMonth={getDaysInMonth}
                  getFeatureIcon={getFeatureIcon}
                  dynamicMonths={dynamicMonths}
                  onSelectDate={handleCalendarDateSelect}
                  isCalendarLoading={isCalendarLoading}
                  priceCalendar={priceCalendar}
                  selectedSubCalendarId={selectedSubCalendarId}
                  onSubCalendarChange={setSelectedSubCalendarId}
                />
              )
            )}

            {activeTab === "rooms" && (
              serviceType === 'hotel' ? (
                <RoomsTab
                  isLoading={isLoadingItems}
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
                  isLoading={isLoadingItems}
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

                serviceName={service.name}
                reviewText={reviewText}
                setReviewText={setReviewText}

                reviewImages={reviewImagePreviewUrls}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                handleSubmitReview={handleSubmitReview}
                displayedReviews={allReviews}
                showAllReviews={showAllReviews}
                setShowAllReviews={setShowAllReviews}
                totalReviews={hasRealReviews ? totalApiReviews : allReviews.length}
                isSubmitting={isSubmittingReview}
                isLoading={isLoadingReviews}
                onLike={async (reviewId) => {
                  await apiClient.comments.like(reviewId);
                }}
                onUndoLike={async (reviewId) => {
                  await apiClient.comments.unlike(reviewId);
                }}
                onDislike={async (reviewId) => {
                  await apiClient.comments.dislike(reviewId);
                }}
                onUndoDislike={async (reviewId) => {
                  await apiClient.comments.undoDislike(reviewId);
                }}
                onReport={async (reviewId, reason) => {
                  try {
                    await apiClient.comments.report(reviewId, reason);
                    toast.success('Đã gửi báo cáo vi phạm');
                  } catch (error) {
                    console.error("Failed to report review", error);
                    toast.error("Có lỗi xảy ra khi gửi báo cáo");
                  }
                }}
                currentUserInfo={currentUser?.user}
                onEditReview={handleEditReview}
                onDeleteReview={handleDeleteReview}
                onReply={handleReplyReview}
              />
            )}
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="hidden lg:block lg:col-span-1">
            <BookingCard
              isLoading={isLoadingItems}
              service={serviceWithAppliedDiscounts}
              serviceType={serviceType}
              adultCount={adultCount}
              setAdultCount={setAdultCount}
              childCount={childCount}
              setChildCount={setChildCount}
              finalPrice={finalPrice}
              onBookNow={() => handleBookNow()}
              onRoomBookNow={() => handleRoomBookNow()}
              // Hotel Props
              checkInDate={checkInDate}
              setCheckInDate={setCheckInDate}
              checkOutDate={checkOutDate}
              setCheckOutDate={setCheckOutDate}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
              ticketList={ticketList}
              setTicketList={setTicketList}
              isLoggedIn={isAuthenticated}
              selectedRooms={selectedRooms}
              allRooms={allRooms}
            />
          </div>
        </div >
      </div >

      {/* ── Related Blog Posts ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <RelatedBlogPosts serviceId={id} serviceName={service.name} />
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tổng cộng</p>
            <p className="text-lg font-black text-orange-500 truncate">
              {finalPrice.toLocaleString('vi-VN')} <span className="text-xs font-bold">VNĐ</span>
            </p>
          </div>
          <button
            onClick={serviceType === 'hotel' ? () => handleRoomBookNow() : () => handleBookNow()}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-md uppercase tracking-widest active:scale-95 ${isAuthenticated
              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100"
              : "bg-orange-50 text-orange-600 border border-orange-200"
              }`}
          >
            {isAuthenticated
              ? (serviceType === 'hotel' ? 'Đặt ngay' : 'Đặt vé ngay')
              : 'Đăng nhập'}
          </button>
        </div>
      </div>

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
      {service && isAuthenticated && (
        <ServiceChatWidget
          providerId={service.providerId || service.provider?.userID || ''}
          providerName={(service as any).providerName || service.provider?.fullname || `Nhà cung cấp: ${service.name}`}
          serviceId={service.id}
          serviceName={service.name}
        />
      )}
    </div >
  );
};

export default ServiceDetailPage;
