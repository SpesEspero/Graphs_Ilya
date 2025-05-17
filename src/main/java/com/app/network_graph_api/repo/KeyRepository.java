package com.app.network_graph_api.repo;

import com.app.network_graph_api.model.db.KeyDto;
import org.springframework.data.repository.CrudRepository;

public interface KeyRepository extends CrudRepository<KeyDto, Integer> {
}
