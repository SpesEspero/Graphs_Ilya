package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphNode;

import java.util.List;

public enum ShortestPathAlgorithm {

    TRACE(new ShortestPathAlgorithmTrace());

    private final ShortestPathAlgorithmHandler handler;

    ShortestPathAlgorithm(ShortestPathAlgorithmHandler handler) {
        this.handler = handler;
    }

    public List<NetworkGraphNode> find(NetworkGraph graph, String n1, String n2) {
        return handler.find(graph, n1, n2);
    }
}
