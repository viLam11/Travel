import apiClient from './apiClient';


class ProvinceService {

    async getProvinces(): Promise<string[]> {
        north = ['Hà Nội', 'Quảng Ninh', 'Lào Cai', 'Hưng Yên', 'Bắc Ninh'];
        central = ['Đà Nẵng', 'Huế', 'Lâm Đồng', 'Đắk Lắk'];
        south = ['Hồ Chí Minh', 'Phú Quốc', 'Cần Thơ', 'Tây Ninh'];


        return [
            "Province A",
            "Province B",
            "Province C",
            "Province D",
        ];
    }

 }

export const provinceService = new ProvinceService();