package com.app.network_graph_api.model.api;

import java.math.BigDecimal;

public class NetworkGraphEdge {
    private BigDecimal weight;
    private Object to;

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public Object getTo() {
        return to;
    }

    public void setTo(Object to) {
        this.to = to;
    }

    /**
     * Возвращает имя целевого узла
     * 
     * @return Имя узла
     */
    public String getTargetNodeName() {
        if (to instanceof String) {
            return (String) to;
        } else if (to instanceof NetworkGraphNode) {
            return ((NetworkGraphNode) to).getName();
        }
        return null;
    }
}
