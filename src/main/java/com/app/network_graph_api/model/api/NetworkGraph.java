package com.app.network_graph_api.model.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Schema(description = "Граф сети")
public class NetworkGraph {
    @Schema(description = "Узлы графа в старом формате (для обратной совместимости)")
    private Map<NetworkGraphNode, List<NetworkGraphEdge>> nodes = new HashMap<>();

    @Schema(description = "Узлы графа в новом формате", required = true)
    private List<NetworkNode> networkNodes;

    public Map<NetworkGraphNode, List<NetworkGraphEdge>> getNodes() {
        return nodes;
    }

    public void setNodes(Map<NetworkGraphNode, List<NetworkGraphEdge>> nodes) {
        this.nodes = nodes;
    }

    public List<NetworkNode> getNetworkNodes() {
        return networkNodes;
    }

    public void setNetworkNodes(List<NetworkNode> networkNodes) {
        this.networkNodes = networkNodes;
    }
}
