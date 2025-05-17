package com.app.network_graph_api.model.api;

import java.util.List;

public class GraphPathRs extends ApiResponse {
    private List<NetworkGraphNode> path;

    public List<NetworkGraphNode> getPath() {
        return path;
    }

    public void setPath(List<NetworkGraphNode> path) {
        this.path = path;
    }
}
