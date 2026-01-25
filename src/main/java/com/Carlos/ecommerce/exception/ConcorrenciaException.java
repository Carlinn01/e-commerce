package com.Carlos.ecommerce.exception;

public class ConcorrenciaException extends RuntimeException {
    public ConcorrenciaException(String message) {
        super(message);
    }

    public ConcorrenciaException(String message, Throwable cause) {
        super(message, cause);
    }
}
