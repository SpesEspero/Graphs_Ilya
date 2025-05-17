package com.app.network_graph_api.service;

import com.app.network_graph_api.exception.UnauthorizedException;
import com.app.network_graph_api.model.db.KeyDto;
import com.app.network_graph_api.model.db.UserDto;
import com.app.network_graph_api.repo.KeyRepository;
import com.app.network_graph_api.repo.TokenRepository;
import com.app.network_graph_api.repo.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;

import javax.crypto.SecretKey;

public abstract class AuthorizedService {

    protected final KeyRepository keyRepository;
    protected final UserRepository userRepository;
    protected final TokenRepository tokenRepository;

    protected AuthorizedService(KeyRepository keyRepository, UserRepository userRepository, TokenRepository tokenRepository) {
        this.keyRepository = keyRepository;
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
    }

    public UserDto findTokenUser(String token) {
        String userId = tokenUserId(token);
        if (userId == null) {
            throw new UnauthorizedException("Invalid token");
        }

        UserDto userDto = userRepository.findById(Integer.valueOf(userId)).orElse(null);
        if (userDto == null) {
            throw new UnauthorizedException("Invalid token");
        }

        return userDto;
    }


    @Transactional
    public SecretKey findSecretKey() {
        Iterable<KeyDto> keyDtoList = keyRepository.findAll();
        if (!keyDtoList.iterator().hasNext()) {
            SecretKey key = Jwts.SIG.HS512.key().build();
            String encodedKey = Encoders.BASE64.encode(key.getEncoded());
            KeyDto keyDto = new KeyDto();
            keyDto.setBase64Key(encodedKey);
            keyRepository.save(keyDto);
            return key;
        }

        KeyDto keyDto = keyDtoList.iterator().next();
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(keyDto.getBase64Key()));
    }

    public boolean verifyToken(String token) {
        SecretKey key = findSecretKey();
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getId();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String tokenUserId(String token) {
        SecretKey key = findSecretKey();
        try {
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getId();
        } catch (Exception e) {
            return null;
        }
    }


}
