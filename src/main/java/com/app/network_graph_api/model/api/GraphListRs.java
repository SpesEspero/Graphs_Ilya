package com.app.network_graph_api.model.api;

import java.util.Map;

public class GraphListRs extends ApiResponse {
    private Map<Integer, NetworkGraph> graphs;

    public Map<Integer, NetworkGraph> getGraphs() {
        return graphs;
    }

    public void setGraphs(Map<Integer, NetworkGraph> graphs) {
        this.graphs = graphs;
    }
}
