package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphEdge;
import com.app.network_graph_api.model.api.NetworkGraphNode;
import com.app.network_graph_api.model.api.NetworkNode;
import com.google.gson.*;

import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NetworkGraphDeserializer implements JsonDeserializer<NetworkGraph> {

    @Override
    public NetworkGraph deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext context)
            throws JsonParseException {
        JsonObject jsonObject = jsonElement.getAsJsonObject();
        NetworkGraph graph = new NetworkGraph();

        // Десериализуем старый формат
        if (jsonObject.has("nodes")) {
            Map<NetworkGraphNode, List<NetworkGraphEdge>> nodeMap = deserializeOldFormat(jsonObject, context);
            graph.setNodes(nodeMap);
        }

        // Десериализуем новый формат (если есть)
        if (jsonObject.has("networkNodes")) {
            JsonArray networkNodesArray = jsonObject.getAsJsonArray("networkNodes");
            Type networkNodeListType = new com.google.gson.reflect.TypeToken<List<NetworkNode>>() {
            }.getType();
            List<NetworkNode> networkNodes = context.deserialize(networkNodesArray, networkNodeListType);
            graph.setNetworkNodes(networkNodes);
        }

        return graph;
    }

    private Map<NetworkGraphNode, List<NetworkGraphEdge>> deserializeOldFormat(JsonObject jsonObject,
            JsonDeserializationContext context) {
        Map<NetworkGraphNode, List<NetworkGraphEdge>> nodeMap = new HashMap<>();

        List<NetworkGraphNode> nodes = new ArrayList<>();
        JsonArray nodesElement = jsonObject.get("nodes").getAsJsonArray();
        for (JsonElement nodeElement : nodesElement) {
            String name = nodeElement.getAsJsonObject().get("name").getAsString();
            BigDecimal value = nodeElement.getAsJsonObject().get("value").getAsBigDecimal();

            NetworkGraphNode node = new NetworkGraphNode();
            node.setName(name);
            node.setValue(value);

            nodes.add(node);
        }

        for (JsonElement nodeElement : nodesElement) {
            String name = nodeElement.getAsJsonObject().get("name").getAsString();
            NetworkGraphNode thisNode = nodes.stream()
                    .filter(n -> name.equals(n.getName()))
                    .findFirst()
                    .orElseThrow();

            List<NetworkGraphEdge> edges = new ArrayList<>();
            JsonArray edgesElement = nodeElement.getAsJsonObject().getAsJsonArray("edges");
            for (JsonElement edgeElement : edgesElement) {
                String to = edgeElement.getAsJsonObject().get("to").getAsString();
                BigDecimal weight = edgeElement.getAsJsonObject().get("weight").getAsBigDecimal();

                NetworkGraphNode toNode = nodes.stream()
                        .filter(n -> to.equals(n.getName()))
                        .findFirst()
                        .orElseThrow();

                NetworkGraphEdge edge = new NetworkGraphEdge();
                edge.setTo(toNode);
                edge.setWeight(weight);
                edges.add(edge);
            }

            nodeMap.put(thisNode, edges);
        }

        return nodeMap;
    }
}
