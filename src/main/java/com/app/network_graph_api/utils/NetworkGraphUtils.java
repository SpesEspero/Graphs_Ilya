package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphEdge;
import com.app.network_graph_api.model.api.NetworkGraphNode;
import com.app.network_graph_api.model.api.NetworkNode;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class NetworkGraphUtils {

    private NetworkGraphUtils() {
        // prevent init
    }

    public static NetworkGraph buildGraph(List<NetworkNode> nodes) {
        Map<NetworkGraphNode, NetworkNode> graphNodes = graphNodeToNetworkNodeMap(nodes);

        NetworkGraph graph = new NetworkGraph();
        for (NetworkGraphNode graphNode : graphNodes.keySet()) {
            NetworkNode networkNode = graphNodes.get(graphNode);

            List<NetworkGraphEdge> edges = new ArrayList<>();

            // Проходим по всем соединенным узлам для данного узла
            for (int i = 0; i < networkNode.getConnectedNodes().size(); i++) {
                String connectedNodeName = networkNode.getConnectedNodes().get(i);

                // Находим соответствующий GraphNode
                NetworkGraphNode connectedGraphNode = graphNodes.entrySet().stream()
                        .filter(entry -> entry.getValue().getName().equals(connectedNodeName))
                        .map(Map.Entry::getKey)
                        .findFirst()
                        .orElse(null);

                if (connectedGraphNode != null) {
                    NetworkGraphEdge edge = new NetworkGraphEdge();
                    edge.setTo(connectedGraphNode);

                    // Используем вес из массива parameters по соответствующему индексу
                    BigDecimal weight = (i < networkNode.getParameters().size())
                            ? networkNode.getParameters().get(i)
                            : BigDecimal.ZERO;
                    edge.setWeight(weight);

                    edges.add(edge);
                }
            }

            graph.getNodes().put(graphNode, edges);
        }

        // Устанавливаем исходные узлы в networkNodes
        graph.setNetworkNodes(nodes);

        return graph;
    }

    private static List<NetworkGraphNode> collectGraphNodes(Map<NetworkGraphNode, NetworkNode> nodesMap,
            List<NetworkNode> networkNodes) {
        List<NetworkGraphNode> graphNodes = new ArrayList<>();
        for (NetworkGraphNode graphNode : nodesMap.keySet()) {
            NetworkNode networkNode = nodesMap.get(graphNode);
            networkNodes.stream()
                    .filter(n -> networkNode.getName().equals(n.getName()))
                    .findFirst()
                    .ifPresent(n -> graphNodes.add(graphNode));
        }
        return graphNodes;
    }

    private static List<NetworkNode> collectConnectedNetworkNodes(NetworkNode root, List<NetworkNode> nodes) {
        return nodes.stream()
                .filter(n -> root.getConnectedNodes().contains(n.getName()))
                .toList();
    }

    private static Map<NetworkGraphNode, NetworkNode> graphNodeToNetworkNodeMap(List<NetworkNode> nodes) {
        return nodes.stream()
                .collect(Collectors.toMap(NetworkGraphUtils::convertToGraphNode, v -> v));
    }

    private static NetworkGraphNode convertToGraphNode(NetworkNode networkNode) {
        NetworkGraphNode graphNode = new NetworkGraphNode();
        graphNode.setName(networkNode.getName());
        graphNode.setValue(calcNetworkGraphNodeValue(networkNode));
        return graphNode;
    }

    private static List<NetworkNode> findConnectedNodes(NetworkNode networkNode, List<NetworkNode> otherNodes) {
        return otherNodes.stream()
                .filter(n -> networkNode.getConnectedNodes().contains(n.getName()))
                .toList();
    }

    // TODO: implement node value calc algorithm
    private static BigDecimal calcNetworkGraphNodeValue(NetworkNode node) {
        return node.getParameters().stream()
                .reduce(BigDecimal::add)
                .orElse(BigDecimal.ZERO);
    }

    // TODO: implement weight calc algorithm
    private static BigDecimal calcNetworkGraphEdgeWeight(NetworkNode node) {
        return node.getParameters().stream()
                .reduce(BigDecimal::add)
                .orElse(BigDecimal.ZERO);
    }

    public static NetworkGraphNode findNodeByName(NetworkGraph graph, String nodeName) {
        return graph.getNodes().keySet().stream()
                .filter(n -> nodeName.equals(n.getName()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Конвертирует граф в старом формате (nodes) в новый формат (networkNodes)
     * 
     * @param graph Граф в старом формате
     * @return Список узлов в новом формате
     */
    public static List<NetworkNode> convertToNetworkNodes(NetworkGraph graph) {
        List<NetworkNode> networkNodes = new ArrayList<>();

        // Обрабатываем каждый узел в графе
        for (Map.Entry<NetworkGraphNode, List<NetworkGraphEdge>> entry : graph.getNodes().entrySet()) {
            NetworkGraphNode source = entry.getKey();
            List<NetworkGraphEdge> edges = entry.getValue();

            NetworkNode networkNode = new NetworkNode();
            networkNode.setName(source.getName());

            // Добавляем информацию о соединенных узлах и весах связей
            List<String> connectedNodes = new ArrayList<>();
            List<BigDecimal> parameters = new ArrayList<>();

            for (NetworkGraphEdge edge : edges) {
                String targetName = edge.getTargetNodeName();

                if (targetName != null) {
                    connectedNodes.add(targetName);
                    parameters.add(edge.getWeight());
                }
            }

            networkNode.setConnectedNodes(connectedNodes);
            networkNode.setParameters(parameters);

            networkNodes.add(networkNode);
        }

        return networkNodes;
    }
}
