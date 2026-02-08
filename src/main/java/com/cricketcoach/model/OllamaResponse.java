package com.cricketcoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OllamaResponse {
    private String model;
    private String response;
    private boolean done;
}
