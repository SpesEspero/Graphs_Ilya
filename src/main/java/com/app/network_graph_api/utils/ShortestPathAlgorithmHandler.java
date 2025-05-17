package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphNode;

import java.util.List;

public interface ShortestPathAlgorithmHandler {

    List<NetworkGraphNode> find(NetworkGraph graph, String n1, String n2);
}
