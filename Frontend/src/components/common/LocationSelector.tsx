import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/services/apiClient';
import { MapPin, ChevronDown, Check, X } from 'lucide-react';

interface Province {
    code: string;
    name: string;
    codename: string;
}

interface LocationSelectorProps {
    selectedCode?: string;
    onSelect: (code: string, name: string) => void;
    className?: string;
    selectClassName?: string;
    placeholder?: string;
    showIcon?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
    selectedCode,
    onSelect,
    className = '',
    selectClassName = '',
    placeholder = 'Chọn địa điểm...',
    showIcon = true
}) => {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res: any = await apiClient.provinces.getAll();
                if (Array.isArray(res)) {
                    setProvinces(res.sort((a: any, b: any) => a.name.localeCompare(b.name)));
                }
            } catch (error) {
                console.error("Failed to load locations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProvinces();
    }, []);

    // Sync input with selectedCode
    useEffect(() => {
        if (provinces.length > 0) {
            const selected = provinces.find(p => p.code === selectedCode);
            if (selected) {
                setSearchTerm(selected.name);
            } else if (!selectedCode) {
                setSearchTerm('');
            }
        }
    }, [selectedCode, provinces]);

    // Click outside handling
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert text to selected if closed without selection
                const selected = provinces.find(p => p.code === selectedCode);
                // Only revert if we have a valid selection logic, or Keep what user typed? 
                // Better UX: if invalid text, revert. For now, valid text is simpler.
                if (selected) setSearchTerm(selected.name);
                else if (!selectedCode) setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedCode, provinces]);

    // Filter logic
    const filteredProvinces = provinces.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (province: Province) => {
        setSearchTerm(province.name);
        onSelect(province.code, province.name);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {showIcon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <MapPin className="h-5 w-5 text-gray-400" />
                </div>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={loading ? 'Đang tải...' : placeholder}
                    disabled={loading}
                    className={`block w-full py-2.5 text-base sm:text-sm rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                        ${showIcon ? 'pl-10' : 'pl-3'} pr-10 
                        ${selectClassName || 'border border-gray-300 bg-white hover:border-gray-400'}
                    `}
                />

                <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProvinces.length > 0 ? (
                        filteredProvinces.map((province) => (
                            <div
                                key={province.code}
                                onClick={() => handleSelect(province)}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-orange-50 flex items-center justify-between
                                    ${selectedCode === province.code ? 'bg-orange-50 text-orange-600' : 'text-gray-700'}
                                `}
                            >
                                <span>{province.name}</span>
                                {selectedCode === province.code && (
                                    <Check className="h-4 w-4" />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Không tìm thấy kết quả
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationSelector;
