package com.app.network_graph_api.model.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NetworkGraph {
    private Map<NetworkGraphNode, List<NetworkGraphEdge>> nodes = new HashMap<>();

    public Map<NetworkGraphNode, List<NetworkGraphEdge>> getNodes() {
        return nodes;
    }

    public void setNodes(Map<NetworkGraphNode, List<NetworkGraphEdge>> nodes) {
        this.nodes = nodes;
    }
}
