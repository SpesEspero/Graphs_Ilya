package com.app.network_graph_api.model.api;

import java.util.ArrayList;
import java.util.List;

public class ApiResponse {
    private boolean successful;
    private List<Error> errors = new ArrayList<>();

    public static <T extends ApiResponse> T errorRs(Class<T> clazz, Error error) {
        try {
            T instance = clazz.getDeclaredConstructor().newInstance();
            instance.setSuccessful(false);
            instance.getErrors().add(error);
            return instance;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static <T extends ApiResponse> T successRs(Class<T> clazz) {
        try {
            T instance = clazz.getDeclaredConstructor().newInstance();
            instance.setSuccessful(true);
            return instance;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public List<Error> getErrors() {
        return errors;
    }

    public void setErrors(List<Error> errors) {
        this.errors = errors;
    }
}
