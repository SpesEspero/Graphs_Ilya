package com.app.network_graph_api.model.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Ответ с информацией о графе")
public class GraphRs extends ApiResponse {

    @Schema(description = "Идентификатор графа")
    private Integer id;

    @Schema(description = "Граф сети в новом формате с networkNodes")
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
