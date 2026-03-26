// src/components/page/home/RegionSection.tsx
import React, { useState, useEffect } from 'react';
import { useLazyImage } from '../../../hooks/useLazyImage';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

interface Province {
  id: string | number;
  name: string; // Tên tỉnh (e.g., Hà Nội)
  fullName: string;
  code: string;
  codeName: string; // Slug (e.g., ha_noi)
  divisionType: string;
  thumbnailUrl: string;
  imageUrl?: string; // Image URL from database
  regionCode: string; // e.g., dong_bang_song_hong
  administrativeRegion?: {
    id: number;
    name: string;
    name_en: string;
    code_name_en: string;
    macroRegion: string;
  };
}

interface RegionCardProps {
  _id: string;
  _name: string;
  location: string;
  image: string;
  onClick: () => void;
  type?: 'main' | 'place';
  fallbackImage?: string;
  eager?: boolean; // Eager load image (no lazy loading)
}

const RegionCard: React.FC<RegionCardProps> = ({
  _id,
  _name,
  location,
  image,
  onClick,
  type = 'main',
  fallbackImage = '/images/placeholder-region.jpg',
  eager = false
}) => {
  const [actuallyLoaded, setActuallyLoaded] = React.useState(false);

  const {
    ref,
    imageLoaded,
    showPlaceholder,
    shouldLoadImage,
    hasError,
    currentSrc,
    setImageLoaded,
    setHasError
  } = useLazyImage<HTMLDivElement>(image, {
    rootMargin: eager ? '0px' : '50px',
    once: true,
    priority: eager || type === 'main' ? 'high' : 'low',
    fallbackSrc: fallbackImage,
  });

  // Timeout fallback: Hide skeleton after 3s even if image not loaded
  React.useEffect(() => {
    if (shouldLoadImage && !imageLoaded && !hasError) {
      const timeout = setTimeout(() => {
        console.warn(`Image loading timeout, hiding skeleton: ${location}`);
        setImageLoaded(true); // Hide skeleton
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [shouldLoadImage, imageLoaded, hasError, location, setImageLoaded]);

  const heightClass = type === 'main'
    ? 'h-48 sm:h-56 lg:h-72'
    : 'h-40 sm:h-44 lg:h-52';

  const titleSize = type === 'main'
    ? 'text-lg sm:text-xl lg:text-2xl'
    : 'text-base sm:text-lg';

  // For eager loading, bypass lazy loading completely
  if (eager) {
    return (
      <div onClick={onClick} className="group cursor-pointer h-full">
        <div
          className={`relative ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden shadow-lg h-full`}
        >
          {/* Skeleton - show until image loads */}
          {!actuallyLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          <img
            src={image}
            alt={location}
            onLoad={() => setActuallyLoaded(true)}
            onError={() => setActuallyLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${actuallyLoaded ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* Overlay - only show when loaded */}
          {actuallyLoaded && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 text-white z-10">
                <h3 className={`${titleSize} font-bold mb-1 drop-shadow-lg`}>
                  {location}
                </h3>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="group cursor-pointer h-full">
      <div
        ref={ref}
        className={`relative ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden shadow-lg h-full`}
      >
        {/* Skeleton */}
        {showPlaceholder && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
            <span className="text-xs">No Image</span>
          </div>
        )}

        {/* Actual Image */}
        {shouldLoadImage && (
          <img
            src={currentSrc}
            alt={location}
            onLoad={() => {
              setImageLoaded(true);
              setActuallyLoaded(true);
            }}
            onError={() => setHasError(true)}
            className={`
              w-full h-full object-cover 
              group-hover:scale-110 transition-transform duration-500
              ${actuallyLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}

        {/* Content Overlays - Only show when image actually loaded */}
        {actuallyLoaded && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 text-white z-10">
              <h3 className={`${titleSize} font-bold mb-1 drop-shadow-lg`}>
                {location}
              </h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const RegionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('mien-bac');
  const [allProvinces, setAllProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Mock Data for Fallback
  const mockProvinces: Province[] = [
    // North (Regions 1, 2, 3)
    { code: '01', name: 'Hà Nội', fullName: 'Thành phố Hà Nội', codeName: 'ha-noi', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://ik.imagekit.io/tvlk/blog/2017/06/kham-pha-cac-dia-diem-du-lich-o-ha-noi-ma-ban-khong-the-bo-qua-3.jpg?tr=w-800,h-600,fo-auto,q-80', imageUrl: 'https://ik.imagekit.io/tvlk/blog/2017/06/kham-pha-cac-dia-diem-du-lich-o-ha-noi-ma-ban-khong-the-bo-qua-3.jpg?tr=w-800,h-600,fo-auto,q-80', regionCode: 'dong_bang_song_hong', id: '01' },
    { code: '04', name: 'Cao Bằng', fullName: 'Tỉnh Cao Bằng', codeName: 'cao-bang', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1580720334929-6c36b8e2db4d?q=80&w=1032&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1580720334929-6c36b8e2db4d?q=80&w=1032&auto=format&fit=crop', regionCode: 'dong_bac_bo', id: '04' },
    { code: '08', name: 'Tuyên Quang', fullName: 'Tỉnh Tuyên Quang', codeName: 'tuyen-quang', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', regionCode: 'dong_bac_bo', id: '08' },
    { code: '11', name: 'Điện Biên', fullName: 'Tỉnh Điện Biên', codeName: 'dien-bien', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1619140179055-bc2288b16d15?q=80&w=1170&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1619140179055-bc2288b16d15?q=80&w=1170&auto=format&fit=crop', regionCode: 'tay_bac_bo', id: '11' },
    { code: '12', name: 'Lai Châu', fullName: 'Tỉnh Lai Châu', codeName: 'lai-chau', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', regionCode: 'tay_bac_bo', id: '12' },
    { code: '14', name: 'Sơn La', fullName: 'Tỉnh Sơn La', codeName: 'son-la', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', regionCode: 'tay_bac_bo', id: '14' },
    { code: '15', name: 'Lào Cai', fullName: 'Tỉnh Lào Cai', codeName: 'lao-cai', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1752127388106-fc3a0595f5b6?q=80&w=1171&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1752127388106-fc3a0595f5b6?q=80&w=1171&auto=format&fit=crop', regionCode: 'tay_bac_bo', id: '15' },
    { code: '19', name: 'Thái Nguyên', fullName: 'Tỉnh Thái Nguyên', codeName: 'thai-nguyen', divisionType: 'tinh', thumbnailUrl: 'https://statics.vinpearl.com/Thai-Nguyen-Vietnam-12_1703434221.jpg', imageUrl: 'https://statics.vinpearl.com/Thai-Nguyen-Vietnam-12_1703434221.jpg', regionCode: 'dong_bac_bo', id: '19' },
    { code: '20', name: 'Lạng Sơn', fullName: 'Tỉnh Lạng Sơn', codeName: 'lang-son', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', regionCode: 'dong_bac_bo', id: '20' },
    { code: '22', name: 'Quảng Ninh', fullName: 'Tỉnh Quảng Ninh', codeName: 'quang-ninh', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1707292098561-a251b9aa4014?q=80&w=1032&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1707292098561-a251b9aa4014?q=80&w=1032&auto=format&fit=crop', regionCode: 'dong_bac_bo', id: '22' },
    { code: '24', name: 'Bắc Ninh', fullName: 'Tỉnh Bắc Ninh', codeName: 'bac-ninh', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1702300732637-2fd1e481983c?q=80&w=1170&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1702300732637-2fd1e481983c?q=80&w=1170&auto=format&fit=crop', regionCode: 'dong_bang_song_hong', id: '24' },
    { code: '25', name: 'Phú Thọ', fullName: 'Tỉnh Phú Thọ', codeName: 'phu-tho', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1764141738717-896b3365c196?q=80&w=1170&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1764141738717-896b3365c196?q=80&w=1170&auto=format&fit=crop', regionCode: 'dong_bac_bo', id: '25' },
    { code: '31', name: 'Hải Phòng', fullName: 'Thành phố Hải Phòng', codeName: 'hai-phong', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1723065176657-85efdc04ac54?q=80&w=1074&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1723065176657-85efdc04ac54?q=80&w=1074&auto=format&fit=crop', regionCode: 'dong_bang_song_hong', id: '31' },
    { code: '33', name: 'Hưng Yên', fullName: 'Tỉnh Hưng Yên', codeName: 'hung-yen', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', regionCode: 'dong_bang_song_hong', id: '33' },
    { code: '37', name: 'Ninh Bình', fullName: 'Tỉnh Ninh Bình', codeName: 'ninh-binh', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1502851755296-d42fd093190e?q=80&w=1170&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1502851755296-d42fd093190e?q=80&w=1170&auto=format&fit=crop', regionCode: 'dong_bang_song_hong', id: '37' },

    // Central (Regions 4, 5, 6)
    { code: '38', name: 'Thanh Hóa', fullName: 'Tỉnh Thanh Hóa', codeName: 'thanh-hoa', divisionType: 'tinh', thumbnailUrl: 'https://anhphatcorp.com.vn/wp-content/uploads/2021/04/Du-Lich-Thanh-Hoa-1.jpg', imageUrl: 'https://anhphatcorp.com.vn/wp-content/uploads/2021/04/Du-Lich-Thanh-Hoa-1.jpg', regionCode: 'bac_trung_bo', id: '38' },
    { code: '40', name: 'Nghệ An', fullName: 'Tỉnh Nghệ An', codeName: 'nghe-an', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1601361523212-5d7d3084dfcb?q=80&w=1170&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1601361523212-5d7d3084dfcb?q=80&w=1170&auto=format&fit=crop', regionCode: 'bac_trung_bo', id: '40' },
    { code: '42', name: 'Hà Tĩnh', fullName: 'Tỉnh Hà Tĩnh', codeName: 'ha-tinh', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1671385033947-50112c95d581?q=80&w=1170&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1671385033947-50112c95d581?q=80&w=1170&auto=format&fit=crop', regionCode: 'bac_trung_bo', id: '42' },
    { code: '44', name: 'Quảng Trị', fullName: 'Tỉnh Quảng Trị', codeName: 'quang-tri', divisionType: 'tinh', thumbnailUrl: 'https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20Qu%E1%BA%A3ng%20Tr%E1%BB%8B/anh-dep-quang-tri-thumb.jpg', imageUrl: 'https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20Qu%E1%BA%A3ng%20Tr%E1%BB%8B/anh-dep-quang-tri-thumb.jpg', regionCode: 'bac_trung_bo', id: '44' },
    { code: '46', name: 'Huế', fullName: 'Thành phố Huế', codeName: 'hue', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1758487892397-688ea7102b47?q=80&w=1031&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1758487892397-688ea7102b47?q=80&w=1031&auto=format&fit=crop', regionCode: 'bac_trung_bo', id: '46' },
    { code: '48', name: 'Đà Nẵng', fullName: 'Thành phố Đà Nẵng', codeName: 'da-nang', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1738627760098-51b0df6f2ac9?q=80&w=1170&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1738627760098-51b0df6f2ac9?q=80&w=1170&auto=format&fit=crop', regionCode: 'duyen_hai_nam_trung_bo', id: '48' },
    { code: '51', name: 'Quảng Ngãi', fullName: 'Tỉnh Quảng Ngãi', codeName: 'quang-ngai', divisionType: 'tinh', thumbnailUrl: 'https://vietcetera.com/wp-content/uploads/2017/09/Quang_Ngai_6.jpg', imageUrl: 'https://vietcetera.com/wp-content/uploads/2017/09/Quang_Ngai_6.jpg', regionCode: 'duyen_hai_nam_trung_bo', id: '51' },
    { code: '52', name: 'Gia Lai', fullName: 'Tỉnh Gia Lai', codeName: 'gia-lai', divisionType: 'tinh', thumbnailUrl: 'https://tse4.mm.bing.net/th/id/OIP.M2-Ew0oOw_Uhqtvbnp3L3AHaEp?rs=1&pid=ImgDetMain', imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.M2-Ew0oOw_Uhqtvbnp3L3AHaEp?rs=1&pid=ImgDetMain', regionCode: 'tay_nguyen', id: '52' },
    { code: '56', name: 'Khánh Hòa', fullName: 'Tỉnh Khánh Hòa', codeName: 'khanh-hoa', divisionType: 'tinh', thumbnailUrl: 'https://tse3.mm.bing.net/th/id/OIP.y2ICB4u_sZ3bsSADph_L5gHaE3?rs=1&pid=ImgDetMain', imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.y2ICB4u_sZ3bsSADph_L5gHaE3?rs=1&pid=ImgDetMain', regionCode: 'duyen_hai_nam_trung_bo', id: '56' },
    { code: '66', name: 'Đắk Lắk', fullName: 'Tỉnh Đắk Lắk', codeName: 'dak-lak', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1688729991710-fe54f0d349cd?q=80&w=1035&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1688729991710-fe54f0d349cd?q=80&w=1035&auto=format&fit=crop', regionCode: 'tay_nguyen', id: '66' },
    { code: '68', name: 'Lâm Đồng', fullName: 'Tỉnh Lâm Đồng', codeName: 'lam-dong', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1652829792625-055eb9e877a3?q=80&w=1032&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1652829792625-055eb9e877a3?q=80&w=1032&auto=format&fit=crop', regionCode: 'tay_nguyen', id: '68' },

    // South (Regions 7, 8)
    { code: '75', name: 'Đồng Nai', fullName: 'Tỉnh Đồng Nai', codeName: 'dong-nai', divisionType: 'tinh', thumbnailUrl: 'https://ik.imagekit.io/tvlk/blog/2022/03/dia-diem-du-lich-dong-nai-cover.jpeg?tr=dpr-1.5', imageUrl: 'https://ik.imagekit.io/tvlk/blog/2022/03/dia-diem-du-lich-dong-nai-cover.jpeg?tr=dpr-1.5', regionCode: 'dong_nam_bo', id: '75' },
    { code: '79', name: 'Hồ Chí Minh', fullName: 'TP. Hồ Chí Minh', codeName: 'ho-chi-minh', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1738697587041-184841d5d23a?q=80&w=1035&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1738697587041-184841d5d23a?q=80&w=1035&auto=format&fit=crop', regionCode: 'dong_nam_bo', id: '79' },
    { code: '80', name: 'Tây Ninh', fullName: 'Tỉnh Tây Ninh', codeName: 'tay-ninh', divisionType: 'tinh', thumbnailUrl: 'https://tse1.mm.bing.net/th/id/OIP.HLgfM3A25a41bk4vnTlltAHaE7?o=7rm=3&rs=1&pid=ImgDetMain', imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.HLgfM3A25a41bk4vnTlltAHaE7?o=7rm=3&rs=1&pid=ImgDetMain', regionCode: 'dong_nam_bo', id: '80' },
    { code: '82', name: 'Đồng Tháp', fullName: 'Tỉnh Đồng Tháp', codeName: 'dong-thap', divisionType: 'tinh', thumbnailUrl: 'https://tse1.mm.bing.net/th/id/OIP.CYSajuXyK0rREWDiavSTlwHaEK?o=7rm=3&rs=1&pid=ImgDetMain', imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.CYSajuXyK0rREWDiavSTlwHaEK?o=7rm=3&rs=1&pid=ImgDetMain', regionCode: 'dong_bang_song_cuu_long', id: '82' },
    { code: '86', name: 'Vĩnh Long', fullName: 'Tỉnh Vĩnh Long', codeName: 'vinh-long', divisionType: 'tinh', thumbnailUrl: 'http://reviewvilla.vn/wp-content/uploads/2022/06/Ban-sao-cua-du-lich-vinh-long-2.jpg', imageUrl: 'http://reviewvilla.vn/wp-content/uploads/2022/06/Ban-sao-cua-du-lich-vinh-long-2.jpg', regionCode: 'dong_bang_song_cuu_long', id: '86' },
    { code: '91', name: 'An Giang', fullName: 'Tỉnh An Giang', codeName: 'an-giang', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1580630873708-e0475b1856c4?q=80&w=1133&auto=format&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1580630873708-e0475b1856c4?q=80&w=1133&auto=format&fit=crop', regionCode: 'dong_bang_song_cuu_long', id: '91' },
    { code: '92', name: 'Cần Thơ', fullName: 'Thành phố Cần Thơ', codeName: 'can-tho', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://tse1.mm.bing.net/th/id/OIP.C33mpqWnro6jTnRL3J8_uwHaCu?rs=1&pid=ImgDetMain', imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.C33mpqWnro6jTnRL3J8_uwHaCu?rs=1&pid=ImgDetMain', regionCode: 'dong_bang_song_cuu_long', id: '92' },
    { code: '96', name: 'Cà Mau', fullName: 'Tỉnh Cà Mau', codeName: 'ca-mau', divisionType: 'tinh', thumbnailUrl: 'http://advmotorcycletours.com/wp-content/uploads/2016/10/Ca-Mau-Vietnam.jpg', imageUrl: 'http://advmotorcycletours.com/wp-content/uploads/2016/10/Ca-Mau-Vietnam.jpg', regionCode: 'dong_bang_song_cuu_long', id: '96' },
  ];

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.provinces.getAll();

        if (Array.isArray(data) && data.length > 0) {
          // Ensure each province has imageUrl, use placeholder if missing
          const provincesWithImages = data.map(p => ({
            ...p,
            imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&q=80'
          }));
          setAllProvinces(provincesWithImages);
        } else {
          setAllProvinces(mockProvinces);
        }
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
        setAllProvinces(mockProvinces);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  const getFilteredData = (tab: string) => {
    let filtered = [];

    switch (tab) {
      case 'mien-bac':
        filtered = allProvinces.filter(p =>
          p.administrativeRegion && ['northest', 'northwest', 'red_river_delta'].includes(p.administrativeRegion.code_name_en)
        );
        break;
      case 'mien-trung':
        filtered = allProvinces.filter(p =>
          p.administrativeRegion && ['north_central_coast', 'south_central_coast', 'central_highlands'].includes(p.administrativeRegion.code_name_en)
        );
        break;
      case 'mien-nam':
        filtered = allProvinces.filter(p =>
          p.administrativeRegion && ['southeast', 'southwest'].includes(p.administrativeRegion.code_name_en)
        );
        break;
      default:
        filtered = allProvinces;
    }

    // Sort by imageUrl availability
    filtered.sort((a, b) => {
      if (a.imageUrl && !b.imageUrl) return -1;
      if (!a.imageUrl && b.imageUrl) return 1;
      return 0;
    });

    // Fallback if filtering returns nothing
    if (filtered.length < 5) {
      const fallbackRegion = mockProvinces.filter(p => {
        if (tab === 'mien-bac') return ['dong_bac_bo', 'tay_bac_bo', 'dong_bang_song_hong'].includes(p.regionCode);
        if (tab === 'mien-trung') return ['bac_trung_bo', 'duyen_hai_nam_trung_bo', 'tay_nguyen'].includes(p.regionCode);
        if (tab === 'mien-nam') return ['dong_nam_bo', 'dong_bang_song_cuu_long'].includes(p.regionCode);
        return false;
      });
      if (fallbackRegion.length > 0) filtered = fallbackRegion;
    }

    return {
      regions: filtered.slice(0, 3).map(p => ({
        id: p.code,
        name: p.name,
        location: p.name,
        image: p.imageUrl || '/images/placeholder-region.jpg',
        destinationSlug: (p.codeName || p.code || '').replace(/_/g, '-'),
        regionSlug: tab
      })),
      places: filtered.slice(3, 5).map(p => ({
        id: p.code,
        name: p.name,
        location: p.name,
        image: p.imageUrl || '/images/placeholder-region.jpg',
        destinationSlug: (p.codeName || p.code || '').replace(/_/g, '-'),
        regionSlug: tab
      }))
    };
  };

  const currentData = getFilteredData(activeTab);

  const handleRegionClick = (slug: string, _name: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('destination', slug);
    queryParams.append('serviceType', 'TICKET_VENUE');
    navigate(`/destinations?${queryParams.toString()}`);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1D7A] mb-2 sm:mb-3">
            ĐIỂM ĐẾN YÊU THÍCH
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Trải nghiệm các điểm du lịch nổi tiếng với đa dạng
          </p>
        </div>

        <div className="mb-6 sm:mb-8 lg:mb-10 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center gap-6 sm:gap-12 lg:gap-16 min-w-max px-4 sm:px-0">
            {['mien-bac', 'mien-trung', 'mien-nam'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer pb-2 sm:pb-3 px-2 font-bold text-base sm:text-lg lg:text-xl transition-all whitespace-nowrap ${activeTab === tab
                  ? 'text-[#1A1D7A] border-b-3 sm:border-b-4 border-blue-600'
                  : 'text-gray-600 hover:text-orange-500'
                  }`}
              >
                {tab === 'mien-bac' ? 'Miền Bắc' : tab === 'mien-trung' ? 'Miền Trung' : 'Miền Nam'}
              </button>
            ))}
          </div>
        </div>

        {isLoading && currentData.regions.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-7 lg:mb-8 animate-fadeIn">
              {currentData.regions.map((region, index) => (
                <RegionCard
                  key={region.id}
                  _id={region.id}
                  _name={region.name}
                  location={region.location}
                  image={region.image}
                  type="main"
                  onClick={() => handleRegionClick(region.destinationSlug, region.name)}
                  eager={index === 0} // Eager load first image
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6 animate-fadeIn mt-2">
              {currentData.places.map((place) => (
                <div key={place.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-md h-full">
                  <RegionCard
                    _id={place.id}
                    _name={place.name}
                    location={place.location}
                    image={place.image}
                    type="place"
                    onClick={() => handleRegionClick(place.destinationSlug, place.name)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default RegionSection;