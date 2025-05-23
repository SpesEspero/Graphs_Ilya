package com.app.network_graph_api.model.api;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Запрос на создание графа")
public class GraphRq extends ApiRequest {

    @Schema(description = "Список узлов сети в новом формате", required = true)
    private List<NetworkNode> networkNodes;

    public List<NetworkNode> getNetworkNodes() {
        return networkNodes;
    }

    public void setNetworkNodes(List<NetworkNode> networkNodes) {
        this.networkNodes = networkNodes;
    }
}
