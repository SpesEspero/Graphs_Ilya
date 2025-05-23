package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphEdge;
import com.app.network_graph_api.model.api.NetworkGraphNode;
import com.app.network_graph_api.model.api.NetworkNode;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class NetworkGraphUtilsTest {

    @Test
    void testBuildGraphWithCorrectWeights() {
        // Создаем тестовые данные в новом формате
        NetworkNode nodeA = new NetworkNode();
        nodeA.setName("A");
        nodeA.setConnectedNodes(Arrays.asList("B", "C"));
        nodeA.setParameters(Arrays.asList(BigDecimal.valueOf(2), BigDecimal.valueOf(3)));

        NetworkNode nodeB = new NetworkNode();
        nodeB.setName("B");
        nodeB.setConnectedNodes(Arrays.asList("C"));
        nodeB.setParameters(Arrays.asList(BigDecimal.valueOf(5)));

        NetworkNode nodeC = new NetworkNode();
        nodeC.setName("C");
        nodeC.setConnectedNodes(Arrays.asList());
        nodeC.setParameters(Arrays.asList());

        List<NetworkNode> networkNodes = Arrays.asList(nodeA, nodeB, nodeC);

        // Строим граф
        NetworkGraph graph = NetworkGraphUtils.buildGraph(networkNodes);

        // Проверяем, что граф построен правильно
        assertNotNull(graph);
        assertNotNull(graph.getNodes());
        assertEquals(3, graph.getNodes().size());

        // Находим узел A в графе
        NetworkGraphNode graphNodeA = graph.getNodes().keySet().stream()
                .filter(node -> "A".equals(node.getName()))
                .findFirst()
                .orElse(null);

        assertNotNull(graphNodeA);

        // Проверяем ребра из A
        List<NetworkGraphEdge> edgesFromA = graph.getNodes().get(graphNodeA);
        assertEquals(2, edgesFromA.size());

        // Проверяем веса ребер
        NetworkGraphEdge edgeAtoB = edgesFromA.stream()
                .filter(edge -> "B".equals(edge.getTargetNodeName()))
                .findFirst()
                .orElse(null);
        assertNotNull(edgeAtoB);
        assertEquals(BigDecimal.valueOf(2), edgeAtoB.getWeight());

        NetworkGraphEdge edgeAtoC = edgesFromA.stream()
                .filter(edge -> "C".equals(edge.getTargetNodeName()))
                .findFirst()
                .orElse(null);
        assertNotNull(edgeAtoC);
        assertEquals(BigDecimal.valueOf(3), edgeAtoC.getWeight());

        // Проверяем узел B
        NetworkGraphNode graphNodeB = graph.getNodes().keySet().stream()
                .filter(node -> "B".equals(node.getName()))
                .findFirst()
                .orElse(null);

        assertNotNull(graphNodeB);

        List<NetworkGraphEdge> edgesFromB = graph.getNodes().get(graphNodeB);
        assertEquals(1, edgesFromB.size());

        NetworkGraphEdge edgeBtoC = edgesFromB.get(0);
        assertEquals("C", edgeBtoC.getTargetNodeName());
        assertEquals(BigDecimal.valueOf(5), edgeBtoC.getWeight());
    }

    @Test
    void testConvertToNetworkNodes() {
        // Создаем граф в старом формате
        NetworkGraph graph = new NetworkGraph();

        NetworkGraphNode nodeA = new NetworkGraphNode();
        nodeA.setName("A");
        nodeA.setValue(BigDecimal.valueOf(10));

        NetworkGraphNode nodeB = new NetworkGraphNode();
        nodeB.setName("B");
        nodeB.setValue(BigDecimal.valueOf(15));

        NetworkGraphEdge edgeAtoB = new NetworkGraphEdge();
        edgeAtoB.setTo(nodeB);
        edgeAtoB.setWeight(BigDecimal.valueOf(7));

        graph.getNodes().put(nodeA, Arrays.asList(edgeAtoB));
        graph.getNodes().put(nodeB, Arrays.asList());

        // Конвертируем в новый формат
        List<NetworkNode> networkNodes = NetworkGraphUtils.convertToNetworkNodes(graph);

        assertEquals(2, networkNodes.size());

        NetworkNode convertedNodeA = networkNodes.stream()
                .filter(node -> "A".equals(node.getName()))
                .findFirst()
                .orElse(null);

        assertNotNull(convertedNodeA);
        assertEquals(1, convertedNodeA.getConnectedNodes().size());
        assertEquals("B", convertedNodeA.getConnectedNodes().get(0));
        assertEquals(1, convertedNodeA.getParameters().size());
        assertEquals(BigDecimal.valueOf(7), convertedNodeA.getParameters().get(0));
    }
}