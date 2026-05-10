import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Search, Layers } from 'lucide-react';
import { Button } from '@/components/ui/admin/button';
import { toast } from 'sonner';

interface MapPickerProps {
  lat?: string | number;
  lng?: string | number;
  onChange?: (lat: string, lng: string) => void;
  address?: string;
  readOnly?: boolean;
}

// === CONSTANTS & HELPERS FOR VIETNAM GEOCODING ===
const VIETNAM_PROVINCES: Record<string, { bbox: [number, number, number, number] }> = {
  // MIỀN NAM
  'Tây Ninh': { bbox: [105.78, 10.90, 106.30, 11.82] },
  'Hồ Chí Minh': { bbox: [106.36, 10.35, 107.02, 11.16] },
  'Bình Dương': { bbox: [106.25, 10.75, 106.95, 11.65] },
  'Đồng Nai': { bbox: [106.48, 10.55, 107.62, 11.62] },
  'Bà Rịa - Vũng Tàu': { bbox: [107.00, 10.30, 107.72, 10.95] },
  'Long An': { bbox: [105.52, 10.35, 106.70, 11.02] },
  'Tiền Giang': { bbox: [105.57, 10.10, 106.57, 10.72] },
  'Bến Tre': { bbox: [105.82, 9.82, 106.80, 10.45] },
  'Vĩnh Long': { bbox: [105.52, 9.87, 106.17, 10.38] },
  'Trà Vinh': { bbox: [105.82, 9.52, 106.62, 10.12] },
  'Đồng Tháp': { bbox: [105.18, 10.17, 106.00, 10.97] },
  'An Giang': { bbox: [104.68, 10.22, 105.62, 10.95] },
  'Kiên Giang': { bbox: [103.85, 9.32, 105.42, 10.48] },
  'Cần Thơ': { bbox: [105.35, 9.90, 105.92, 10.38] },
  'Hậu Giang': { bbox: [105.35, 9.60, 105.92, 10.15] },
  'Sóc Trăng': { bbox: [105.52, 9.32, 106.28, 9.98] },
  'Bạc Liêu': { bbox: [105.20, 8.98, 106.05, 9.62] },
  'Cà Mau': { bbox: [104.55, 8.55, 105.35, 9.35] },
  'Bình Phước': { bbox: [106.15, 11.28, 107.32, 12.28] },
  // MIỀN TRUNG
  'Đà Nẵng': { bbox: [107.85, 15.88, 108.32, 16.30] },
  'Quảng Nam': { bbox: [107.18, 15.10, 108.55, 16.18] },
  'Quảng Ngãi': { bbox: [108.25, 14.55, 109.10, 15.55] },
  'Bình Định': { bbox: [108.42, 13.52, 109.30, 14.75] },
  'Phú Yên': { bbox: [108.52, 12.68, 109.48, 13.68] },
  'Khánh Hòa': { bbox: [108.52, 11.78, 109.45, 12.88] },
  'Ninh Thuận': { bbox: [108.55, 11.18, 109.28, 12.05] },
  'Bình Thuận': { bbox: [107.38, 10.38, 108.78, 11.62] },
  'Thừa Thiên Huế': { bbox: [107.02, 15.98, 108.18, 16.78] },
  'Quảng Trị': { bbox: [106.38, 16.38, 107.62, 17.18] },
  'Quảng Bình': { bbox: [105.58, 16.95, 107.08, 18.15] },
  'Hà Tĩnh': { bbox: [105.08, 17.55, 106.72, 18.75] },
  'Nghệ An': { bbox: [103.75, 18.55, 105.78, 20.08] },
  'Thanh Hóa': { bbox: [104.22, 19.25, 106.08, 20.65] },
  // TÂY NGUYÊN
  'Kon Tum': { bbox: [107.18, 13.68, 108.45, 15.28] },
  'Gia Lai': { bbox: [107.35, 12.98, 109.02, 14.65] },
  'Đắk Lắk': { bbox: [107.35, 11.98, 108.92, 13.45] },
  'Đắk Nông': { bbox: [107.18, 11.62, 108.25, 12.68] },
  'Lâm Đồng': { bbox: [107.48, 11.18, 108.78, 12.68] },
  // MIỀN BẮC
  'Hà Nội': { bbox: [105.28, 20.55, 106.02, 21.38] },
  'Hải Phòng': { bbox: [106.42, 20.52, 107.12, 21.08] },
  'Quảng Ninh': { bbox: [106.28, 20.68, 108.45, 21.72] },
  'Hải Dương': { bbox: [106.08, 20.72, 106.72, 21.18] },
  'Hưng Yên': { bbox: [105.78, 20.55, 106.22, 21.08] },
  'Thái Bình': { bbox: [106.08, 20.22, 106.65, 20.75] },
  'Nam Định': { bbox: [105.88, 19.98, 106.55, 20.62] },
  'Ninh Bình': { bbox: [105.68, 19.85, 106.18, 20.52] },
  'Hà Nam': { bbox: [105.72, 20.32, 106.18, 20.88] },
  'Hòa Bình': { bbox: [104.68, 20.15, 105.92, 21.08] },
  'Vĩnh Phúc': { bbox: [105.35, 21.08, 105.92, 21.55] },
  'Bắc Ninh': { bbox: [105.95, 20.95, 106.42, 21.28] },
  'Hà Giang': { bbox: [104.25, 22.15, 105.58, 23.38] },
  'Cao Bằng': { bbox: [105.18, 22.32, 106.82, 23.15] },
  'Bắc Kạn': { bbox: [105.38, 21.78, 106.18, 22.72] },
  'Tuyên Quang': { bbox: [104.82, 21.55, 105.72, 22.75] },
  'Lào Cai': { bbox: [103.52, 21.98, 104.72, 22.95] },
  'Yên Bái': { bbox: [103.88, 21.35, 105.08, 22.52] },
  'Thái Nguyên': { bbox: [105.38, 21.38, 106.28, 22.15] },
  'Lạng Sơn': { bbox: [106.12, 21.38, 107.25, 22.58] },
  'Bắc Giang': { bbox: [106.02, 21.15, 107.08, 21.88] },
  'Phú Thọ': { bbox: [104.72, 21.08, 105.52, 21.92] },
  'Điện Biên': { bbox: [102.12, 21.12, 103.62, 22.42] },
  'Lai Châu': { bbox: [102.48, 22.15, 103.98, 23.05] },
  'Sơn La': { bbox: [103.08, 20.52, 105.15, 22.05] },
};

function normalizeText(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function extractProvince(address: string) {
  const normalizedAddress = normalizeText(address);
  for (const province of Object.keys(VIETNAM_PROVINCES)) {
    const normalizedProvince = normalizeText(province);
    if (normalizedAddress.includes(normalizedProvince)) {
      return province;
    }
  }
  return null;
}

function cleanQuery(address: string) {
  return address
    .replace(/\bTP\.\s*/gi, 'Thành phố ')
    .replace(/\bTX\.\s*/gi, 'Thị xã ')
    .replace(/\bTT\.\s*/gi, 'Thị trấn ')
    .replace(/\bQ\.\s*/gi, 'Quận ')
    .replace(/\bH\.\s*/gi, 'Huyện ')
    .replace(/\bP\.\s*/gi, 'Phường ')
    .replace(/Tỉnh\s+/gi, '')
    .replace(/,\s*([^,]+),\s*\1\s*$/i, ', $1') // Bỏ duplicate cuối (vd: Tây Ninh, Tây Ninh)
    .trim();
}

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange, address, readOnly = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'satellite-streets-v12' | 'streets-v12'>('satellite-streets-v12');

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {     
    if (!token) {
      console.error('Mapbox token is missing. Please add VITE_MAPBOX_TOKEN to your .env file.');
      return;
    }

    mapboxgl.accessToken = token;

    if (map.current) return; // Initialize map only once

    const isValidCoords = lat !== undefined && lat !== null && lat !== '' && 
                         lng !== undefined && lng !== null && lng !== '';
                         
    const initialLat = isValidCoords ? Number(lat) : 10.762622; // Default to Saigon if not provided
    const initialLng = isValidCoords ? Number(lng) : 106.660172;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: `mapbox://styles/mapbox/${currentStyle}`,
      center: [initialLng, initialLat],
      zoom: lat && lng ? 15 : 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    marker.current = new mapboxgl.Marker({
      draggable: !readOnly,
      color: '#4F46E5', // Indigo-600
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    if (!readOnly && onChange) {
      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat();
        onChange(lngLat.lat.toString(), lngLat.lng.toString());
      });

      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        marker.current!.setLngLat([lng, lat]);
        onChange(lat.toString(), lng.toString());
      });
    }

    map.current.on('load', () => {
      setIsMapReady(true);
      map.current?.resize();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style
  const toggleStyle = () => {
    const nextStyle = currentStyle === 'satellite-streets-v12' ? 'streets-v12' : 'satellite-streets-v12';
    setCurrentStyle(nextStyle);
    map.current?.setStyle(`mapbox://styles/mapbox/${nextStyle}`);
  };

  // Function to geocode address
  const handleGeocode = async () => {
    if (!address) {
      toast.error('Vui lòng nhập địa chỉ trước khi tìm trên bản đồ');
      return;
    }

    const province = extractProvince(address);
    const searchQuery = cleanQuery(address);
    
    console.log('--- Advanced Geocoding Debug ---');
    console.log('Original Address:', address);
    console.log('Cleaned Query:', searchQuery);
    console.log('Detected Province:', province);
    
    try {
      let params = new URLSearchParams({
        country: 'vn',
        language: 'vi',
        limit: '1',
        access_token: token || ''
      });

      // Nếu tìm được tỉnh, thêm bbox để giới hạn vùng tìm kiếm (Hard-limit)
      if (province && VIETNAM_PROVINCES[province]) {
        const { bbox } = VIETNAM_PROVINCES[province];
        params.append('bbox', bbox.join(','));
        console.log(`Applying bbox for ${province}:`, bbox);
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${params.toString()}`
      );
      const data = await response.json();
      console.log('Mapbox Response:', data);

      if (data.features && data.features.length > 0) {
        const [newLng, newLat] = data.features[0].center;
        console.log('Found coordinates:', { newLat, newLng });
        console.log('Mapbox matched location:', data.features[0].place_name);
        
        map.current?.flyTo({
          center: [newLng, newLat],
          zoom: 16,
          essential: true
        });

        marker.current?.setLngLat([newLng, newLat]);
        onChange?.(newLat.toString(), newLng.toString());
        toast.success('Đã tìm thấy vị trí dựa trên địa chỉ!');
      } else {
        console.warn('No features found for this address within the specified province/country.');
        toast.error('Không tìm thấy tọa độ cho địa chỉ này trong tỉnh thành đã chọn.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Lỗi khi tìm kiếm địa chỉ');
    }
  };

  // Update marker if lat/lng props change from outside (e.g. initial load)
  useEffect(() => {
    if (isMapReady && lat && lng && marker.current) {
      const currentLngLat = marker.current.getLngLat();
      if (currentLngLat.lat !== Number(lat) || currentLngLat.lng !== Number(lng)) {
        marker.current.setLngLat([Number(lng), Number(lat)]);
        map.current?.setCenter([Number(lng), Number(lat)]);
      }
    }
  }, [lat, lng, isMapReady]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Xác nhận vị trí trên bản đồ
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={toggleStyle}
              className="text-xs h-8"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              {currentStyle === 'satellite-streets-v12' ? 'Chế độ Đường phố' : 'Chế độ Vệ tinh'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleGeocode}
              className="text-xs h-8 bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Tìm theo địa chỉ
            </Button>
          </div>
        )}
      </div>
      
      <div className="relative group">
        <div 
          ref={mapContainer} 
          className="h-[300px] w-full rounded-2xl border border-gray-200 shadow-inner overflow-hidden" 
        />
        {!token && (
          <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Navigation className="w-10 h-10 text-gray-400 mb-2 animate-pulse" />
            <p className="text-sm font-medium text-gray-600">Mapbox Token chưa được thiết lập.</p>
            <p className="text-xs text-gray-400 mt-1">Vui lòng cập nhật VITE_MAPBOX_TOKEN trong file .env</p>
          </div>
        )}
        {!readOnly && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] text-gray-500 shadow-sm border border-gray-100 pointer-events-none">
            Mẹo: Kéo thả ghim hoặc click trực tiếp lên bản đồ để chọn vị trí chính xác.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">Vĩ độ (Latitude)</label>
          <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono text-gray-600 border border-gray-100">
            {lat || 'Chưa có'}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">Kinh độ (Longitude)</label>
          <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono text-gray-600 border border-gray-100">
            {lng || 'Chưa có'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
