import React, { useEffect } from "react";
import { Typography, Button, List, Card, Spin } from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import graphStore from "../store/graphStore";

const { Title, Text, Paragraph } = Typography;

const EmptyGraphsState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        margin: "20px 0",
        background: "#f9f9f9",
        borderRadius: "8px",
        border: "1px dashed #d9d9d9",
      }}
    >
      <InboxOutlined
        style={{ fontSize: 64, color: "#1677ff", marginBottom: 16 }}
      />

      <Title level={3}>У вас пока нет графов</Title>

      <Paragraph
        style={{
          fontSize: "16px",
          color: "#666",
          maxWidth: "600px",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Создайте ваш первый граф сети, добавьте узлы и связи между ними, чтобы
        визуализировать топологию и рассчитать оптимальные пути.
      </Paragraph>

      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">Как начать:</Text>
        <ul style={{ listStyleType: "decimal", marginLeft: 20, marginTop: 8 }}>
          <li>Нажмите кнопку "Создать новый граф"</li>
          <li>Добавьте узлы и задайте связи между ними с метриками</li>
          <li>Сохраните граф и начните поиск оптимальных путей</li>
        </ul>
      </div>

      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={onCreate}
      >
        Создать новый граф
      </Button>
    </div>
  );
};

const DashboardPage: React.FC = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    graphStore.fetchUserGraphs();
  }, []);

  const handleCreateGraph = () => {
    graphStore.resetNodes();
    navigate("/create-graph");
  };

  const handleViewGraph = (graphId: number) => {
    navigate(`/graph/${graphId}`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>Мои сетевые графы</Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateGraph}
        >
          Создать новый граф
        </Button>
      </div>

      {graphStore.isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin size="large" tip="Загрузка графов..." />
        </div>
      ) : graphStore.graphs && graphStore.graphs.length > 0 ? (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          dataSource={graphStore.graphs}
          renderItem={(graph) => (
            <List.Item>
              <Card
                hoverable
                title={`Граф #${graph.id}`}
                onClick={() => handleViewGraph(graph.id)}
                style={{ height: "100%" }}
                actions={[
                  <Button
                    type="link"
                    icon={<ProjectOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewGraph(graph.id);
                    }}
                  >
                    Посмотреть
                  </Button>,
                ]}
              >
                <div
                  style={{
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ProjectOutlined style={{ fontSize: 64, opacity: 0.6 }} />
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <EmptyGraphsState onCreate={handleCreateGraph} />
      )}
    </div>
  );
});

export default DashboardPage;
