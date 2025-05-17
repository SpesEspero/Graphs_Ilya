package com.app.network_graph_api.repo;

import com.app.network_graph_api.model.db.UserDto;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<UserDto, Integer> {

    UserDto findByLogin(String login);
}
