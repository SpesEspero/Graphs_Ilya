package com.app.network_graph_api.model.api;

public class Error {
    private String message;
    private Integer code;

    public static Error error(String message, Integer code) {
        Error error = new Error();
        error.setCode(code);
        error.setMessage(message);
        return error;
    }

    public static Error internalError(String message) {
        Error error = new Error();
        error.setCode(500);
        error.setMessage(message);
        return error;
    }

    public static Error internalError() {
        Error error = new Error();
        error.setCode(500);
        error.setMessage("Internal server error");
        return error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }
}
