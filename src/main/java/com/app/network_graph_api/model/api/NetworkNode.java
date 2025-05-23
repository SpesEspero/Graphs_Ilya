package com.app.network_graph_api.model.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Узел сети в новом формате")
public class NetworkNode {

    @Schema(description = "Название узла", required = true)
    private String name;

    @Schema(description = "Веса соединений с другими узлами (в том же порядке, что и connectedNodes)")
    private List<BigDecimal> parameters = new ArrayList<>();

    @Schema(description = "Имена узлов, с которыми установлены соединения")
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
