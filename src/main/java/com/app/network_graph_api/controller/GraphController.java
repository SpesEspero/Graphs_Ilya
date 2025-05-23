package com.app.network_graph_api.controller;

import com.app.network_graph_api.controller.aop.Authorized;
import com.app.network_graph_api.model.api.GraphListRs;
import com.app.network_graph_api.model.api.GraphPathRs;
import com.app.network_graph_api.model.api.GraphRq;
import com.app.network_graph_api.model.api.GraphRs;
import com.app.network_graph_api.service.GraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/graph")
@Tag(name = "Graph API", description = "API для работы с сетевыми графами")
public class GraphController extends ApiController {
    Logger logger = LoggerFactory.getLogger(GraphController.class);

    @Autowired
    private GraphService graphService;

    @PostMapping
    @Authorized
    @Operation(summary = "Создание нового графа", description = "Создает новый граф на основе переданных данных о узлах и их соединениях", responses = {
            @ApiResponse(responseCode = "200", description = "Граф успешно создан", content = @Content(schema = @Schema(implementation = GraphRs.class))),
            @ApiResponse(responseCode = "400", description = "Неверный формат запроса"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    public ResponseEntity<GraphRs> createGraph(
            @Parameter(description = "Токен авторизации") @RequestParam String token,
            @Parameter(description = "Данные графа", required = true) @RequestBody GraphRq rq) {
        logger.info("/graph post endpoint called");
        GraphRs rs = graphService.createGraph(token, rq);
        return decide(rs);
    }

    @GetMapping
    @Authorized
    @Operation(summary = "Получение списка графов пользователя", description = "Возвращает список всех графов, созданных пользователем", responses = {
            @ApiResponse(responseCode = "200", description = "Список графов успешно получен", content = @Content(schema = @Schema(implementation = GraphListRs.class))),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    public ResponseEntity<GraphListRs> getUserGraphList(
            @Parameter(description = "Токен авторизации") @RequestParam String token) {
        logger.info("/graph get endpoint called");
        GraphListRs rs = graphService.userGraphList(token);
        return decide(rs);
    }

    @GetMapping("/{graphId}")
    @Authorized
    @Operation(summary = "Получение графа по ID", description = "Возвращает граф с указанным ID в новом формате с networkNodes", responses = {
            @ApiResponse(responseCode = "200", description = "Граф успешно получен", content = @Content(schema = @Schema(implementation = GraphRs.class))),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Граф не найден")
    })
    public ResponseEntity<GraphRs> getUserGraph(
            @Parameter(description = "Токен авторизации") @RequestParam String token,
            @Parameter(description = "ID графа") @PathVariable("graphId") Integer graphId) {
        logger.info("/graph/{graphId} get endpoint called");
        GraphRs rs = graphService.userGraph(token, graphId);
        return decide(rs);
    }

    @GetMapping("/{graphId}/path")
    @Authorized
    @Operation(summary = "Вычисление кратчайшего пути в графе", description = "Находит кратчайший путь между двумя указанными узлами в графе", responses = {
            @ApiResponse(responseCode = "200", description = "Путь успешно вычислен", content = @Content(schema = @Schema(implementation = GraphPathRs.class))),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Граф не найден")
    })
    public ResponseEntity<GraphPathRs> calculateUserGraphPath(
            @Parameter(description = "Токен авторизации") @RequestParam String token,
            @Parameter(description = "ID графа") @PathVariable("graphId") Integer graphId,
            @Parameter(description = "Имя начального узла") @RequestParam String n1,
            @Parameter(description = "Имя конечного узла") @RequestParam String n2) {
        logger.info("/graph/{graphId}/path get endpoint called");
        GraphPathRs rs = graphService.userGraphPath(token, graphId, n1, n2);
        return decide(rs);
    }
}
