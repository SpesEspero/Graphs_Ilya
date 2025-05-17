package com.app.network_graph_api.model.api;

public class GraphRs extends ApiResponse {
    private Integer id;
    private NetworkGraph graph;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public NetworkGraph getGraph() {
        return graph;
    }

    public void setGraph(NetworkGraph graph) {
        this.graph = graph;
    }
}
