import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Typography,
  Space,
  InputNumber,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import graphStore from "../store/graphStore";

const { Title, Text } = Typography;

const NodeCreator: React.FC = observer(() => {
  const [nodeName, setNodeName] = useState<string>("");
  const [selectedSourceNode, setSelectedSourceNode] = useState<string | null>(
    null
  );
  const [selectedTargetNode, setSelectedTargetNode] = useState<string | null>(
    null
  );
  const [connectionWeight, setConnectionWeight] = useState<number>(1);

  const handleAddNode = () => {
    try {
      const nodeNameValue = nodeName.trim();

      if (!nodeNameValue) {
        message.error("Название узла не может быть пустым");
        return;
      }

      if (graphStore.nodes.some((n) => n.name === nodeNameValue)) {
        message.error(`Узел с названием "${nodeNameValue}" уже существует`);
        return;
      }

      graphStore.addNode(nodeNameValue);
      // Очищаем поле ввода после добавления узла
      setNodeName("");
      message.success(`Узел "${nodeNameValue}" успешно добавлен`);
    } catch (error) {
      console.error("Error adding node:", error);
      message.error("Произошла ошибка при добавлении узла");
    }
  };

  const handleDeleteNode = (nodeName: string) => {
    try {
      graphStore.removeNode(nodeName);
      message.success(`Узел "${nodeName}" удален`);
    } catch (error) {
      console.error("Error deleting node:", error);
      message.error("Произошла ошибка при удалении узла");
    }
  };

  const handleAddConnection = (values: {
    targetNode: string;
    weight: number;
  }) => {
    try {
      if (!selectedSourceNode || !selectedTargetNode) {
        message.error("Необходимо выбрать оба узла");
        return;
      }

      if (!values.weight || values.weight < 1) {
        message.error("Вес соединения должен быть положительным числом");
        return;
      }

      // Проверяем, существует ли уже соединение
      const sourceNode = graphStore.nodes.find(
        (n) => n.name === selectedSourceNode
      );
      const existingConnection =
        sourceNode?.connectedNodes.includes(selectedTargetNode);

      graphStore.updateNodeConnection(
        selectedSourceNode,
        selectedTargetNode,
        values.weight
      );

      if (existingConnection) {
        message.success(
          `Соединение ${selectedSourceNode} → ${selectedTargetNode} обновлено с весом ${values.weight}`
        );
      } else {
        message.success(
          `Соединение ${selectedSourceNode} → ${selectedTargetNode} добавлено с весом ${values.weight}`
        );
      }

      // Сбрасываем выбор узла B, но сохраняем выбор узла A для возможности добавления нескольких соединений
      setSelectedTargetNode(null);
      setConnectionWeight(1);
    } catch (error) {
      console.error("Error adding connection:", error);
      message.error("Произошла ошибка при добавлении соединения");
    }
  };

  const handleRemoveConnection = (sourceName: string, targetName: string) => {
    try {
      graphStore.removeNodeConnection(sourceName, targetName);
      message.success(`Соединение удалено`);
    } catch (error) {
      console.error("Error removing connection:", error);
      message.error("Произошла ошибка при удалении соединения");
    }
  };

  return (
    <div>
      <Card title="Создание топологии сети" bordered={false}>
        <div style={{ marginBottom: 16, display: "flex" }}>
          <Input
            placeholder="Введите название узла"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            style={{ flex: 1, marginRight: 16 }}
            onPressEnter={() => {
              if (nodeName.trim()) {
                handleAddNode();
              }
            }}
          />
          <Button
            type="primary"
            htmlType="button"
            icon={<PlusOutlined />}
            onClick={() => {
              if (nodeName.trim()) {
                handleAddNode();
              } else {
                message.error("Введите имя узла");
              }
            }}
          >
            Добавить узел
          </Button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Title level={5}>
            Список узлов
            {graphStore.nodes.length > 0 ? ` (${graphStore.nodes.length})` : ""}
            :
          </Title>
          {graphStore.nodes.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                border: "1px dashed #d9d9d9",
                borderRadius: "8px",
                color: "#666",
              }}
            >
              Список пуст. Добавьте узлы, чтобы создать топологию.
            </div>
          ) : (
            <List
              size="small"
              bordered
              dataSource={graphStore.nodes}
              renderItem={(node, index) => (
                <List.Item
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      danger
                      htmlType="button"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteNode(node.name)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={`${index + 1}. ${node.name}`}
                    description={
                      node.connectedNodes.length > 0 && (
                        <div style={{ paddingLeft: 16 }}>
                          {node.connectedNodes.map(
                            (connectedNodeName, cIdx) => (
                              <div
                                key={cIdx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 4,
                                }}
                              >
                                <Text>{connectedNodeName}</Text>
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  htmlType="button"
                                  icon={<DeleteOutlined />}
                                  onClick={() =>
                                    handleRemoveConnection(
                                      node.name,
                                      connectedNodeName
                                    )
                                  }
                                />
                              </div>
                            )
                          )}
                        </div>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {graphStore.nodes.length > 1 && (
          <div>
            <Title level={5}>Добавить соединение:</Title>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Узел A (источник):</strong>
                </div>
                <Space wrap>
                  {graphStore.nodes.map((node, idx) => (
                    <Button
                      key={idx}
                      size="middle"
                      type={
                        selectedSourceNode === node.name ? "primary" : "default"
                      }
                      htmlType="button"
                      onClick={() => {
                        setSelectedSourceNode(node.name);
                      }}
                    >
                      {node.name}
                    </Button>
                  ))}
                </Space>
              </div>

              {selectedSourceNode && (
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Узел B (назначение):</strong>
                  </div>
                  <Space wrap>
                    {graphStore.nodes
                      .filter((node) => node.name !== selectedSourceNode)
                      .map((node, idx) => (
                        <Button
                          key={idx}
                          size="middle"
                          type={
                            selectedTargetNode === node.name
                              ? "primary"
                              : "default"
                          }
                          htmlType="button"
                          onClick={() => {
                            setSelectedTargetNode(node.name);
                          }}
                        >
                          {node.name}
                        </Button>
                      ))}
                  </Space>
                </div>
              )}

              {selectedSourceNode && selectedTargetNode && (
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Вес соединения:</strong>
                  </div>
                  <InputNumber
                    placeholder="Вес"
                    min={1}
                    value={connectionWeight}
                    onChange={(value) => setConnectionWeight(value ?? 1)}
                    style={{ width: "100px" }}
                  />
                </div>
              )}

              {selectedSourceNode && selectedTargetNode && (
                <Button
                  type="primary"
                  htmlType="button"
                  onClick={() => {
                    const targetNode = selectedTargetNode;
                    const weight = connectionWeight;

                    if (!selectedSourceNode || !targetNode) {
                      message.error("Выберите оба узла");
                      return;
                    }

                    if (!weight || weight < 1) {
                      message.error("Введите вес (минимум 1)");
                      return;
                    }

                    handleAddConnection({
                      targetNode,
                      weight,
                    });
                  }}
                >
                  Добавить/Обновить соединение
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

export default NodeCreator;
