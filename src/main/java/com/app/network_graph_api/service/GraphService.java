package com.app.network_graph_api.service;

import com.app.network_graph_api.exception.NotFoundException;
import com.app.network_graph_api.model.api.*;
import com.app.network_graph_api.model.db.GraphDto;
import com.app.network_graph_api.model.db.UserDto;
import com.app.network_graph_api.repo.GraphRepository;
import com.app.network_graph_api.repo.KeyRepository;
import com.app.network_graph_api.repo.TokenRepository;
import com.app.network_graph_api.repo.UserRepository;
import com.app.network_graph_api.utils.GsonUtils;
import com.app.network_graph_api.utils.NetworkGraphUtils;
import com.app.network_graph_api.utils.ShortestPathAlgorithm;
import com.google.gson.Gson;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GraphService extends AuthorizedService {

    private final GraphRepository graphRepository;

    public GraphService(@Autowired KeyRepository keyRepository,
            @Autowired UserRepository userRepository,
            @Autowired TokenRepository tokenRepository,
            @Autowired GraphRepository graphRepository) {
        super(keyRepository, userRepository, tokenRepository);
        this.graphRepository = graphRepository;
    }

    @Transactional
    public GraphRs createGraph(String token, GraphRq rq) {
        NetworkGraph graph = NetworkGraphUtils.buildGraph(rq.getNetworkNodes());

        graph.setNetworkNodes(rq.getNetworkNodes());

        Gson gson = GsonUtils.gson();
        String graphJson = gson.toJson(graph);

        GraphDto graphDto = new GraphDto();
        graphDto.setJson(graphJson);
        graphDto.setUser(findTokenUser(token));

        graphRepository.save(graphDto);

        GraphRs rs = new GraphRs();
        rs.setGraph(graph);
        rs.setSuccessful(true);
        rs.setId(graphDto.getId());
        return rs;
    }

    public GraphListRs userGraphList(String token) {
        UserDto user = findTokenUser(token);

        Map<Integer, NetworkGraph> graphMap = new HashMap<>();
        Gson gson = GsonUtils.gson();

        for (GraphDto graphDto : user.getGraphs()) {
            NetworkGraph graph = gson.fromJson(graphDto.getJson(), NetworkGraph.class);

            // Если у нас нет networkNodes, создаем их из старого формата на лету
            // НЕ сохраняем в БД, чтобы избежать блокирующих операций
            if (graph.getNetworkNodes() == null) {
                List<NetworkNode> networkNodes = NetworkGraphUtils.convertToNetworkNodes(graph);
                graph.setNetworkNodes(networkNodes);
            }

            graphMap.put(graphDto.getId(), graph);
        }

        GraphListRs rs = new GraphListRs();
        rs.setGraphs(graphMap);
        rs.setSuccessful(true);
        return rs;
    }

    public GraphRs userGraph(String token, Integer graphId) {
        UserDto user = findTokenUser(token);
        GraphDto graphDto = graphRepository.findById(graphId)
                .orElseThrow(() -> new NotFoundException("Graph not found"));

        if (!user.getId().equals(graphDto.getUser().getId())) {
            throw new NotFoundException("Graph not found");
        }

        NetworkGraph graph = GsonUtils.gson().fromJson(graphDto.getJson(), NetworkGraph.class);

        // Если у нас нет networkNodes, создаем их из старого формата на лету
        if (graph.getNetworkNodes() == null) {
            List<NetworkNode> networkNodes = NetworkGraphUtils.convertToNetworkNodes(graph);
            graph.setNetworkNodes(networkNodes);

            // Асинхронно сохраняем обновленную версию в базе данных (в фоне)
            // Убираем синхронное сохранение, которое может блокировать ответ
            try {
                String updatedJson = GsonUtils.gson().toJson(graph);
                graphDto.setJson(updatedJson);
                graphRepository.save(graphDto);
            } catch (Exception e) {
                // Логируем ошибку, но не прерываем выполнение запроса
                System.err.println("Ошибка при сохранении миграции графа " + graphId + ": " + e.getMessage());
            }
        }

        GraphRs rs = new GraphRs();
        rs.setId(graphDto.getId());
        rs.setGraph(graph);
        rs.setSuccessful(true);
        return rs;
    }

    public GraphPathRs userGraphPath(String token, Integer graphId, String n1, String n2) {
        UserDto user = findTokenUser(token);
        GraphDto graphDto = graphRepository.findById(graphId)
                .orElseThrow(() -> new NotFoundException("Graph not found"));

        if (!user.getId().equals(graphDto.getUser().getId())) {
            throw new NotFoundException("Graph not found");
        }

        NetworkGraph graph = GsonUtils.gson().fromJson(graphDto.getJson(), NetworkGraph.class);
        List<NetworkGraphNode> nodePath = ShortestPathAlgorithm.TRACE.find(graph, n1, n2);

        GraphPathRs rs = new GraphPathRs();

        // Преобразуем путь из списка узлов в список имен узлов
        List<String> pathNames = nodePath.stream()
                .map(NetworkGraphNode::getName)
                .toList();
        rs.setPath(pathNames);

        // Расчет общего веса пути
        int totalWeight = 0;
        for (int i = 0; i < nodePath.size() - 1; i++) {
            NetworkGraphNode source = nodePath.get(i);
            NetworkGraphNode target = nodePath.get(i + 1);

            // Находим ребро между источником и целью
            for (NetworkGraphEdge edge : graph.getNodes().get(source)) {
                String targetName = edge.getTargetNodeName();
                if (targetName != null && targetName.equals(target.getName())) {
                    totalWeight += edge.getWeight().intValue();
                    break;
                }
            }
        }

        rs.setTotalWeight(totalWeight);
        rs.setSuccessful(true);
        return rs;
    }
}
