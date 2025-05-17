package com.app.network_graph_api.service;

import com.app.network_graph_api.exception.NotFoundException;
import com.app.network_graph_api.model.api.*;
import com.app.network_graph_api.model.db.GraphDto;
import com.app.network_graph_api.model.db.UserDto;
import com.app.network_graph_api.repo.GraphRepository;
import com.app.network_graph_api.repo.KeyRepository;
import com.app.network_graph_api.repo.TokenRepository;
import com.app.network_graph_api.repo.UserRepository;
import com.app.network_graph_api.utils.GsonUtils;
import com.app.network_graph_api.utils.NetworkGraphUtils;
import com.app.network_graph_api.utils.ShortestPathAlgorithm;
import com.google.gson.Gson;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GraphService extends AuthorizedService {

    private final GraphRepository graphRepository;

    public GraphService(@Autowired KeyRepository keyRepository,
                        @Autowired UserRepository userRepository,
                        @Autowired TokenRepository tokenRepository,
                        @Autowired GraphRepository graphRepository) {
        super(keyRepository, userRepository, tokenRepository);
        this.graphRepository = graphRepository;
    }

    @Transactional
    public GraphRs createGraph(String token, GraphRq rq) {
        NetworkGraph graph = NetworkGraphUtils.buildGraph(rq.getNetworkNodes());

        Gson gson = GsonUtils.gson();
        String graphJson = gson.toJson(graph);

        GraphDto graphDto = new GraphDto();
        graphDto.setJson(graphJson);
        graphDto.setUser(findTokenUser(token));

        graphRepository.save(graphDto);

        GraphRs rs = new GraphRs();
        rs.setGraph(graph);
        rs.setSuccessful(true);
        rs.setId(graphDto.getId());
        return rs;
    }

    public GraphListRs userGraphList(String token) {
        UserDto user = findTokenUser(token);

        Map<Integer, NetworkGraph> graphMap = new HashMap<>();
        Gson gson = GsonUtils.gson();
        for (GraphDto graphDto : user.getGraphs()) {
            graphMap.put(graphDto.getId(), gson.fromJson(graphDto.getJson(), NetworkGraph.class));
        }

        GraphListRs rs = new GraphListRs();
        rs.setGraphs(graphMap);
        rs.setSuccessful(true);
        return rs;
    }

    public GraphRs userGraph(String token, Integer graphId) {
        UserDto user = findTokenUser(token);
        GraphDto graphDto = graphRepository.findById(graphId)
                .orElseThrow(() -> new NotFoundException("Graph not found"));

        if (!user.getId().equals(graphDto.getUser().getId())) {
            throw new NotFoundException("Graph not found");
        }

        GraphRs rs = new GraphRs();
        rs.setId(graphDto.getId());
        rs.setGraph(GsonUtils.gson().fromJson(graphDto.getJson(), NetworkGraph.class));
        rs.setSuccessful(true);
        return rs;
    }

    public GraphPathRs userGraphPath(String token, Integer graphId, String n1, String n2) {
        UserDto user = findTokenUser(token);
        GraphDto graphDto = graphRepository.findById(graphId)
                .orElseThrow(() -> new NotFoundException("Graph not found"));

        if (!user.getId().equals(graphDto.getUser().getId())) {
            throw new NotFoundException("Graph not found");
        }

        NetworkGraph graph = GsonUtils.gson().fromJson(graphDto.getJson(), NetworkGraph.class);
        List<NetworkGraphNode> path = ShortestPathAlgorithm.TRACE.find(graph, n1, n2);

        GraphPathRs rs = new GraphPathRs();
        rs.setPath(path);
        rs.setSuccessful(true);
        return rs;
    }
}
