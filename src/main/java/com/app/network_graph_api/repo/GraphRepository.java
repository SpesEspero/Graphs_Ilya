package com.app.network_graph_api.repo;

import com.app.network_graph_api.model.db.GraphDto;
import org.springframework.data.repository.CrudRepository;

public interface GraphRepository extends CrudRepository<GraphDto, Integer> {
}
