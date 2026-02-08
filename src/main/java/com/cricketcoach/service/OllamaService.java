package com.cricketcoach.service;

import com.cricketcoach.model.OllamaRequest;
import com.cricketcoach.model.OllamaResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Slf4j
@Service
public class OllamaService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ollama.model}")
    private String modelName;

    public OllamaService(@Value("${ollama.base-url:http://localhost:11434}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public Flux<String> chat(String message) {
        OllamaRequest request = OllamaRequest.builder()
                .model(modelName)
                .prompt(message)
                .stream(true)
                .build();

        return webClient.post()
                .uri("/api/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractResponse)
                .filter(response -> !response.isEmpty())
                .onErrorResume(e -> {
                    log.error("Error communicating with Ollama: {}", e.getMessage());
                    return Flux.just("Sorry, I'm having trouble connecting. Please ensure Ollama is running with the cricket-coach model.");
                });
    }

    public String chatSync(String message) {
        OllamaRequest request = OllamaRequest.builder()
                .model(modelName)
                .prompt(message)
                .stream(false)
                .build();

        try {
            OllamaResponse response = webClient.post()
                    .uri("/api/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OllamaResponse.class)
                    .block();

            return response != null ? response.getResponse() : "No response received.";
        } catch (Exception e) {
            log.error("Error communicating with Ollama: {}", e.getMessage());
            return "Sorry, I'm having trouble connecting. Please ensure Ollama is running with the cricket-coach model.";
        }
    }

    private String extractResponse(String json) {
        try {
            // Log the raw JSON for debugging (only in trace level)
            log.trace("Processing Ollama response chunk: {}", json);

            OllamaResponse response = objectMapper.readValue(json, OllamaResponse.class);
            String responseText = response.getResponse();

            // Log successful extraction
            if (responseText != null && !responseText.isEmpty()) {
                log.trace("Extracted response chunk: '{}'", responseText);
            }

            return responseText != null ? responseText : "";
        } catch (Exception e) {
            log.warn("Failed to parse Ollama response chunk: {} - Error: {}", json, e.getMessage());
            return "";
        }
    }
}
