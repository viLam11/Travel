package com.travollo.Travel.domains.ai.service;

import com.google.genai.Client;
import com.google.genai.types.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {
    public  String getAnwser(String prompt, Integer numberOfDayTríps, List<Object> preferenceList) {
        Client client = new Client();
        Schema stringType = Schema.builder()
                .type(Type.Known.STRING)
                .build();
        Schema stringArrayType = Schema.builder()
                .type(Type.Known.ARRAY)
                .items(stringType)
                .build();

        Schema activitySchema = Schema.builder()
                // 1. Phân loại nguồn
                .type(Type.Known.OBJECT)
                .properties(new HashMap<String, Schema>() {{
                    put("name", stringType);
                    put("description", stringType);
                    put("location", stringType);
                    put("duration", stringType);
                    put("estimated_cost", stringType);
                }})
                .required(Arrays.asList("name", "description")) // Bắt buộc AI phải trả về trường này
                .build();

        Schema activityArraySchema = Schema.builder()
                .type(Type.Known.ARRAY)
                .items(activitySchema)
                .build();

        Schema daySchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(new HashMap<String, Schema>() {{
                    put("day_label", stringType);
                    put("morning_activities", activityArraySchema);
                    put("afternoon_activities", activityArraySchema);
                    put("evening_activities", activityArraySchema);
                }})
                .required(Arrays.asList("day_label", "morning_activities", "afternoon_activities", "evening_activities"))
                .build();

        Schema rootSchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(new HashMap<String, Schema>() {{
                    put("trip_title", stringType); // Tên chuyến đi tổng quan
                    put("total_estimated_cost", stringType); // Tổng chi phí dự kiến
                    put("itinerary", Schema.builder()
                            .type(Type.Known.ARRAY)
                            .items(daySchema)
                            .minItems((long) numberOfDayTríps)
                            .maxItems((long) numberOfDayTríps)
                            .build());
                }})
                .required(Arrays.asList("itinerary"))
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
                "gemini-3-flash-preview",
                prompt,
                config
        );

        if (response.text() != null) {
            log.info("Thành công: {}", response.text());
            return response.text();
        } else {
            log.error("Gemini trả về NULL. Chi tiết response: {}", response.toString());

            if (response.candidates() != null && !response.candidates().isEmpty()) {
                log.error("Lý do dừng (Finish Reason): " + response);
            }

            return "{}";
        }
    }
}
