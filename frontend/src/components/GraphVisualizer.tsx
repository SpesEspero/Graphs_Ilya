import React, { useState, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "antd";
import { observer } from "mobx-react-lite";
import graphStore from "../store/graphStore";
import PathFinder from "./PathFinder";
import type { NetworkNode } from "../api/graph";

interface GraphVisualizerProps {
  graphId?: number;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = observer(
  ({ graphId }) => {
    // State for nodes and edges
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [highlightedPath, setHighlightedPath] = useState<string[]>([]);

    // Force rerender key
    const [forceUpdateKey, setForceUpdateKey] = useState(Date.now());

    // If graphId is provided, this means we need to fetch the graph
    useEffect(() => {
      if (graphId && !graphStore.currentGraph) {
        graphStore.fetchGraph(graphId);
      }
    }, [graphId]);

    // Get network nodes for PathFinder
    const networkNodes: NetworkNode[] = useMemo(() => {
      if (graphStore.currentGraph && graphStore.currentGraph.graph) {
        // Приоритетно используем новый формат networkNodes
        if (
          graphStore.currentGraph.graph.networkNodes &&
          Array.isArray(graphStore.currentGraph.graph.networkNodes)
        ) {
          return graphStore.currentGraph.graph.networkNodes;
        }
        // Fallback для старого формата - конвертируем в NetworkNode
        else if (Array.isArray(graphStore.currentGraph.graph.nodes)) {
          return graphStore.nodes.map((node) => ({
            name: node.name,
            parameters: node.parameters,
            connectedNodes: node.connectedNodes,
          }));
        }
      } else if (graphStore.nodes.length > 0) {
        return graphStore.nodes.map((node) => ({
          name: node.name,
          parameters: node.parameters,
          connectedNodes: node.connectedNodes,
        }));
      }
      return [];
    }, [graphStore.currentGraph, graphStore.nodes]);

    // Update nodes and edges when graphStore.nodes or graphStore.currentGraph changes
    useEffect(() => {
      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      if (graphStore.currentGraph && graphStore.currentGraph.graph) {
        // Приоритетно используем новый формат networkNodes
        if (
          graphStore.currentGraph.graph.networkNodes &&
          Array.isArray(graphStore.currentGraph.graph.networkNodes)
        ) {
          // Create nodes from the networkNodes array
          newNodes = graphStore.currentGraph.graph.networkNodes.map(
            (node, index) => ({
              id: `node-${node.name}`,
              data: { label: node.name },
              position: {
                x:
                  150 +
                  Math.cos(
                    index *
                      ((2 * Math.PI) /
                        graphStore.currentGraph!.graph.networkNodes!.length)
                  ) *
                    150,
                y:
                  150 +
                  Math.sin(
                    index *
                      ((2 * Math.PI) /
                        graphStore.currentGraph!.graph.networkNodes!.length)
                  ) *
                    150,
              },
              style: {
                background: "#ffffff",
                border: "1px solid #1677ff",
                color: "#222",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              },
            })
          );

          // Create edges from the networkNodes using parameters as weights
          graphStore.currentGraph.graph.networkNodes.forEach((node) => {
            if (node.connectedNodes && Array.isArray(node.connectedNodes)) {
              node.connectedNodes.forEach((connectedNodeName, connIndex) => {
                const weight =
                  node.parameters && node.parameters[connIndex]
                    ? node.parameters[connIndex]
                    : 0;

                newEdges.push({
                  id: `edge-${node.name}-${connectedNodeName}-${connIndex}`,
                  source: `node-${node.name}`,
                  target: `node-${connectedNodeName}`,
                  label: `${weight}`,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                  },
                  style: { strokeWidth: 2 },
                  animated: false,
                });
              });
            }
          });
        }
        // Fallback для старого формата (только если networkNodes отсутствует)
        else if (Array.isArray(graphStore.currentGraph.graph.nodes)) {
          // Create nodes from the array
          newNodes = graphStore.currentGraph.graph.nodes.map((node, index) => ({
            id: `node-${node.name}`,
            data: { label: node.name },
            position: {
              x:
                150 +
                Math.cos(
                  index *
                    ((2 * Math.PI) /
                      graphStore.currentGraph!.graph.nodes!.length)
                ) *
                  150,
              y:
                150 +
                Math.sin(
                  index *
                    ((2 * Math.PI) /
                      graphStore.currentGraph!.graph.nodes!.length)
                ) *
                  150,
            },
            style: {
              background: "#ffffff",
              border: "1px solid #1677ff",
              color: "#222",
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            },
          }));

          // Create edges based on the graph store nodes to ensure correct data format
          if (graphStore.nodes.length > 0) {
            graphStore.nodes.forEach((node) => {
              node.connectedNodes.forEach((connectedNodeName, connIndex) => {
                // Get the weight from the parameters array at the same index
                const weight = node.parameters[connIndex] || 0;

                newEdges.push({
                  id: `edge-${node.name}-${connectedNodeName}-${connIndex}`,
                  source: `node-${node.name}`,
                  target: `node-${connectedNodeName}`,
                  label: `${weight}`,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                  },
                  style: { strokeWidth: 2 },
                  animated: false,
                });
              });
            });
          } else {
            // Fallback to using the backend data format
            graphStore.currentGraph.graph.nodes.forEach((node) => {
              if (Array.isArray(node.edges)) {
                node.edges.forEach((edge, edgeIndex) => {
                  if (edge && edge.to) {
                    // Handle 'to' which can be a string or an object with a name property
                    const targetName =
                      typeof edge.to === "string" ? edge.to : edge.to.name;

                    newEdges.push({
                      id: `edge-${node.name}-${targetName}-${edgeIndex}`,
                      source: `node-${node.name}`,
                      target: `node-${targetName}`,
                      label: `${edge.weight}`,
                      markerEnd: {
                        type: MarkerType.ArrowClosed,
                      },
                      style: { strokeWidth: 2 },
                      animated: false,
                    });
                  }
                });
              }
            });
          }
        }
      } else if (graphStore.nodes.length > 0) {
        // Extract nodes from the graph store nodes (for graph creation)
        newNodes = graphStore.nodes.map((node, index) => {
          return {
            id: `node-${node.name}`,
            data: { label: node.name },
            position: {
              x:
                150 +
                Math.cos(index * ((2 * Math.PI) / graphStore.nodes.length)) *
                  150,
              y:
                150 +
                Math.sin(index * ((2 * Math.PI) / graphStore.nodes.length)) *
                  150,
            },
            style: {
              background: "#ffffff",
              border: "1px solid #1677ff",
              color: "#222",
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            },
          };
        });

        // Extract edges from node connections using parameters array
        graphStore.nodes.forEach((node) => {
          node.connectedNodes.forEach((connectedNodeName, connIndex) => {
            // Get the weight from the parameters array at the same index
            const weight = node.parameters[connIndex] || 0;

            newEdges.push({
              id: `edge-${node.name}-${connectedNodeName}-${connIndex}`,
              source: `node-${node.name}`,
              target: `node-${connectedNodeName}`,
              label: `${weight}`,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              style: { strokeWidth: 2 },
              animated: false,
            });
          });
        });
      }

      // Highlight the path if available
      if (highlightedPath.length > 0) {
        // Highlight nodes in the path
        newNodes = newNodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            background: highlightedPath.includes(node.id.replace("node-", ""))
              ? "#ff6b6b"
              : "#ffffff",
            borderColor: highlightedPath.includes(node.id.replace("node-", ""))
              ? "#d93636"
              : "#1677ff",
          },
        }));

        // Highlight edges in the path
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          const sourcePath = highlightedPath[i];
          const targetPath = highlightedPath[i + 1];

          newEdges = newEdges.map((edge) => {
            if (
              edge.source === `node-${sourcePath}` &&
              edge.target === `node-${targetPath}`
            ) {
              return {
                ...edge,
                animated: true,
                style: { ...edge.style, stroke: "#ff6b6b", strokeWidth: 3 },
              };
            }
            return edge;
          });
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);

      // Force an update to ReactFlow by changing its key
      setForceUpdateKey(Date.now());
    }, [graphStore.currentGraph, graphStore.nodes, highlightedPath]);

    const handlePathHighlight = (path: string[]) => {
      setHighlightedPath(path);
    };

    return (
      <div>
        <Card
          title="Визуализация топологии"
          bordered={false}
          style={{ height: "100%", marginBottom: 20 }}
        >
          <ReactFlowProvider>
            <div style={{ height: 400 }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                key={forceUpdateKey}
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </Card>

        {networkNodes.length > 0 && (
          <PathFinder
            networkNodes={networkNodes}
            onPathHighlight={handlePathHighlight}
          />
        )}
      </div>
    );
  }
);

export default GraphVisualizer;
