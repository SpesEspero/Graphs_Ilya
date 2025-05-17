package com.app.network_graph_api.service;

import com.app.network_graph_api.exception.InternalServerException;
import com.app.network_graph_api.exception.UnauthorizedException;
import com.app.network_graph_api.model.api.*;
import com.app.network_graph_api.model.db.KeyDto;
import com.app.network_graph_api.model.db.TokenDto;
import com.app.network_graph_api.model.db.UserDto;
import com.app.network_graph_api.repo.KeyRepository;
import com.app.network_graph_api.repo.TokenRepository;
import com.app.network_graph_api.repo.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;

import static com.app.network_graph_api.model.api.ApiResponse.successRs;

@Service
public class AuthService extends AuthorizedService {
    Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final PasswordEncoder passwordEncoder;

    public AuthService(@Autowired UserRepository userRepository,
                       @Autowired KeyRepository keyRepository,
                       @Autowired TokenRepository tokenRepository,
                       @Autowired PasswordEncoder passwordEncoder) {
        super(keyRepository, userRepository, tokenRepository);
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional
    public SignUpRs signUp(SignUpRq rq) {
        UserDto user = new UserDto();
        user.setLogin(rq.getLogin());
        user.setName(rq.getName());
        user.setPasswordHash(passwordEncoder.encode(rq.getPassword()));
        user.setStatus(0);

        UserDto existingUser = userRepository.findByLogin(user.getLogin());
        if (existingUser != null) {
            throw new InternalServerException("User already exists");
        }

        try {
            userRepository.save(user);

            SignUpRs rs = new SignUpRs();
            rs.setSuccessful(true);
            rs.setLogin(rq.getLogin());
            rs.setName(rq.getName());
            return rs;
        } catch (Exception e) {
            logger.error("Saving user in db failed", e);
            throw new InternalServerException("DB error");
        }
    }

    @Transactional
    public SignInRs signIn(SignInRq rq) {
        try {
            UserDto user = userRepository.findByLogin(rq.getLogin());
            if (user == null) {
                logger.error("Sing In error: user not found");
                throw new UnauthorizedException("Invalid login");
            }

            boolean isPasswordCorrect = passwordEncoder.matches(rq.getPassword(), user.getPasswordHash());
            if (!isPasswordCorrect) {
                logger.error("Sing In error: incorrect password");
                throw new UnauthorizedException("Invalid login");
            }

            String token = buildToken(user);
            TokenDto tokenDto = new TokenDto();
            tokenDto.setToken(token);
            tokenDto.setValid(true);
            tokenDto.setUser(user);
            tokenRepository.save(tokenDto);

            SignInRs rs = new SignInRs();
            rs.setSuccessful(true);
            rs.setToken(token);
            return rs;
        } catch (Exception e) {
            logger.error("Sing In error", e);
            throw new UnauthorizedException("Sing In error");
        }
    }

    @Transactional
    public SignOutRs signOut(String token) {
        UserDto user = findTokenUser(token);

        TokenDto tokenDto = user.getTokens().stream()
                .filter(t -> token.equals(t.getToken()))
                .findFirst()
                .orElseThrow();

        tokenDto.setValid(false);
        tokenRepository.save(tokenDto);

        return successRs(SignOutRs.class);
    }

    public boolean authorized(String token) {
        return verifyToken(token);
    }

    private String buildToken(UserDto user) {
        SecretKey key = findSecretKey();

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime utcExpiration = now.plusMinutes(30);
        Date expiration = Date.from(utcExpiration.toInstant());

        return Jwts.builder()
                .header()
                .add("name", user.getName())
                .and()
                .id(user.getId().toString())
                .subject(user.getLogin())
                .expiration(expiration)
                .signWith(key)
                .compact();
    }
}
