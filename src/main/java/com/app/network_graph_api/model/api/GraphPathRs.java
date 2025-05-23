package com.app.network_graph_api.model.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Ответ с информацией о кратчайшем пути в графе")
public class GraphPathRs extends ApiResponse {

    @Schema(description = "Список имен узлов, составляющих кратчайший путь")
    private List<String> path;

    @Schema(description = "Общий вес пути")
    private int totalWeight;

    public List<String> getPath() {
        return path;
    }

    public void setPath(List<String> path) {
        this.path = path;
    }

    public int getTotalWeight() {
        return totalWeight;
    }

    public void setTotalWeight(int totalWeight) {
        this.totalWeight = totalWeight;
    }
}
