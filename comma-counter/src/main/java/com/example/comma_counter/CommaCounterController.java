package com.example.comma_counter;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CommaCounterController {

    @CrossOrigin(origins = "*") 
    @GetMapping("/count-commas")
    public ResponseEntity<?> getText(@RequestParam(value = "text", defaultValue = "") String text) {
        if (text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Text input cannot be empty."));
        }

        long commaCount = text.chars().filter(ch -> ch == ',').count();

        return ResponseEntity.ok(new CommaCountResponse(commaCount));
    }

    // Error response format
    static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    // Success response format
    static class CommaCountResponse {
        private long commaCount;

        public CommaCountResponse(long commaCount) {
            this.commaCount = commaCount;
        }

        public long getCommaCount() {
            return commaCount;
        }

        public void setCommaCount(long commaCount) {
            this.commaCount = commaCount;
        }
    }
}
