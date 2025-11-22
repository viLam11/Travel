// src/data/dashboardData.ts

export interface Booking {
  id: string;
  guest: string;
  service: string;
  serviceType: "hotel" | "tour";
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  source: string;
}

export interface RevenueByService {
  service: string;
  revenue: number;
  bookings: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
}

export interface TopProvider {
  name: string;
  revenue: number;
  bookings: number;
  type: "hotel" | "tour";
}

export interface BookingStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface PopularDestination {
  destination: string;
  bookings: number;
  percentage: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  previousYear: number;
}

// Revenue by Service Type Data (Hotels & Tours only)
export const revenueByServiceData: RevenueByService[] = [
  { service: "Hotels", revenue: 68500, bookings: 342 },
  { service: "Tours", revenue: 52300, bookings: 267 },
];

// Booking Trends (Last 7 days)
export const bookingTrendsData: BookingTrend[] = [
  { date: "Mon", bookings: 52 },
  { date: "Tue", bookings: 61 },
  { date: "Wed", bookings: 58 },
  { date: "Thu", bookings: 73 },
  { date: "Fri", bookings: 67 },
  { date: "Sat", bookings: 82 },
  { date: "Sun", bookings: 71 },
];

// Top Service Providers (Hotels & Tours)
export const topProvidersData: TopProvider[] = [
  { name: "Luxury Hotels Group", revenue: 18500, bookings: 67, type: "hotel" },
  { name: "Adventure Tours Co", revenue: 16200, bookings: 89, type: "tour" },
  { name: "Beach Resorts Chain", revenue: 14800, bookings: 52, type: "hotel" },
  { name: "Mountain Escape Tours", revenue: 12600, bookings: 71, type: "tour" },
  { name: "City Center Hotels", revenue: 11400, bookings: 48, type: "hotel" },
  { name: "Cultural Heritage Tours", revenue: 9800, bookings: 56, type: "tour" },
  { name: "Boutique Hotels Network", revenue: 8900, bookings: 41, type: "hotel" },
  { name: "Coastal Adventure Tours", revenue: 7500, bookings: 38, type: "tour" },
];

// Booking Status Distribution
export const bookingStatusData: BookingStatus[] = [
  { status: "Confirmed", count: 384, percentage: 48 },
  { status: "Completed", count: 272, percentage: 34 },
  { status: "Pending", count: 104, percentage: 13 },
  { status: "Cancelled", count: 40, percentage: 5 },
];

// Popular Destinations (Vietnam)
export const popularDestinationsData: PopularDestination[] = [
  { destination: "Da Nang", bookings: 187, percentage: 28 },
  { destination: "Nha Trang", bookings: 156, percentage: 23 },
  { destination: "Phu Quoc", bookings: 134, percentage: 20 },
  { destination: "Ha Long", bookings: 112, percentage: 17 },
  { destination: "Hoi An", bookings: 81, percentage: 12 },
];

// Monthly Revenue (Last 6 months)
export const monthlyRevenueData: MonthlyRevenue[] = [
  { month: "Jun", revenue: 115000, previousYear: 98000 },
  { month: "Jul", revenue: 132000, previousYear: 112000 },
  { month: "Aug", revenue: 148000, previousYear: 125000 },
  { month: "Sep", revenue: 138000, previousYear: 118000 },
  { month: "Oct", revenue: 156000, previousYear: 135000 },
  { month: "Nov", revenue: 171000, previousYear: 148000 },
];

// Bookings Data
export const bookingsData: Booking[] = [
  {
    id: "BK001",
    guest: "Nguyễn Văn An",
    service: "Deluxe Ocean View",
    serviceType: "hotel",
    checkIn: "2024-11-25",
    checkOut: "2024-11-28",
    guests: 2,
    amount: "$540",
    status: "confirmed",
    source: "Direct",
  },
  {
    id: "BK002",
    guest: "Trần Thị Bình",
    service: "Hoi An Heritage Tour",
    serviceType: "tour",
    checkIn: "2024-11-26",
    checkOut: "2024-11-27",
    guests: 1,
    amount: "$180",
    status: "pending",
    source: "Booking.com",
  },
  {
    id: "BK003",
    guest: "Lê Minh Châu",
    service: "Premium City Hotel",
    serviceType: "hotel",
    checkIn: "2024-11-28",
    checkOut: "2024-11-30",
    guests: 3,
    amount: "$432",
    status: "confirmed",
    source: "Expedia",
  },
  {
    id: "BK004",
    guest: "Phạm Thu Dung",
    service: "Beach Resort Package",
    serviceType: "hotel",
    checkIn: "2024-11-24",
    checkOut: "2024-11-27",
    guests: 2,
    amount: "$720",
    status: "completed",
    source: "Agoda",
  },
  {
    id: "BK005",
    guest: "Hoàng Văn Em",
    service: "Ha Long Bay Cruise",
    serviceType: "tour",
    checkIn: "2024-11-26",
    checkOut: "2024-11-28",
    guests: 4,
    amount: "$680",
    status: "pending",
    source: "Direct",
  },
  {
    id: "BK006",
    guest: "Đỗ Thị Phương",
    service: "Mountain View Hotel",
    serviceType: "hotel",
    checkIn: "2024-11-27",
    checkOut: "2024-11-29",
    guests: 2,
    amount: "$450",
    status: "confirmed",
    source: "Booking.com",
  },
  {
    id: "BK007",
    guest: "Vũ Minh Giang",
    service: "Sapa Trekking Adventure",
    serviceType: "tour",
    checkIn: "2024-11-29",
    checkOut: "2024-12-02",
    guests: 3,
    amount: "$395",
    status: "confirmed",
    source: "Direct",
  },
  {
    id: "BK008",
    guest: "Bùi Thị Hoa",
    service: "Boutique Hotel Suite",
    serviceType: "hotel",
    checkIn: "2024-11-25",
    checkOut: "2024-11-28",
    guests: 2,
    amount: "$615",
    status: "completed",
    source: "Expedia",
  },
];