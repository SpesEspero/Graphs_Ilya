import React, { useEffect } from "react";
import { Typography, Row, Col, Button, Spin } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import GraphVisualizer from "../components/GraphVisualizer";
import graphStore from "../store/graphStore";

const { Title } = Typography;

const ViewGraphPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const { graphId } = useParams<{ graphId: string }>();

  useEffect(() => {
    if (graphId) {
      graphStore.fetchGraph(parseInt(graphId));
    }

    return () => {
      // Clear current graph and path when leaving
      graphStore.setCurrentGraph(null);
      graphStore.setCurrentPath(null);
    };
  }, [graphId]);

  // Add debugging information (can be removed in production)
  useEffect(() => {
    if (graphStore.currentGraph) {
      console.log("Graph data loaded:", graphStore.currentGraph);
      console.log("Nodes array:", graphStore.nodes);

      // Проверяем новый формат данных
      if (
        graphStore.currentGraph.graph &&
        graphStore.currentGraph.graph.networkNodes
      ) {
        console.log(
          "NetworkNodes (новый формат):",
          graphStore.currentGraph.graph.networkNodes
        );
      }

      // Проверяем старый формат данных
      if (
        graphStore.currentGraph.graph &&
        graphStore.currentGraph.graph.nodes
      ) {
        console.log(
          "Nodes (старый формат):",
          graphStore.currentGraph.graph.nodes
        );
      }
    }
  }, [graphStore.currentGraph, graphStore.nodes]);

  if (graphStore.isLoading) {
    return (
      <div
        style={{
          padding: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Загрузка графа..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <Button
          type="link"
          icon={<LeftOutlined />}
          onClick={() => navigate("/dashboard")}
          style={{ marginRight: 16 }}
        >
          Назад к списку
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          Визуализация сети {graphId && `#${graphId}`}
        </Title>
      </div>

      <Row justify="center">
        <Col xs={24} lg={20}>
          {graphId && <GraphVisualizer graphId={parseInt(graphId)} />}
        </Col>
      </Row>
    </div>
  );
});

export default ViewGraphPage;
