package com.app.network_graph_api.controller.aop;

import com.app.network_graph_api.exception.UnauthorizedException;
import com.app.network_graph_api.model.db.TokenDto;
import com.app.network_graph_api.model.db.UserDto;
import com.app.network_graph_api.repo.TokenRepository;
import com.app.network_graph_api.service.AuthService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Set;

@Aspect
@Component
public class AuthorizedAspect {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private AuthService authService;

    @Around("@annotation(com.app.network_graph_api.controller.aop.Authorized)")
    public Object validate(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String token = proceedingJoinPoint.getArgs()[0].toString();
        if (!authService.authorized(token)) {
            throw new UnauthorizedException("Not authorized");
        }

        UserDto user = authService.findTokenUser(token);
        if (user == null) {
            throw new UnauthorizedException("Not authorized");
        }

        boolean validToken = user.getTokens().stream()
                .anyMatch(t -> t.getValid() && token.equals(t.getToken()));
        if (!validToken) {
            throw new UnauthorizedException("Not authorized");
        }

        return proceedingJoinPoint.proceed();
    }
}
