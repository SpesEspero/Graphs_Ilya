package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphEdge;
import com.app.network_graph_api.model.api.NetworkGraphNode;
import com.google.gson.*;

import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NetworkGraphDeserializer implements JsonDeserializer<NetworkGraph> {

    @Override
    public NetworkGraph deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException {
        Map<NetworkGraphNode, List<NetworkGraphEdge>> nodeMap = new HashMap<>();

        List<NetworkGraphNode> nodes = new ArrayList<>();
        JsonArray nodesElement = jsonElement.getAsJsonObject().get("nodes").getAsJsonArray();
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

        NetworkGraph graph = new NetworkGraph();
        graph.setNodes(nodeMap);
        return graph;
    }
}
