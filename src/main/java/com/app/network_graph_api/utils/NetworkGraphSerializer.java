package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphEdge;
import com.app.network_graph_api.model.api.NetworkGraphNode;
import com.google.gson.*;

import java.lang.reflect.Type;
import java.util.List;

public class NetworkGraphSerializer implements JsonSerializer<NetworkGraph> {

    @Override
    public JsonElement serialize(NetworkGraph graph, Type type, JsonSerializationContext jsonSerializationContext) {
        JsonObject jsonObject = new JsonObject();
        jsonObject.add("nodes", graphNodeListElement(graph));
        return jsonObject;
    }

    private JsonElement graphNodeListElement(NetworkGraph graph) {
        JsonArray jsonArray = new JsonArray();
        for (NetworkGraphNode node : graph.getNodes().keySet()) {
            List<NetworkGraphEdge> edges = graph.getNodes().get(node);
            JsonElement nodeJson = graphNodeElement(node, edges);
            jsonArray.add(nodeJson);
        }
        return jsonArray;
    }

    private JsonElement graphEdgeListElement(List<NetworkGraphEdge> edges) {
        JsonArray jsonArray = new JsonArray();
        edges.stream().map(this::graphEdgeElement).forEach(jsonArray::add);
        return jsonArray;
    }

    private JsonElement graphNodeElement(NetworkGraphNode node, List<NetworkGraphEdge> edges) {
        JsonObject nodeJson = new JsonObject();
        nodeJson.addProperty("name", node.getName());
        nodeJson.addProperty("value", node.getValue());
        nodeJson.add("edges", graphEdgeListElement(edges));
        return nodeJson;
    }

    private JsonElement graphEdgeElement(NetworkGraphEdge edge) {
        JsonObject edgeJson = new JsonObject();
        edgeJson.addProperty("to", edge.getTo().getName());
        edgeJson.addProperty("weight", edge.getWeight());
        return edgeJson;
    }
}
