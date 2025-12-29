// src/pages/ServiceDetailPage/ServiceDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
} from "lucide-react";
import BreadcrumbSection from '../../../components/common/BreadcrumbSection'
import Footer from "../../../components/common/layout/Footer";
import ServiceBookingModal from "../../../components/page/serviceDetail/modals/ServiceBookingModal";
import RoomBookingModal from "../../../components/page/serviceDetail/modals/RoomBookingModal";
import ReviewsSection from "../../../components/page/serviceDetail/reviews/ReviewsSection";
import BookingCard from "../../../components/page/serviceDetail/booking/BookingCard";
import type { AppDispatch, RootState } from "../../../store";
import {
  loadServiceDetail,
  clearServiceDetail,
} from "../../../store/slices/serviceDetailSlice";
import { getDestinationInfo } from '@/constants/regions';

const ServiceDetailPage: React.FC = () => {
  const { region, destination, serviceType, idSlug } = useParams<{
    region: string;
    destination: string;
    serviceType: string;
    idSlug: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    data: service,
    loading,
    error,
  } = useSelector((state: RootState) => state.serviceDetail);

  // Local state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");
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
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cash">(
    "wallet"
  );
  const [showDiscountSection, setShowDiscountSection] = useState(true);

  // Room booking modal state - Updated for multiple rooms
  const [showRoomBookingModal, setShowRoomBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [roomType, setRoomType] = useState("Bất kỳ phòng trống");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]); // Changed from selectedRoom to selectedRooms
  const [roomFirstName, setRoomFirstName] = useState("");
  const [roomEmail, setRoomEmail] = useState("");
  const [roomPhone, setRoomPhone] = useState("");
  const [roomAddress, setRoomAddress] = useState("");
  const [roomCity, setRoomCity] = useState("");
  const [roomCountry, setRoomCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [roomPaymentMethod, setRoomPaymentMethod] = useState<"card" | "online">(
    "card"
  );

  // Reviews state
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewCost, setReviewCost] = useState("");
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Extract ID from slug
  const extractId = (slug: string | undefined): string => {
    if (!slug) return "";
    return slug.split("-")[0];
  };

  const encodedAddress = encodeURIComponent(
    service?.address ?? "Hoàn Kiếm, Hà Nội"
  );
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Load service detail
  useEffect(() => {
    if (!destination || !serviceType || !idSlug || !region) {
      navigate('/homepage');
      return;
    }

    // Validate region-destination mapping
    // Temporarily disabled to allow navigation with placeholder destinations
    // const destInfo = getDestinationInfo(destination);
    // if (!destInfo || destInfo.region !== region) {
    //   navigate('/homepage');
    //   return;
    // }

    const id = extractId(idSlug);
    dispatch(loadServiceDetail({ destination, serviceType, id }));
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      dispatch(clearServiceDetail());
    };
  }, [destination, serviceType, idSlug, dispatch, navigate]);

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
    if (!isLoggedIn) {
      // Kiểm tra đăng nhập
      setShowAuthModal(true); // Hiện modal nếu chưa đăng nhập
      return;
    }
    setShowServiceBookingModal(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setShowServiceBookingModal(false);
    document.body.style.overflow = "unset";
  };

  const handleConfirmBooking = () => {
    console.log("Booking confirmed:", {
      date: bookingDate,
      duration: bookingDuration,
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      note: customerNote,
      paymentMethod,
      adultCount,
      childCount,
    });
    handleCloseModal();
  };

  const handleRoomBookNow = () => {
    if (!isLoggedIn) {
      // Kiểm tra đăng nhập
      setShowAuthModal(true); // Hiện modal nếu chưa đăng nhập
      return;
    }
    setShowRoomBookingModal(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseRoomModal = () => {
    setShowRoomBookingModal(false);
    document.body.style.overflow = "unset";
  };

  const handleConfirmRoomBooking = () => {
    console.log("Room booking confirmed:", {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      roomType: roomType,
      selectedRooms: selectedRooms,
      customerInfo: {
        name: roomFirstName,
        email: roomEmail,
        phone: roomPhone,
        address: roomAddress,
        city: roomCity,
        country: roomCountry,
      },
      specialRequests: specialRequests,
      paymentMethod: roomPaymentMethod,
    });
    handleCloseRoomModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setReviewImages((prev) => [...prev, ...newImages].slice(0, 12));
    }
  };

  const handleRemoveImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = () => {
    if (!isLoggedIn) {
      // Kiểm tra đăng nhập
      setShowAuthModal(true);
      return;
    }

    if (reviewRating === 0) return;

    const newReview = {
      id: Date.now(),
      author: "Bạn",
      date: new Date().toLocaleDateString("vi-VN"),
      rating: reviewRating,
      title: reviewTitle,
      content: reviewText,
      cost: reviewCost,
      images: reviewImages,
      helpful: 0,
      notHelpful: 0,
    };

    setUserReviews((prev) => [newReview, ...prev]);
    setReviewRating(0);
    setReviewTitle("");
    setReviewText("");
    setReviewCost("");
    setReviewImages([]);
  };

  const months = ["Tháng 9/2025", "Tháng 10/2025", "Tháng 11/2025"];
  const monthKeys = ["2025-09", "2025-10", "2025-11"];
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

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

  const allReviews = [...userReviews, ...reviews];
  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 2);

  // Mock rooms data with currentBookings - Updated structure
  const allRooms = [
    {
      id: 101,
      name: "Room 101",
      type: "Tiêu chuẩn",
      price: 120,
      capacity: 2,
      amenities: ["WiFi", "Điều hòa", "TV"],
      available: true,
      currentBookings: [
        { roomId: 101, checkIn: "2025-10-20", checkOut: "2025-10-22" },
      ],
    },
    {
      id: 102,
      name: "Room 102",
      type: "Tiêu chuẩn",
      price: 120,
      capacity: 2,
      amenities: ["WiFi", "Điều hòa", "TV"],
      available: true,
      currentBookings: [],
    },
    {
      id: 103,
      name: "Room 103",
      type: "Tiêu chuẩn",
      price: 120,
      capacity: 3,
      amenities: ["WiFi", "Điều hòa", "TV", "Minibar"],
      available: true,
      currentBookings: [],
    },
    {
      id: 201,
      name: "Room 201",
      type: "Cao cấp",
      price: 180,
      capacity: 4,
      amenities: ["WiFi", "Điều hòa", "TV", "Minibar", "Bồn tắm"],
      available: true,
      currentBookings: [
        { roomId: 201, checkIn: "2025-10-25", checkOut: "2025-10-27" },
      ],
    },
    {
      id: 202,
      name: "Room 202",
      type: "Cao cấp",
      price: 180,
      capacity: 4,
      amenities: ["WiFi", "Điều hòa", "TV", "Minibar", "Bồn tắm"],
      available: true,
      currentBookings: [],
    },
    {
      id: 301,
      name: "Room 301",
      type: "Suite",
      price: 300,
      capacity: 6,
      amenities: ["WiFi", "Điều hòa", "TV", "Minibar", "Ban công", "Bếp nhỏ"],
      available: true,
      currentBookings: [],
    },
    {
      id: 302,
      name: "Room 302",
      type: "Suite",
      price: 300,
      capacity: 6,
      amenities: ["WiFi", "Điều hòa", "TV", "Minibar", "Ban công", "Bếp nhỏ"],
      available: false,
      currentBookings: [],
    },
  ];

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
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalPrice =
    adultCount * service.priceAdult +
    childCount * service.priceChild +
    service.additionalServices.reduce((sum, s) => sum + s.price, 0);
  const discount = service.discounts.find((d) => d.applied)?.value || 0;
  const finalPrice = totalPrice - discount;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Section - AUTO MODE with Service Name */}
      <BreadcrumbSection
        auto
        serviceName={service.name}
        title={service.name}
        subtitle={`${service.location} • ${service.rating}★ (${service.reviews} đánh giá)`}
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
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500 transition-colors"
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
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx
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
                  className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 lg:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 lg:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
                  className={`pb-3 font-semibold transition-colors relative ${activeTab === "info"
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
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 font-semibold transition-colors relative ${activeTab === "reviews"
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Thông tin
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {service.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {service.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                        {getFeatureIcon(feature.icon)}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                        {feature.title}:
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Đặt lịch
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-gray-200">
                      {months.map((month, idx) => (
                        <button
                          key={month}
                          onClick={() => setSelectedMonth(monthKeys[idx])}
                          className={`py-3 text-xs sm:text-sm font-medium transition-colors ${selectedMonth === monthKeys[idx]
                              ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                              : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                        {daysOfWeek.map((day) => (
                          <div
                            key={day}
                            className="text-center text-xs sm:text-sm font-medium text-gray-600 py-2"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {getDaysInMonth(selectedMonth).map((day, idx) => (
                          <div key={idx} className="aspect-square">
                            {day ? (
                              <button
                                disabled={!day.available}
                                className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-xs transition-all ${day.available
                                    ? "bg-gray-50 hover:bg-orange-100 text-orange-600 font-medium cursor-pointer"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                              >
                                <span>{day.day}</span>
                                {day.price && (
                                  <span className="text-[10px] sm:text-xs font-semibold">
                                    {day.price}
                                  </span>
                                )}
                              </button>
                            ) : (
                              <div className="w-full h-full" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Vị trí bản đồ
                  </h3>
                  <div className="bg-gray-200 rounded-xl overflow-hidden aspect-video relative shadow-sm border border-gray-100">
                    {/* Kiểm tra nếu có địa chỉ thì hiện iframe, không thì hiện thông báo */}
                    {service.address ? (
                      <iframe
                        title={`Bản đồ ${service.name}`}
                        width="100%"
                        height="100%"
                        src={mapSrc}
                        className="absolute inset-0 w-full h-full"
                        loading="lazy" // Tốt cho hiệu năng tải trang
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <p>Chưa có thông tin bản đồ</p>
                      </div>
                    )}
                  </div>
                  {/* Hiển thị dòng địa chỉ text bên dưới map */}
                  <p className="mt-3 text-sm text-gray-600 flex items-start gap-2">
                    Địa chỉ: <span>{service.address}</span>
                  </p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <ReviewsSection
                isLoggedIn={isLoggedIn}
                reviewRating={reviewRating}
                setReviewRating={setReviewRating}
                reviewTitle={reviewTitle}
                setReviewTitle={setReviewTitle}
                serviceName={service.name}
                reviewText={reviewText}
                setReviewText={setReviewText}
                reviewCost={reviewCost}
                setReviewCost={setReviewCost}
                reviewImages={reviewImages}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                handleSubmitReview={handleSubmitReview}
                displayedReviews={allReviews}
                showAllReviews={showAllReviews}
                setShowAllReviews={setShowAllReviews}
                totalReviews={allReviews.length}
              />
            )}
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard
              service={service}
              adultCount={adultCount}
              setAdultCount={setAdultCount}
              childCount={childCount}
              setChildCount={setChildCount}
              finalPrice={finalPrice}
              onBookNow={handleBookNow}
              onRoomBookNow={handleRoomBookNow}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* Booking Modal */}
      <ServiceBookingModal
        isOpen={showServiceBookingModal}
        onClose={handleCloseModal}
        service={service}
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
        adultCount={adultCount}
        setAdultCount={setAdultCount}
        childCount={childCount}
        setChildCount={setChildCount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        showDiscountSection={showDiscountSection}
        setShowDiscountSection={setShowDiscountSection}
        finalPrice={finalPrice}
        onConfirm={handleConfirmBooking}
      />

      {/* Room Booking Modal */}
      <RoomBookingModal
        isOpen={showRoomBookingModal}
        onClose={handleCloseRoomModal}
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
        onConfirm={handleConfirmRoomBooking}
      />
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Yêu cầu đăng nhập
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              Bạn cần đăng nhập để thực hiện đặt phòng và trải nghiệm đầy đủ các
              tính năng của chúng tôi.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  sessionStorage.setItem("returnUrl", window.location.pathname);
                  navigate("/login");
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Đăng nhập ngay
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Hủy bỏ
              </button>
            </div>

            {/* Footer note */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => {
                  sessionStorage.setItem("returnUrl", window.location.pathname);
                  navigate("/register");
                }}
                className="text-orange-500 hover:text-orange-600 font-semibold hover:underline"
              >
                Đăng ký tại đây
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage;
