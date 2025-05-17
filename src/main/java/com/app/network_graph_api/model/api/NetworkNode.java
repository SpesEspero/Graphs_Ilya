package com.app.network_graph_api.model.api;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class NetworkNode {
    private String name;
    private List<BigDecimal> parameters = new ArrayList<>();
    private List<String> connectedNodes = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<BigDecimal> getParameters() {
        return parameters;
    }

    public void setParameters(List<BigDecimal> parameters) {
        this.parameters = parameters;
    }

    public List<String> getConnectedNodes() {
        return connectedNodes;
    }

    public void setConnectedNodes(List<String> connectedNodes) {
        this.connectedNodes = connectedNodes;
    }
}
