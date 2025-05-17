package com.app.network_graph_api.controller.aop;

import com.app.network_graph_api.controller.AuthController;
import com.app.network_graph_api.exception.NotFoundException;
import com.app.network_graph_api.exception.UnauthorizedException;
import com.app.network_graph_api.model.api.ApiResponse;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import static com.app.network_graph_api.controller.ApiController.decide;
import static com.app.network_graph_api.model.api.ApiResponse.errorRs;
import static com.app.network_graph_api.model.api.Error.error;
import static com.app.network_graph_api.model.api.Error.internalError;

@RestControllerAdvice
@Hidden
public class GlobalControllerExceptionHandler {
    Logger logger = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse> errorHandler(HttpServletRequest req, Exception e) {
        logger.error(e.getMessage(), e);

        if (e instanceof UnauthorizedException) {
            return decide(errorRs(ApiResponse.class, error(e.getMessage(), HttpStatus.UNAUTHORIZED.value())));
        } else if (e instanceof NotFoundException) {
            return decide(errorRs(ApiResponse.class, error(e.getMessage(), HttpStatus.NOT_FOUND.value())));
        }

        return decide(errorRs(ApiResponse.class, internalError(e.getMessage())));
    }
}
