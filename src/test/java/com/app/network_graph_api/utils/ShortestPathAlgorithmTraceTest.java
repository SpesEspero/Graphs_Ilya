package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.api.NetworkGraphNode;
import com.app.network_graph_api.model.api.NetworkNode;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ShortestPathAlgorithmTraceTest {

    private final ShortestPathAlgorithmTrace testTarget = new ShortestPathAlgorithmTrace();

    @Test
    public void testShortestPath_1() {
        List<NetworkNode> nodes = new ArrayList<>();
        nodes.add(networkNode("n1", connections("n2", "n3"), params(1, 2)));
        nodes.add(networkNode("n2", connections("n3"), params(3)));
        nodes.add(networkNode("n3", connections("n1", "n4", "n2"), params(4)));
        nodes.add(networkNode("n4", connections("n2", "n3"), params(1, 1)));
        NetworkGraph graph = NetworkGraphUtils.buildGraph(nodes);
        List<NetworkGraphNode> path = testTarget.find(graph, "n1", "n4");
        assertNotNull(path);
    }

    @Test
    public void testShortestPath_2() {
        List<NetworkNode> nodes = new ArrayList<>();
        nodes.add(networkNode("n1", connections("n2", "n3"), params(1)));
        nodes.add(networkNode("n2", connections("n4"), params(3)));
        nodes.add(networkNode("n3", connections("n4"), params(4)));
        nodes.add(networkNode("n4", connections(), params(4)));
        NetworkGraph graph = NetworkGraphUtils.buildGraph(nodes);
        List<NetworkGraphNode> path = testTarget.find(graph, "n1", "n4");
        assertNotNull(path);
    }

    private static NetworkNode networkNode(String name, List<String> connections, List<BigDecimal> params) {
        NetworkNode node = new NetworkNode();
        node.setName(name);
        node.setConnectedNodes(connections);
        node.setParameters(params);
        return node;
    }

    private static List<String> connections(String... names) {
        return new ArrayList<>(Arrays.asList(names));
    }

    private static List<BigDecimal> params(int... values) {
        List<BigDecimal> result = new ArrayList<>();
        for (int v : values) {
            result.add(new BigDecimal(v));
        }
        return result;
    }
}
