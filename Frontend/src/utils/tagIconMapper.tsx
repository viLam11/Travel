// src/utils/tagIconMapper.tsx
// Utility to map keyword tags to matching Lucide React icons
import React from 'react';
import {
  Wifi,
  Wind,
  Tv,
  Coffee,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  CableCar,
  Mountain,
  TreePine,
  Flower2,
  Bike,
  Sailboat,
  Telescope,
  Tent,
  MapPin,
  Camera,
  Sunset,
  Music,
  ShoppingBag,
  Ticket,
  Bus,
  PlaneTakeoff,
  Clock,
  Star,
  Heart,
  Shield,
  Zap,
  Droplets,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Globe,
  Map,
  Utensils,
  Wine,
  Soup,
  IceCream,
  Baby,
  Dog,
  Accessibility,
  CreditCard,
  Lock,
  Landmark,
  Building2,
  Hotel,
  BedDouble,
  Bath,
  Shirt,
  Package,
  Phone,
  Headphones,
  Printer,
  Monitor,
  Projector,
  Gamepad2,
  BookOpen,
  Library,
  Award,
  Flag,
  Eye,
} from 'lucide-react';

interface TagIconEntry {
  keywords: string[];
  icon: React.ReactElement;
}

const TAG_ICON_MAP: TagIconEntry[] = [
  // 🌐 Connectivity
  { keywords: ['wifi', 'wi-fi', 'internet', 'mạng', 'network', 'wireless'], icon: <Wifi /> },

  // ❄️ Climate
  { keywords: ['điều hòa', 'air condition', 'ac', 'máy lạnh', 'hvac', 'cooling'], icon: <Wind /> },
  { keywords: ['sưởi', 'heating', 'heater', 'sưởi ấm'], icon: <Flame /> },
  { keywords: ['tuyết', 'snow', 'snowflake', 'lạnh', 'winter'], icon: <Snowflake /> },

  // 📺 Electronics
  { keywords: ['tv', 'tivi', 'television', 'màn hình', 'smart tv'], icon: <Tv /> },
  { keywords: ['máy tính', 'computer', 'pc', 'laptop', 'monitor'], icon: <Monitor /> },
  { keywords: ['máy chiếu', 'projector', 'projection'], icon: <Projector /> },
  { keywords: ['game', 'gaming', 'gamepad', 'trò chơi', 'arcade'], icon: <Gamepad2 /> },
  { keywords: ['headphone', 'tai nghe', 'audio', 'âm thanh', 'sound'], icon: <Headphones /> },

  // 🍴 Food & Drink
  { keywords: ['minibar', 'bar', 'mini bar', 'cocktail', 'beer', 'bia', 'rượu'], icon: <Wine /> },
  { keywords: ['nhà hàng', 'restaurant', 'dining', 'ăn uống'], icon: <UtensilsCrossed /> },
  { keywords: ['cà phê', 'coffee', 'cafe', 'espresso'], icon: <Coffee /> },
  { keywords: ['ăn sáng', 'breakfast', 'brunch', 'bữa sáng', 'bữa trưa', 'lunch'], icon: <Utensils /> },
  { keywords: ['ăn tối', 'dinner', 'supper', 'bữa tối'], icon: <Soup /> },
  { keywords: ['kem', 'ice cream', 'dessert', 'tráng miệng'], icon: <IceCream /> },

  // 🚗 Transport
  { keywords: ['bãi đậu xe', 'parking', 'bãi đỗ xe', 'car park', 'garage'], icon: <Car /> },
  { keywords: ['xe buýt', 'bus', 'shuttle', 'xe đưa đón', 'transfer'], icon: <Bus /> },
  { keywords: ['máy bay', 'airport', 'flight', 'sân bay', 'plane'], icon: <PlaneTakeoff /> },

  // 🏋️ Sport & Wellness
  { keywords: ['gym', 'fitness', 'tập thể dục', 'thể thao', 'workout', 'exercise', 'phòng gym'], icon: <Dumbbell /> },
  { keywords: ['hồ bơi', 'pool', 'swimming', 'bể bơi', 'bơi lội', 'aqua'], icon: <Waves /> },
  { keywords: ['spa', 'massage', 'relax', 'thư giãn', 'wellness', 'sauna'], icon: <Droplets /> },
  { keywords: ['đạp xe', 'bike', 'bicycle', 'cycling', 'xe đạp'], icon: <Bike /> },

  // 🏔️ Nature & Outdoor
  { keywords: ['cáp treo', 'cable car', 'gondola', 'tramway', 'ropeway', 'aerial'], icon: <CableCar /> },
  { keywords: ['núi', 'mountain', 'peak', 'đỉnh núi', 'highland', 'hill', 'đồi'], icon: <Mountain /> },
  { keywords: ['rừng', 'forest', 'jungle', 'tree', 'cây', 'nature', 'tự nhiên', 'thiên nhiên'], icon: <TreePine /> },
  { keywords: ['hoa', 'flower', 'garden', 'vườn', 'bloom', 'floral'], icon: <Flower2 /> },
  { keywords: ['biển', 'beach', 'ocean', 'sea', 'bãi biển', 'coast', 'coastal', 'ocean'], icon: <Sailboat /> },
  { keywords: ['cắm trại', 'camping', 'camp', 'tent', 'lều trại', 'outdoor'], icon: <Tent /> },
  { keywords: ['hoàng hôn', 'sunrise', 'sunset', 'view', 'panorama', 'cảnh đẹp', 'tầm nhìn'], icon: <Sunset /> },

  // 🗺️ Sightseeing
  { keywords: ['tham quan', 'sightseeing', 'tour', 'visit', 'khám phá', 'explore'], icon: <Map /> },
  { keywords: ['địa điểm', 'location', 'place', 'destination', 'landmark', 'địa danh'], icon: <MapPin /> },
  { keywords: ['chụp ảnh', 'photo', 'photography', 'camera', 'selfie', 'ảnh'], icon: <Camera /> },
  { keywords: ['đài quan sát', 'observatory', 'telescope', 'star', 'sao', 'observation'], icon: <Telescope /> },
  { keywords: ['di tích', 'heritage', 'monument', 'historical', 'lịch sử', 'cổ', 'đền', 'chùa'], icon: <Landmark /> },

  // 🎭 Entertainment
  { keywords: ['âm nhạc', 'music', 'concert', 'show', 'nhạc', 'event', 'sự kiện'], icon: <Music /> },
  { keywords: ['mua sắm', 'shopping', 'shop', 'mall', 'market', 'chợ'], icon: <ShoppingBag /> },
  { keywords: ['vé', 'ticket', 'admission', 'entry'], icon: <Ticket /> },
  { keywords: ['thư viện', 'library', 'book', 'sách', 'reading', 'đọc sách'], icon: <Library /> },
  { keywords: ['sách', 'bookstore', 'bookshop'], icon: <BookOpen /> },

  // 🧒 Family
  { keywords: ['trẻ em', 'children', 'kids', 'child', 'baby', 'thân thiện trẻ em', 'family'], icon: <Baby /> },
  { keywords: ['thú cưng', 'pet', 'dog', 'animal', 'chó', 'mèo'], icon: <Dog /> },
  { keywords: ['người khuyết tật', 'accessible', 'wheelchair', 'accessibility', 'disability'], icon: <Accessibility /> },

  // 🏢 Facilities
  { keywords: ['giặt ủi', 'laundry', 'washing', 'giặt đồ', 'laundry service', 'ironing'], icon: <Shirt /> },
  { keywords: ['phòng họp', 'meeting room', 'conference', 'business', 'hội nghị', 'họp'], icon: <Building2 /> },
  { keywords: ['phòng ngủ', 'bedroom', 'room', 'suite', 'apartment', 'căn hộ'], icon: <BedDouble /> },
  { keywords: ['phòng tắm', 'bathroom', 'shower', 'bathtub', 'tắm'], icon: <Bath /> },
  { keywords: ['két an toàn', 'safe', 'locker', 'security', 'an ninh', 'bảo mật'], icon: <Lock /> },
  { keywords: ['thanh toán thẻ', 'card payment', 'credit card', 'cashless'], icon: <CreditCard /> },
  { keywords: ['bưu kiện', 'package', 'delivery', 'luggage', 'hành lý', 'vali'], icon: <Package /> },
  { keywords: ['in ấn', 'print', 'fax', 'copy', 'photocopy'], icon: <Printer /> },
  { keywords: ['điện thoại', 'phone', 'telephone', 'call', 'reception', 'lễ tân'], icon: <Phone /> },

  // 🌞 General Vibe
  { keywords: ['luxury', 'cao cấp', 'sang trọng', 'premium', 'vip', '5 sao', '5 star'], icon: <Star /> },
  { keywords: ['romantic', 'lãng mạn', 'love', 'tình yêu', 'couple', 'honeymoon', 'cặp đôi'], icon: <Heart /> },
  { keywords: ['an toàn', 'safe', 'safety', 'secure', 'bảo vệ', 'protect'], icon: <Shield /> },
  { keywords: ['nhanh', 'fast', 'quick', 'speed', 'express', 'rapid', 'tốc độ'], icon: <Zap /> },
  { keywords: ['quốc tế', 'international', 'global', 'world', 'thế giới'], icon: <Globe /> },
  { keywords: ['nổi tiếng', 'famous', 'popular', 'award', 'giải thưởng', 'chứng nhận'], icon: <Award /> },
  { keywords: ['check in', 'checkin', 'clock', 'giờ', 'thời gian', 'hour', 'time'], icon: <Clock /> },
  { keywords: ['hướng dẫn', 'guide', 'info', 'thông tin', 'information'], icon: <Eye /> },
  { keywords: ['cờ', 'flag', 'country', 'quốc gia', 'vùng'], icon: <Flag /> },
  { keywords: ['khách sạn', 'hotel', 'motel', 'hostel', 'resort'], icon: <Hotel /> },
  { keywords: ['mặt trời', 'sunny', 'sun', 'nắng', 'summer', 'mùa hè'], icon: <Sun /> },
  { keywords: ['đêm', 'night', 'moon', 'trăng', 'ngôi sao', 'stars'], icon: <Moon /> },
];

const DEFAULT_ICON = (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * Maps a tag/keyword string to a matching Lucide icon.
 * Falls back to a checkmark icon if no match found.
 * @param tag - The keyword/tag string to match
 * @param className - Optional CSS class for the icon (default: "w-5 h-5")
 */
export function getTagIcon(tag: string, className = 'w-5 h-5'): React.ReactElement {
  const normalized = tag.toLowerCase().trim();

  for (const entry of TAG_ICON_MAP) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        return React.cloneElement(entry.icon as React.ReactElement<any>, { className });
      }
    }
  }

  return React.cloneElement(DEFAULT_ICON as React.ReactElement<any>, { className });
}

export default getTagIcon;
