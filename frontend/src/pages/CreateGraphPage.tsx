import React, { useState, useEffect, useMemo } from "react";
import { Typography, Row, Col, Button, notification } from "antd";
import { LeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import NodeCreator from "../components/NodeCreator";
import GraphVisualizer from "../components/GraphVisualizer";
import graphStore from "../store/graphStore";

const { Title } = Typography;

const CreateGraphPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Check if the graph meets minimum requirements to be saved
  const canSaveGraph = useMemo(() => {
    // Need at least 2 nodes
    if (graphStore.nodes.length < 2) return false;

    // Need at least one connection
    const hasConnections = graphStore.nodes.some(
      (node) => node.connectedNodes.length > 0
    );

    return hasConnections;
  }, [graphStore.nodes]);

  // Prevent form submission
  useEffect(() => {
    const handleSubmit = (e: Event) => {
      if (e.target instanceof HTMLFormElement) {
        e.preventDefault();
      }
    };

    document.addEventListener("submit", handleSubmit);

    return () => {
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  const handleSaveGraph = async () => {
    if (graphStore.nodes.length < 2) {
      notification.error({
        message: "Ошибка сохранения",
        description: "Добавьте как минимум 2 узла для создания графа",
      });
      return;
    }

    // Check if nodes have connections
    const hasConnections = graphStore.nodes.some(
      (node) => node.connectedNodes.length > 0
    );
    if (!hasConnections) {
      notification.error({
        message: "Ошибка сохранения",
        description: "Добавьте хотя бы одно соединение между узлами",
      });
      return;
    }

    setSaving(true);
    try {
      const graphId = await graphStore.createGraph();
      if (graphId) {
        notification.success({
          message: "Успешно",
          description: "Граф успешно сохранен",
        });
        navigate(`/graph/${graphId}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Button
            type="link"
            htmlType="button"
            icon={<LeftOutlined />}
            onClick={() => navigate("/dashboard")}
            style={{ marginBottom: 8 }}
          >
            Назад к списку
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Создание новой топологии сети
          </Title>
        </div>

        {canSaveGraph && (
          <Button
            type="primary"
            htmlType="button"
            icon={<SaveOutlined />}
            onClick={handleSaveGraph}
            loading={saving}
            size="large"
          >
            Сохранить граф
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <NodeCreator />
        </Col>
        <Col xs={24} lg={12}>
          <GraphVisualizer />
        </Col>
      </Row>
    </div>
  );
});

export default CreateGraphPage;
