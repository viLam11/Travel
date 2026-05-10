import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ServiceMapProps {
  lat?: number | string;
  lng?: number | string;
  serviceName: string;
  address?: string;
  height?: string;
}

const ServiceMap: React.FC<ServiceMapProps> = ({ lat, lng, serviceName, address, height = "400px" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(!!(lat && lng));
  const [error, setError] = useState<string | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainer.current) return;

    const initializeMap = async () => {
      mapboxgl.accessToken = token;

      let finalLat = lat ? Number(lat) : null;
      let finalLng = lng ? Number(lng) : null;

      // Nếu không có tọa độ, thử geocode từ địa chỉ
      if ((!finalLat || !finalLng) && address) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1&country=vn`
          );
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            [finalLng, finalLat] = data.features[0].center;
            setIsConfirmed(false);
          } else {
            setError("Không tìm thấy vị trí từ địa chỉ này.");
            return;
          }
        } catch (err) {
          setError("Lỗi khi tải bản đồ.");
          return;
        }
      }

      if (!finalLat || !finalLng) {
         setError("Chưa có thông tin vị trí.");
         return;
      }

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [finalLng, finalLat],
        zoom: 15,
        pitch: 45,
        antialias: true
      });

      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

      // Custom Marker
      const el = document.createElement('div');
      const markerColor = isConfirmed ? '#f97316' : '#94a3b8'; // Orange vs Slate-400
      el.innerHTML = `
        <div class="relative">
          ${isConfirmed ? `<div class="absolute -translate-x-1/2 -translate-y-1/2 bg-orange-500 w-10 h-10 rounded-full opacity-20 animate-ping"></div>` : ''}
          <div class="relative bg-white p-2 rounded-full shadow-xl border-2 transition-transform hover:scale-110 cursor-pointer" style="border-color: ${markerColor}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${markerColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([finalLng, finalLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div class="p-2 font-sans"><p class="font-bold text-gray-900">${serviceName}</p><p class="text-xs text-gray-500 mt-1">${address || ''}</p></div>`)
        )
        .addTo(map.current);

      const resizer = new ResizeObserver(() => map.current?.resize());
      resizer.observe(mapContainer.current!);
    };

    initializeMap();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [lat, lng, address, token]);

  if (!token) return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 gap-2" style={{ height }}>
        <MapPin className="w-8 h-8 text-gray-300" />
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl shadow-sm border border-gray-100">
      <div ref={mapContainer} style={{ height, width: '100%' }} />
      
      {/* Badge Trạng thái */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-white/20 transition-transform group-hover:translate-y-[-2px] flex items-center gap-2 w-fit">
          <div className={`p-1.5 rounded-lg ${isConfirmed ? 'bg-orange-50' : 'bg-slate-50'}`}>
            <MapPin className={`w-4 h-4 ${isConfirmed ? 'text-orange-500' : 'text-slate-500'}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-none">Vị trí thực tế</p>
            <div className="flex items-center gap-1 mt-1">
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                  <p className="text-[10px] text-green-600 font-medium leading-none">Đã xác minh</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                  <p className="text-[10px] text-amber-600 font-medium leading-none">Ước tính từ địa chỉ</p>
                </>
              )}
            </div>
          </div>
        </div>

        {!isConfirmed && (
          <div className="bg-amber-50/95 backdrop-blur-md px-3 py-2 rounded-lg border border-amber-100 shadow-sm max-w-[280px]">
            <p className="text-[10px] text-amber-700 leading-tight">
              <span className="font-bold">Lưu ý:</span> Tọa độ này được ước tính từ địa chỉ và chưa được sự xác nhận từ chủ dịch vụ nên có khi sẽ không chính xác tuyệt đối.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMap;
