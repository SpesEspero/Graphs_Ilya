package com.app.network_graph_api.model.api;

import java.util.List;

public class GraphRq extends ApiRequest {
    private List<NetworkNode> networkNodes;

    public List<NetworkNode> getNetworkNodes() {
        return networkNodes;
    }

    public void setNetworkNodes(List<NetworkNode> networkNodes) {
        this.networkNodes = networkNodes;
    }
}
