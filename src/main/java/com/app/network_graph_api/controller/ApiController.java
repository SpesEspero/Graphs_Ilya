package com.app.network_graph_api.controller;

import com.app.network_graph_api.model.api.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public abstract class ApiController {

    public static <T> ResponseEntity<T> ok(T rs) {
        return new ResponseEntity<>(rs, HttpStatus.OK);
    }

    public static <T> ResponseEntity<T> error(T rs, int code) {
        return new ResponseEntity<>(rs, HttpStatus.valueOf(code));
    }

    public static <T extends ApiResponse> ResponseEntity<T> decide(T rs) {
        if (rs.isSuccessful()) {
            return ok(rs);
        } else {
            if (rs.getErrors().isEmpty()) {
                return new ResponseEntity<>(rs, HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                return new ResponseEntity<>(rs, HttpStatus.valueOf(rs.getErrors().get(0).getCode()));
            }
        }
    }
}
