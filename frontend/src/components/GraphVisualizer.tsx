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
import { Card, Select, Button, Form, Typography, Space, Divider } from "antd";
import { observer } from "mobx-react-lite";
import graphStore from "../store/graphStore";

const { Title, Text } = Typography;
const { Option } = Select;

interface GraphVisualizerProps {
  graphId?: number;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = observer(
  ({ graphId }) => {
    const [sourceNode, setSourceNode] = useState<string | null>(null);
    const [targetNode, setTargetNode] = useState<string | null>(null);
    const [calculatingPath, setCalculatingPath] = useState(false);

    // State for nodes and edges
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // Force rerender key
    const [forceUpdateKey, setForceUpdateKey] = useState(Date.now());

    const [form] = Form.useForm();

    // If graphId is provided, this means we need to fetch the graph
    useEffect(() => {
      if (graphId && !graphStore.currentGraph) {
        graphStore.fetchGraph(graphId);
      }
    }, [graphId]);

    // Update nodes and edges when graphStore.nodes or graphStore.currentGraph changes
    useEffect(() => {
      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      if (graphStore.currentGraph && graphStore.currentGraph.graph) {
        // The backend response has nodes as an array, not as a Record
        if (Array.isArray(graphStore.currentGraph.graph.nodes)) {
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
                      graphStore.currentGraph!.graph.nodes.length)
                ) *
                  150,
              y:
                150 +
                Math.sin(
                  index *
                    ((2 * Math.PI) /
                      graphStore.currentGraph!.graph.nodes.length)
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

          // Create edges from each node's edges array
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

        // Extract edges from node connections
        graphStore.nodes.forEach((node) => {
          node.connectedNodes.forEach((connectedNodeName, connIndex) => {
            // Get the correct edge weight from the edgeWeights map
            const weight = graphStore.getEdgeWeight(
              node.name,
              connectedNodeName
            );

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
      if (graphStore.currentPath && graphStore.currentPath.path.length > 0) {
        const path = graphStore.currentPath.path;

        // Highlight nodes in the path
        newNodes = newNodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            background: path.includes(node.id.replace("node-", ""))
              ? "#ff6b6b"
              : "#ffffff",
            borderColor: path.includes(node.id.replace("node-", ""))
              ? "#d93636"
              : "#1677ff",
          },
        }));

        // Highlight edges in the path
        for (let i = 0; i < path.length - 1; i++) {
          const sourcePath = path[i];
          const targetPath = path[i + 1];

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
    }, [graphStore.currentGraph, graphStore.nodes, graphStore.currentPath]);

    const handleFindPath = async () => {
      if (!graphId || !sourceNode || !targetNode) return;

      setCalculatingPath(true);
      try {
        await graphStore.calculatePath(graphId, sourceNode, targetNode);
      } finally {
        setCalculatingPath(false);
      }
    };

    const availableNodes = useMemo(() => {
      if (graphStore.currentGraph) {
        return Object.keys(graphStore.currentGraph.graph.nodes).map(
          (nodeKey) => {
            const node = JSON.parse(nodeKey);
            return node.name;
          }
        );
      }
      return [];
    }, [graphStore.currentGraph]);

    return (
      <Card
        title="Визуализация топологии"
        bordered={false}
        style={{ height: "100%" }}
      >
        <ReactFlowProvider>
          <div style={{ height: 400 }}>
            <ReactFlow nodes={nodes} edges={edges} fitView key={forceUpdateKey}>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>

        {graphId && (
          <div style={{ marginTop: 20 }}>
            <Title level={5}>Поиск оптимального пути:</Title>
            <Form form={form} layout="inline" onFinish={handleFindPath}>
              <Form.Item
                name="sourceNode"
                label="Узел A"
                rules={[{ required: true, message: "Выберите исходный узел" }]}
              >
                <Select
                  style={{ width: 120 }}
                  placeholder="Выберите узел"
                  onChange={(value) => setSourceNode(value)}
                >
                  {availableNodes.map((node) => (
                    <Option key={node} value={node}>
                      {node}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="targetNode"
                label="Узел B"
                rules={[{ required: true, message: "Выберите целевой узел" }]}
              >
                <Select
                  style={{ width: 120 }}
                  placeholder="Выберите узел"
                  onChange={(value) => setTargetNode(value)}
                >
                  {availableNodes
                    .filter((node) => node !== sourceNode)
                    .map((node) => (
                      <Option key={node} value={node}>
                        {node}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={calculatingPath}
                >
                  Найти путь
                </Button>
              </Form.Item>
            </Form>

            {graphStore.currentPath && (
              <div style={{ marginTop: 16 }}>
                <Divider orientation="left">Результат</Divider>
                <Space direction="vertical">
                  <Text>Путь: {graphStore.currentPath.path.join(" → ")}</Text>
                  <Text>
                    Суммарный вес: {graphStore.currentPath.totalWeight}
                  </Text>
                </Space>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }
);

export default GraphVisualizer;
