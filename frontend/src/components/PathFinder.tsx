import React, { useState, useMemo } from "react";
import { Card, Select, Button, Form, Divider, Radio, Table, Alert } from "antd";
import { observer } from "mobx-react-lite";
import type { NetworkNode } from "../api/graph";

const { Option } = Select;

interface PathFinderProps {
  networkNodes: NetworkNode[];
  onPathHighlight?: (path: string[]) => void;
}

interface PathResult {
  algorithm: string;
  path: string[];
  totalWeight: number;
}

type Algorithm = "dijkstra" | "astar" | "bellman-ford" | "edmonds-karp" | "all";

// Класс для представления графа
class Graph {
  private nodes: Map<string, NetworkNode>;
  private adjacencyList: Map<string, Array<{ node: string; weight: number }>>;

  constructor(networkNodes: NetworkNode[]) {
    this.nodes = new Map();
    this.adjacencyList = new Map();

    // Инициализируем граф
    networkNodes.forEach((node) => {
      this.nodes.set(node.name, node);
      this.adjacencyList.set(node.name, []);
    });

    // Строим список смежности
    networkNodes.forEach((node) => {
      const neighbors = this.adjacencyList.get(node.name) || [];
      node.connectedNodes.forEach((connectedName, index) => {
        const weight = node.parameters[index] || 0;
        neighbors.push({ node: connectedName, weight });
      });
    });
  }

  getNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  getNeighbors(node: string): Array<{ node: string; weight: number }> {
    return this.adjacencyList.get(node) || [];
  }

  getAllEdges(): Array<{ from: string; to: string; weight: number }> {
    const edges: Array<{ from: string; to: string; weight: number }> = [];
    this.adjacencyList.forEach((neighbors, from) => {
      neighbors.forEach(({ node: to, weight }) => {
        edges.push({ from, to, weight });
      });
    });
    return edges;
  }
}

// Приоритетная очередь для алгоритмов
class PriorityQueue<T> {
  private items: Array<{ element: T; priority: number }> = [];

  enqueue(element: T, priority: number): void {
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const PathFinder: React.FC<PathFinderProps> = observer(
  ({ networkNodes, onPathHighlight }) => {
    const [sourceNode, setSourceNode] = useState<string>("");
    const [targetNode, setTargetNode] = useState<string>("");
    const [selectedAlgorithm, setSelectedAlgorithm] =
      useState<Algorithm>("dijkstra");
    const [results, setResults] = useState<PathResult[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    const [form] = Form.useForm();

    const graph = useMemo(() => {
      return new Graph(networkNodes);
    }, [networkNodes]);

    const availableNodes = useMemo(() => {
      return graph.getNodes();
    }, [graph]);

    // Алгоритм Дейкстры
    const dijkstra = (start: string, end: string): PathResult => {
      const distances = new Map<string, number>();
      const previous = new Map<string, string | null>();
      const visited = new Set<string>();
      const pq = new PriorityQueue<string>();

      // Инициализация
      graph.getNodes().forEach((node) => {
        distances.set(node, node === start ? 0 : Infinity);
        previous.set(node, null);
      });

      pq.enqueue(start, 0);

      while (!pq.isEmpty()) {
        const current = pq.dequeue()!;

        if (visited.has(current)) continue;
        visited.add(current);

        if (current === end) break;

        graph.getNeighbors(current).forEach(({ node: neighbor, weight }) => {
          if (visited.has(neighbor)) return;

          const newDistance = distances.get(current)! + weight;
          if (newDistance < distances.get(neighbor)!) {
            distances.set(neighbor, newDistance);
            previous.set(neighbor, current);
            pq.enqueue(neighbor, newDistance);
          }
        });
      }

      // Восстановление пути
      const path: string[] = [];
      let currentNode: string | null = end;
      while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = previous.get(currentNode) || null;
      }

      const totalWeight = distances.get(end) || Infinity;

      return {
        algorithm: "Dijkstra",
        path: totalWeight === Infinity ? [] : path,
        totalWeight: totalWeight === Infinity ? -1 : totalWeight,
      };
    };

    // Алгоритм A* (эвристическая функция - расстояние по индексам узлов)
    const aStar = (start: string, end: string): PathResult => {
      const nodes = graph.getNodes();
      const endIndex = nodes.indexOf(end);

      // Простая эвристическая функция - разность индексов
      const heuristic = (node: string): number => {
        const nodeIndex = nodes.indexOf(node);
        return Math.abs(nodeIndex - endIndex);
      };

      const gScore = new Map<string, number>();
      const fScore = new Map<string, number>();
      const previous = new Map<string, string | null>();
      const openSet = new PriorityQueue<string>();
      const closedSet = new Set<string>();

      // Инициализация
      graph.getNodes().forEach((node) => {
        gScore.set(node, node === start ? 0 : Infinity);
        fScore.set(node, node === start ? heuristic(start) : Infinity);
        previous.set(node, null);
      });

      openSet.enqueue(start, fScore.get(start)!);

      while (!openSet.isEmpty()) {
        const current = openSet.dequeue()!;

        if (current === end) break;

        closedSet.add(current);

        graph.getNeighbors(current).forEach(({ node: neighbor, weight }) => {
          if (closedSet.has(neighbor)) return;

          const tentativeGScore = gScore.get(current)! + weight;

          if (tentativeGScore < gScore.get(neighbor)!) {
            previous.set(neighbor, current);
            gScore.set(neighbor, tentativeGScore);
            fScore.set(neighbor, tentativeGScore + heuristic(neighbor));
            openSet.enqueue(neighbor, fScore.get(neighbor)!);
          }
        });
      }

      // Восстановление пути
      const path: string[] = [];
      let currentNode: string | null = end;
      while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = previous.get(currentNode) || null;
      }

      const totalWeight = gScore.get(end) || Infinity;

      return {
        algorithm: "A*",
        path: totalWeight === Infinity ? [] : path,
        totalWeight: totalWeight === Infinity ? -1 : totalWeight,
      };
    };

    // Алгоритм Беллмана-Форда
    const bellmanFord = (start: string, end: string): PathResult => {
      const distances = new Map<string, number>();
      const previous = new Map<string, string | null>();
      const nodes = graph.getNodes();
      const edges = graph.getAllEdges();

      // Инициализация
      nodes.forEach((node) => {
        distances.set(node, node === start ? 0 : Infinity);
        previous.set(node, null);
      });

      // Релаксация рёбер V-1 раз
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.forEach(({ from, to, weight }) => {
          const distanceToFrom = distances.get(from)!;
          const distanceTo = distances.get(to)!;

          if (
            distanceToFrom !== Infinity &&
            distanceToFrom + weight < distanceTo
          ) {
            distances.set(to, distanceToFrom + weight);
            previous.set(to, from);
          }
        });
      }

      // Проверка на отрицательные циклы
      let hasNegativeCycle = false;
      edges.forEach(({ from, to, weight }) => {
        const distanceToFrom = distances.get(from)!;
        const distanceTo = distances.get(to)!;

        if (
          distanceToFrom !== Infinity &&
          distanceToFrom + weight < distanceTo
        ) {
          hasNegativeCycle = true;
        }
      });

      // Восстановление пути
      const path: string[] = [];
      if (!hasNegativeCycle) {
        let currentNode: string | null = end;
        while (currentNode !== null) {
          path.unshift(currentNode);
          currentNode = previous.get(currentNode) || null;
        }
      }

      const totalWeight = distances.get(end) || Infinity;

      return {
        algorithm: "Bellman-Ford",
        path: hasNegativeCycle || totalWeight === Infinity ? [] : path,
        totalWeight:
          hasNegativeCycle || totalWeight === Infinity ? -1 : totalWeight,
      };
    };

    // Алгоритм Эдмондса-Карпа (максимальный поток)
    const edmondsKarp = (start: string, end: string): PathResult => {
      const nodes = graph.getNodes();
      const capacity = new Map<string, Map<string, number>>();
      const flow = new Map<string, Map<string, number>>();

      // Инициализация матриц пропускной способности и потока
      nodes.forEach((from) => {
        capacity.set(from, new Map());
        flow.set(from, new Map());
        nodes.forEach((to) => {
          capacity.get(from)!.set(to, 0);
          flow.get(from)!.set(to, 0);
        });
      });

      // Заполнение пропускных способностей
      graph.getAllEdges().forEach(({ from, to, weight }) => {
        capacity.get(from)!.set(to, Math.max(weight, 0)); // Только положительные веса
      });

      let maxFlow = 0;
      let lastPath: string[] = [];

      // BFS для поиска дополняющего пути
      const bfs = (): string[] => {
        const visited = new Set<string>();
        const queue: string[] = [start];
        const parent = new Map<string, string>();
        visited.add(start);

        while (queue.length > 0) {
          const current = queue.shift()!;

          if (current === end) {
            // Восстановление пути
            const path: string[] = [];
            let node = end;
            while (node !== start) {
              path.unshift(node);
              node = parent.get(node)!;
            }
            path.unshift(start);
            return path;
          }

          nodes.forEach((neighbor) => {
            if (
              !visited.has(neighbor) &&
              capacity.get(current)!.get(neighbor)! >
                flow.get(current)!.get(neighbor)!
            ) {
              visited.add(neighbor);
              parent.set(neighbor, current);
              queue.push(neighbor);
            }
          });
        }

        return [];
      };

      // Основной цикл алгоритма
      while (true) {
        const path = bfs();
        if (path.length === 0) break;

        // Находим минимальную остаточную пропускную способность вдоль пути
        let minCapacity = Infinity;
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i];
          const to = path[i + 1];
          const residualCapacity =
            capacity.get(from)!.get(to)! - flow.get(from)!.get(to)!;
          minCapacity = Math.min(minCapacity, residualCapacity);
        }

        // Обновляем поток вдоль пути
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i];
          const to = path[i + 1];
          flow.get(from)!.set(to, flow.get(from)!.get(to)! + minCapacity);
          flow.get(to)!.set(from, flow.get(to)!.get(from)! - minCapacity);
        }

        maxFlow += minCapacity;
        lastPath = path;
      }

      return {
        algorithm: "Edmonds-Karp",
        path: lastPath,
        totalWeight: maxFlow,
      };
    };

    const handleFindPath = async () => {
      if (!sourceNode || !targetNode) return;

      setIsCalculating(true);
      try {
        const algorithms = {
          dijkstra: () => dijkstra(sourceNode, targetNode),
          astar: () => aStar(sourceNode, targetNode),
          "bellman-ford": () => bellmanFord(sourceNode, targetNode),
          "edmonds-karp": () => edmondsKarp(sourceNode, targetNode),
        };

        if (selectedAlgorithm === "all") {
          // Запускаем все алгоритмы
          const results: PathResult[] = [];
          Object.values(algorithms).forEach((algorithm) => {
            results.push(algorithm());
          });
          setResults(results);
        } else {
          // Запускаем выбранный алгоритм
          const result = algorithms[selectedAlgorithm]();
          setResults([result]);

          // Подсвечиваем путь
          if (result.path.length > 0 && onPathHighlight) {
            onPathHighlight(result.path);
          }
        }
      } finally {
        setIsCalculating(false);
      }
    };

    const columns = [
      {
        title: "Алгоритм",
        dataIndex: "algorithm",
        key: "algorithm",
      },
      {
        title: "Путь",
        dataIndex: "path",
        key: "path",
        render: (path: string[]) =>
          path.length > 0 ? path.join(" → ") : "Путь не найден",
      },
      {
        title: "Вес/Поток",
        dataIndex: "totalWeight",
        key: "totalWeight",
        render: (weight: number) => (weight === -1 ? "∞" : weight),
      },
    ];

    return (
      <Card title="Поиск оптимального пути" bordered={false}>
        <Form form={form} layout="inline" onFinish={handleFindPath}>
          <Form.Item
            name="sourceNode"
            label="Исходный узел"
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
            label="Целевой узел"
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

          <Form.Item name="algorithm" label="Алгоритм">
            <Radio.Group
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            >
              <Radio value="dijkstra">Дейкстры</Radio>
              <Radio value="astar">A*</Radio>
              <Radio value="bellman-ford">Беллмана-Форда</Radio>
              <Radio value="edmonds-karp">Эдмондса-Карпа</Radio>
              <Radio value="all">Все алгоритмы</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isCalculating}>
              Найти путь
            </Button>
          </Form.Item>
        </Form>

        {results.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Divider orientation="left">Результаты</Divider>

            {selectedAlgorithm === "edmonds-karp" && (
              <Alert
                message="Алгоритм Эдмондса-Карпа"
                description="Этот алгоритм ищет максимальный поток, а не кратчайший путь. Результат показывает максимальную пропускную способность между узлами."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              dataSource={results}
              columns={columns}
              pagination={false}
              rowKey="algorithm"
              size="small"
            />
          </div>
        )}
      </Card>
    );
  }
);

export default PathFinder;
