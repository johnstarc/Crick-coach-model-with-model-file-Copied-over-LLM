package com.cricketcoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OllamaRequest {
    private String model;
    private String prompt;
    private boolean stream;
}
