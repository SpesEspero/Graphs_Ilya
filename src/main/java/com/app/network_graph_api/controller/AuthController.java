package com.app.network_graph_api.controller;

import com.app.network_graph_api.controller.aop.Authorized;
import com.app.network_graph_api.model.api.*;
import com.app.network_graph_api.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController extends ApiController {
    Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;


    @PostMapping("/sign-up")
    public ResponseEntity<SignUpRs> signUp(@RequestBody SignUpRq rq) {
        logger.info("/sign-up endpoint called");
        SignUpRs rs = authService.signUp(rq);
        return decide(rs);
    }

    @PostMapping("/sign-in")
    public ResponseEntity<SignInRs> signIn(@RequestBody SignInRq rq) {
        logger.info("/sign-in endpoint called");
        SignInRs rs = authService.signIn(rq);
        return decide(rs);
    }

    @GetMapping("/sign-out")
    @Authorized
    public ResponseEntity<SignOutRs> signOut(@RequestParam String token) {
        logger.info("/sign-out endpoint called");
        SignOutRs rs = authService.signOut(token);
        return decide(rs);
    }
}
