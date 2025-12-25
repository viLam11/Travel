package com.travollo.Travel.dto.services;
import com.travollo.Travel.utils.ServiceType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.sql.Time;

@Data
@Schema(name = "ServiceCreateRequest", description = "Th ông tindịch vụ mới", example = "{\n" +
        "  \"serviceName\": \"Tour Hạ Long\",\n" +
        "  \"description\": \"Tour 3 ngày 2 đêm khám phá Hạ Long\",\n" +
        "  \"provinceCode\": \"01\",\n" +
        "  \"address\": \"123 Đường Láng, Hà Nội\",\n" +
        "  \"contactNumber\": \"0123456789\",\n" +
        "  \"averagePrice\": 2000000,\n" +
        "  \"tags\": \"tour,halong\",\n" +
        "  \"serviceType\": \"TOUR\",\n" +
        "  \"startTime\": \"08:00:00\",\n" +
        "  \"endTime\": \"18:00:00\",\n" +
        "  \"openTime\": \"08:00:00\",\n" +
        "  \"closeTime\": \"22:00:00\",\n" +
        "  \"workingDays\": \"Mon-Fri\"\n" +
        "}")
public class ServiceCreateRequest {

    @Schema(description = "Tên dịch vụ", example = "Tour Hạ Long")
    private String serviceName;

    @Schema(description = "Mô tả dịch vụ", example = "Tour 3 ngày 2 đêm khám phá Hạ Long")
    private String description;

    @Schema(description = "Mã tỉnh", example = "01")
    private String provinceCode;

    @Schema(description = "Địa chỉ chi tiết", example = "123 Đường Láng, Hà Nội")
    private String address;

    @Schema(description = "Số điện thoại liên hệ", example = "0123456789")
    private String contactNumber;

    @Schema(description = "Giá trung bình", example = "2000000")
    private Long averagePrice;

    @Schema(description = "Các tag liên quan", example = "tour,halong")
    private String tags;

    @Schema(description = "Loại dịch vụ", example = "TICKET_VENUE")
    private String serviceType;

    // TICKET_VENUE
    @Schema(description = "Thời gian mở cửa", example = "07:00:00")
    private Time startTime;
    @Schema(description = "Thời gian đóng cửa", example = "17:00:00")
    private Time endTime;

    // RESTAURANT
    @Schema(description = "Thời gian mở cửa", example = "08:00:00")
    private Time openTime;
    @Schema(description = "Thời gian đóng cửa", example = "22:00:00")
    private Time closeTime;
    @Schema(description = "Ngày làm việc", example = "Mon-Fri")
    private String workingDays;
}
