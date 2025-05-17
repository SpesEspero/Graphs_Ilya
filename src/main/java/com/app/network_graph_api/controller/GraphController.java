package com.app.network_graph_api.controller;

import com.app.network_graph_api.controller.aop.Authorized;
import com.app.network_graph_api.model.api.GraphListRs;
import com.app.network_graph_api.model.api.GraphPathRs;
import com.app.network_graph_api.model.api.GraphRq;
import com.app.network_graph_api.model.api.GraphRs;
import com.app.network_graph_api.service.GraphService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/graph")
public class GraphController extends ApiController {
    Logger logger = LoggerFactory.getLogger(GraphController.class);

    @Autowired
    private GraphService graphService;

    @PostMapping
    @Authorized
    public ResponseEntity<GraphRs> createGraph(@RequestParam String token, @RequestBody GraphRq rq) {
        logger.info("/graph post endpoint called");
        GraphRs rs = graphService.createGraph(token, rq);
        return decide(rs);
    }

    @GetMapping
    @Authorized
    public ResponseEntity<GraphListRs> getUserGraphList(@RequestParam String token) {
        logger.info("/graph get endpoint called");
        GraphListRs rs = graphService.userGraphList(token);
        return decide(rs);
    }

    @GetMapping("/{graphId}")
    @Authorized
    public ResponseEntity<GraphRs> getUserGraph(@RequestParam String token,
                                                @PathVariable("graphId") Integer graphId) {
        logger.info("/graph/{graphId} get endpoint called");
        GraphRs rs = graphService.userGraph(token, graphId);
        return decide(rs);
    }

    @GetMapping("/{graphId}/path")
    @Authorized
    public ResponseEntity<GraphPathRs> calculateUserGraphPath(@RequestParam String token,
                                                              @PathVariable("graphId") Integer graphId,
                                                              @RequestParam String n1, @RequestParam String n2) {
        logger.info("/graph/{graphId}/path get endpoint called");
        GraphPathRs rs = graphService.userGraphPath(token, graphId, n1, n2);
        return decide(rs);
    }
}
