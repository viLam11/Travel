package com.travollo.Travel.domains.ai.service;

import com.google.genai.Client;
import com.google.genai.types.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

@Service
@Slf4j
public class GeminiService {
//    public  String getAnwser(String prompt, Integer numberOfDayTríps, List<Object> preferenceList) {
//        Client client = new Client();
//        Schema stringType = Schema.builder()
//                .type(Type.Known.STRING)
//                .build();
//        Schema stringArrayType = Schema.builder()
//                .type(Type.Known.ARRAY)
//                .items(stringType)
//                .build();
//
//        Schema activitySchema = Schema.builder()
//                // 1. Phân loại nguồn
//                .type(Type.Known.OBJECT)
//                .properties(new HashMap<String, Schema>() {{
//                    put("name", stringType);
//                    put("description", stringType);
//                    put("location", stringType);
//                    put("duration", stringType);
//                    put("estimated_cost", stringType);
//                }})
//                .required(Arrays.asList("name", "description")) // Bắt buộc AI phải trả về trường này
//                .build();
//
//        Schema activityArraySchema = Schema.builder()
//                .type(Type.Known.ARRAY)
//                .items(activitySchema)
//                .build();
//
//        Schema daySchema = Schema.builder()
//                .type(Type.Known.OBJECT)
//                .properties(new HashMap<String, Schema>() {{
//                    put("day_label", stringType);
//                    put("morning_activities", activityArraySchema);
//                    put("afternoon_activities", activityArraySchema);
//                    put("evening_activities", activityArraySchema);
//                }})
//                .required(Arrays.asList("day_label", "morning_activities", "afternoon_activities", "evening_activities"))
//                .build();
//
//        Schema rootSchema = Schema.builder()
//                .type(Type.Known.OBJECT)
//                .properties(new HashMap<String, Schema>() {{
//                    put("trip_title", stringType); // Tên chuyến đi tổng quan
//                    put("total_estimated_cost", stringType); // Tổng chi phí dự kiến
//                    put("itinerary", Schema.builder()
//                            .type(Type.Known.ARRAY)
//                            .items(daySchema)
//                            .minItems((long) numberOfDayTríps)
//                            .maxItems((long) numberOfDayTríps)
//                            .build());
//                }})
//                .required(Arrays.asList("itinerary"))
//                .build();
//
//        List<SafetySetting> safetySettings = Arrays.asList(
//                SafetySetting.builder()
//                        .category(HarmCategory.Known.HARM_CATEGORY_HATE_SPEECH)
//                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
//                        .build(),
//                SafetySetting.builder()
//                        .category(HarmCategory.Known.HARM_CATEGORY_SEXUALLY_EXPLICIT)
//                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
//                        .build(),
//                SafetySetting.builder()
//                        .category(HarmCategory.Known.HARM_CATEGORY_HARASSMENT)
//                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
//                        .build(),
//                SafetySetting.builder()
//                        .category(HarmCategory.Known.HARM_CATEGORY_DANGEROUS_CONTENT)
//                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
//                        .build()
//        );
//
//        GenerateContentConfig config = GenerateContentConfig.builder()
//                .responseMimeType("application/json")
//                .responseSchema(rootSchema)
//                .safetySettings(safetySettings)
//                .build();
//
//        GenerateContentResponse response = client.models.generateContent(
//                "gemini-3-flash-preview",
//                prompt,
//                config
//        );
//
//        if (response.text() != null) {
//            log.info("Thành công: {}", response.text());
//            return response.text();
//        } else {
//            log.error("Gemini trả về NULL. Chi tiết response: {}", response.toString());
//
//            if (response.candidates() != null && !response.candidates().isEmpty()) {
//                log.error("Lý do dừng (Finish Reason): " + response);
//            }
//
//            return "{}";
//        }
//    }


    public String getAnwser(String prompt, Integer numberOfDayTrips, List<Object> preferenceList) {
        Client client = new Client();

        // 1. Định nghĩa các kiểu dữ liệu cơ bản
        Schema stringType = Schema.builder().type(Type.Known.STRING).build();
        // Trong JSON Schema, kiểu số nguyên (cả int và long) đều dùng INTEGER
        Schema integerType = Schema.builder().type(Type.Known.INTEGER).build();
        Schema booleanType = Schema.builder().type(Type.Known.BOOLEAN).build();

        // 2. Định nghĩa cấu trúc cho 1 Hoạt động (Activity)
        Schema activitySchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(new HashMap<>() {{
                    put("timeOfDay", stringType);
                    put("activityTitle", stringType);
                    put("description", stringType);
                    put("isSystemService", booleanType);
                    put("serviceId", integerType); // Để cho phép null, ta sẽ KHÔNG đưa nó vào danh sách required
                    put("estimatedPrice", integerType);
                    put("actualPrice", integerType);
                    put("currency", stringType);
                }})
                // Bắt buộc tất cả các trường NGOẠI TRỪ serviceId (vì nếu không phải service hệ thống thì nó sẽ null/không có)
                .required(Arrays.asList("timeOfDay", "activityTitle", "description", "isSystemService", "estimatedPrice", "actualPrice", "currency"))
                .build();

        Schema activityArraySchema = Schema.builder()
                .type(Type.Known.ARRAY)
                .items(activitySchema)
                .build();

        // 3. Định nghĩa cấu trúc cho 1 Ngày (Day)
        Schema daySchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(new HashMap<>() {{
                    put("day", integerType);
                    put("activities", activityArraySchema); // Gom chung thành 1 mảng activities
                }})
                .required(Arrays.asList("day", "activities"))
                .build();

        // 4. Định nghĩa cấu trúc Root (Ngoài cùng)
        Schema rootSchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(new HashMap<>() {{
                    put("tripTitle", stringType);
                    put("overview", stringType);
                    put("totalEstimatedBudget", integerType);
                    put("itinerary", Schema.builder()
                            .type(Type.Known.ARRAY)
                            .items(daySchema)
                            .minItems((long) numberOfDayTrips)
                            .maxItems((long) numberOfDayTrips)
                            .build());
                }})
                .required(Arrays.asList("tripTitle", "overview", "totalEstimatedBudget", "itinerary"))
                .build();

        List<SafetySetting> safetySettings = Arrays.asList(
                SafetySetting.builder()
                        .category(HarmCategory.Known.HARM_CATEGORY_HATE_SPEECH)
                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
                        .build(),
                SafetySetting.builder()
                        .category(HarmCategory.Known.HARM_CATEGORY_SEXUALLY_EXPLICIT)
                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
                        .build(),
                SafetySetting.builder()
                        .category(HarmCategory.Known.HARM_CATEGORY_HARASSMENT)
                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
                        .build(),
                SafetySetting.builder()
                        .category(HarmCategory.Known.HARM_CATEGORY_DANGEROUS_CONTENT)
                        .threshold(HarmBlockThreshold.Known.BLOCK_NONE)
                        .build()
        );


        GenerateContentConfig config = GenerateContentConfig.builder()
                .responseMimeType("application/json")
                .responseSchema(rootSchema)
                .safetySettings(safetySettings)
                .build();

        GenerateContentResponse response = client.models.generateContent(
                "gemini-2.5-flash",
                prompt,
                config
        );

        if (response.text() != null) {
            log.info("Thành công: {}", response.text());
            return response.text();
        } else {
            log.error("Gemini trả về NULL. Chi tiết response: {}", response);

            if (response.candidates().isPresent() && response.candidates().isPresent()) {
                log.error("Lý do dừng (Finish Reason): {}", response);
            }

            return "{}";
        }
    }
}
