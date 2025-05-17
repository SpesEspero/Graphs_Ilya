package com.app.network_graph_api.model.api;

import java.math.BigDecimal;

public class NetworkGraphEdge {
    private BigDecimal weight;
    private NetworkGraphNode to;

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public NetworkGraphNode getTo() {
        return to;
    }

    public void setTo(NetworkGraphNode to) {
        this.to = to;
    }
}
