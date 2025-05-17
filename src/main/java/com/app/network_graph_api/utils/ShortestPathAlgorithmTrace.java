package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphEdge;
import com.app.network_graph_api.model.api.NetworkGraphNode;

import java.math.BigDecimal;
import java.util.*;

public class ShortestPathAlgorithmTrace implements ShortestPathAlgorithmHandler {

    @Override
    public List<NetworkGraphNode> find(NetworkGraph graph, String n1, String n2) {
        NetworkGraphNode in = NetworkGraphUtils.findNodeByName(graph, n1);
        Map<List<NetworkGraphNode>, BigDecimal> paths = new HashMap<>();
        trace(in, graph, paths);
        return paths.keySet().stream()
                .filter(path -> n1.equals(path.get(0).getName()) && n2.equals(path.get(path.size() - 1).getName()))
                .min(Comparator.comparing(paths::get))
                .orElse(null);
    }

    private void trace(NetworkGraphNode entry, NetworkGraph graph, Map<List<NetworkGraphNode>, BigDecimal> result) {
        trace(entry, BigDecimal.ZERO, graph, null, result);
    }

    private void trace(NetworkGraphNode node, BigDecimal weight, NetworkGraph graph,
                       Map<List<NetworkGraphNode>, BigDecimal> paths, Map<List<NetworkGraphNode>, BigDecimal> result) {
        Map<List<NetworkGraphNode>, BigDecimal> newPaths = new HashMap<>();
        if (paths == null) {
            List<NetworkGraphNode> newPath = new ArrayList<>();
            newPath.add(node);
            newPaths.put(newPath, weight);
        } else {
            for (List<NetworkGraphNode> path : paths.keySet()) {
                if (path.contains(node)) {
                    continue;
                }

                BigDecimal pathWeight = paths.get(path);
                List<NetworkGraphNode> newPath = new ArrayList<>(path);
                newPath.add(node);
                newPaths.put(newPath, pathWeight.add(weight));
            }
        }

        List<NetworkGraphEdge> edges = graph.getNodes().get(node);
        for (NetworkGraphEdge edge : edges) {
            for (List<NetworkGraphNode> path : newPaths.keySet()) {
                if (path.contains(edge.getTo())) {
                    continue;
                }

                trace(edge.getTo(), edge.getWeight(), graph, newPaths, result);
            }
        }

        result.putAll(newPaths);
    }
}
