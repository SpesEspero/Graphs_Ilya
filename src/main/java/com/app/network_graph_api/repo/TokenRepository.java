package com.app.network_graph_api.repo;

import com.app.network_graph_api.model.db.TokenDto;
import org.springframework.data.repository.CrudRepository;

public interface TokenRepository extends CrudRepository<TokenDto, Integer> {
}
