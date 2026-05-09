import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Search, Layers } from 'lucide-react';
import { Button } from '@/components/ui/admin/button';
import { toast } from 'sonner';

interface MapPickerProps {
  lat?: string | number;
  lng?: string | number;
  onChange: (lat: string, lng: string) => void;
  address?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange, address }) => {
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

    const initialLat = lat ? Number(lat) : 10.762622; // Default to Saigon if not provided
    const initialLng = lng ? Number(lng) : 106.660172;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: `mapbox://styles/mapbox/${currentStyle}`,
      center: [initialLng, initialLat],
      zoom: lat && lng ? 15 : 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#4F46E5', // Indigo-600
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current!.getLngLat();
      onChange(lngLat.lat.toString(), lngLat.lng.toString());
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.current!.setLngLat([lng, lat]);
      onChange(lat.toString(), lng.toString());
    });

    map.current.on('load', () => {
      setIsMapReady(true);
    });

    return () => {
      map.current?.remove();
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

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1&country=vn`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [newLng, newLat] = data.features[0].center;
        
        map.current?.flyTo({
          center: [newLng, newLat],
          zoom: 16,
          essential: true
        });

        marker.current?.setLngLat([newLng, newLat]);
        onChange(newLat.toString(), newLng.toString());
        toast.success('Đã tìm thấy vị trí dựa trên địa chỉ!');
      } else {
        toast.error('Không tìm thấy tọa độ cho địa chỉ này. Bạn có thể tự ghim trên bản đồ.');
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
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] text-gray-500 shadow-sm border border-gray-100 pointer-events-none">
          Mẹo: Kéo thả ghim hoặc click trực tiếp lên bản đồ để chọn vị trí chính xác.
        </div>
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
