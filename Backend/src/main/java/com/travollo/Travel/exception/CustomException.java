package com.travollo.Travel.exception;

import org.springframework.http.HttpStatus;

public class CustomException extends RuntimeException{

        private HttpStatus status;
        private String message;
        private Long timestamp;

        public CustomException(HttpStatus status, String message) {
            super(message);
            this.status = status;
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public Long getTimestamp() {
            return timestamp;
        }
        public HttpStatus getStatus() {
            return status;
        }
        public String getMessage() {
            return message;
        }

        public void setStatus(HttpStatus status) {
            this.status = status;
        }
        public void setMessage(String message) {
            this.message = message;
        }
        public void setTimestamp(Long timestamp) {
            this.timestamp = timestamp;
        }

        @Override
        public String toString() {
            return "CustomException{" +
                    "status=" + status +
                    ", message='" + message + '\'' +
                    ", timestamp=" + timestamp +
                    '}';
        }

    }

