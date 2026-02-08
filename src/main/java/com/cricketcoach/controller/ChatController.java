package com.cricketcoach.controller;

import com.cricketcoach.model.ChatRequest;
import com.cricketcoach.model.ChatResponse;
import com.cricketcoach.service.OllamaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final OllamaService ollamaService;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@RequestBody ChatRequest request) {
        return ollamaService.chat(request.getMessage());
    }

    @PostMapping("/sync")
    public ChatResponse chatSync(@RequestBody ChatRequest request) {
        String response = ollamaService.chatSync(request.getMessage());
        return new ChatResponse(response);
    }
}
