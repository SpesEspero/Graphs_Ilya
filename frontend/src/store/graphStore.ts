import { makeAutoObservable } from "mobx";
import graphApi from "../api/graph";
import type {
  GraphRequest,
  GraphResponse,
  GraphPathResponse,
  NetworkNode,
  NetworkGraph,
  NetworkGraphEdge,
} from "../api/graph";
import authStore from "./authStore";

interface GraphItem {
  id: number;
  graph: NetworkGraph;
}

// Edge weights map: sourceNode-targetNode -> weight
interface EdgeWeights {
  [key: string]: number;
}

class GraphStore {
  graphs: GraphItem[] = [];
  currentGraph: GraphResponse | null = null;
  currentPath: GraphPathResponse | null = null;
  isLoading = false;
  error: string | null = null;

  // Graph building state
  nodes: NetworkNode[] = [];

  // Store edge weights separately
  edgeWeights: EdgeWeights = {};

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setGraphs(graphsData: Record<string, NetworkGraph> | null) {
    if (!graphsData) {
      this.graphs = [];
      return;
    }

    // Преобразуем объект вида { "1": графData, "2": графData } в массив
    this.graphs = Object.entries(graphsData).map(([id, graph]) => ({
      id: parseInt(id),
      graph,
    }));
  }

  setCurrentGraph(graph: GraphResponse | null) {
    this.currentGraph = graph;
  }

  setCurrentPath(path: GraphPathResponse | null) {
    this.currentPath = path;
  }

  // Add methods for edge weights handling
  setEdgeWeight(sourceNode: string, targetNode: string, weight: number) {
    const key = `${sourceNode}-${targetNode}`;
    this.edgeWeights[key] = weight;
  }

  getEdgeWeight(sourceNode: string, targetNode: string): number {
    const key = `${sourceNode}-${targetNode}`;
    return this.edgeWeights[key] || 0;
  }

  clearEdgeWeights() {
    this.edgeWeights = {};
  }

  // Node management for graph building
  addNode(name: string) {
    const newNode: NetworkNode = {
      name,
      parameters: [], // Empty parameters array for new nodes
      connectedNodes: [],
    };
    // Create a new array to ensure MobX detects the change
    this.nodes = [...this.nodes, newNode];
  }

  removeNode(name: string) {
    // Remove node
    const filteredNodes = this.nodes.filter((node) => node.name !== name);

    // Remove connections to this node from other nodes
    filteredNodes.forEach((node) => {
      node.connectedNodes = node.connectedNodes.filter((conn) => conn !== name);
    });

    // Clean up edge weights related to this node
    Object.keys(this.edgeWeights).forEach((key) => {
      if (key.startsWith(`${name}-`) || key.endsWith(`-${name}`)) {
        delete this.edgeWeights[key];
      }
    });

    // Create a new array to ensure MobX detects the change
    this.nodes = filteredNodes;
  }

  updateNodeConnection(sourceName: string, targetName: string, weight: number) {
    // Create a new array to ensure MobX detects the change
    const updatedNodes = [...this.nodes];
    const sourceNode = updatedNodes.find((node) => node.name === sourceName);
    if (!sourceNode) return;

    // Store the edge weight in our map
    this.setEdgeWeight(sourceName, targetName, weight);

    // Check if connection already exists
    const existingConnIdx = sourceNode.connectedNodes.indexOf(targetName);

    if (existingConnIdx >= 0) {
      // Update the parameter at the same index as the connection
      if (!sourceNode.parameters) sourceNode.parameters = [];
      sourceNode.parameters[existingConnIdx] = weight;
    } else {
      // Add new connection and parameter
      sourceNode.connectedNodes.push(targetName);
      if (!sourceNode.parameters) sourceNode.parameters = [];
      sourceNode.parameters.push(weight);
    }

    // Update the nodes array with our modified copy
    this.nodes = updatedNodes;
  }

  removeNodeConnection(sourceName: string, targetName: string) {
    // Create a new array to ensure MobX detects the change
    const updatedNodes = [...this.nodes];
    const sourceNode = updatedNodes.find((node) => node.name === sourceName);
    if (!sourceNode) return;

    // Find the index of the connection
    const connIndex = sourceNode.connectedNodes.indexOf(targetName);
    if (connIndex === -1) return;

    // Remove the connection
    sourceNode.connectedNodes = sourceNode.connectedNodes.filter(
      (_, idx) => idx !== connIndex
    );

    // Remove the corresponding parameter
    if (sourceNode.parameters) {
      sourceNode.parameters = sourceNode.parameters.filter(
        (_, idx) => idx !== connIndex
      );
    }

    // Remove the edge weight
    const key = `${sourceName}-${targetName}`;
    delete this.edgeWeights[key];

    // Update the nodes array with our modified copy
    this.nodes = updatedNodes;
  }

  resetNodes() {
    this.nodes = [];
    this.clearEdgeWeights();
  }

  // API calls
  async fetchUserGraphs() {
    if (!authStore.token) return;

    this.setLoading(true);
    this.setError(null);
    try {
      const response = await graphApi.getUserGraphs(authStore.token);
      this.setGraphs(response.graphs);
    } catch (error) {
      this.setError(
        error instanceof Error ? error.message : "Failed to fetch graphs"
      );
    } finally {
      this.setLoading(false);
    }
  }

  async fetchGraph(graphId: number) {
    if (!authStore.token) return;

    this.setLoading(true);
    this.setError(null);
    this.clearEdgeWeights(); // Clear edge weights before loading a new graph

    try {
      const response = await graphApi.getGraph(authStore.token, graphId);

      // Ensure we have graph data
      if (!response || !response.graph) {
        throw new Error("Invalid graph data received from server");
      }

      // Check if the response is in the new format with networkNodes
      if (
        response.graph.networkNodes &&
        Array.isArray(response.graph.networkNodes)
      ) {
        // Simply use the nodes directly
        this.nodes = response.graph.networkNodes.map((node) => ({
          name: node.name,
          parameters: [...node.parameters],
          connectedNodes: [...node.connectedNodes],
        }));

        // Populate the edge weights map for visualization
        this.nodes.forEach((node) => {
          node.connectedNodes.forEach((targetNode, index) => {
            const weight = node.parameters[index] || 0;
            this.setEdgeWeight(node.name, targetNode, weight);
          });
        });
      }
      // Fallback for old format (can be removed once backend is updated)
      else if (response.graph.nodes && Array.isArray(response.graph.nodes)) {
        // Create a temporary map to build nodes
        const nodeMap: Record<string, NetworkNode> = {};

        // First pass: create all nodes
        response.graph.nodes.forEach((node) => {
          if (node && node.name) {
            nodeMap[node.name] = {
              name: node.name,
              parameters: [],
              connectedNodes: [],
            };
          }
        });

        // Second pass: add connections and edge weights
        response.graph.nodes.forEach((node) => {
          if (node && node.name && node.edges && Array.isArray(node.edges)) {
            const sourceNode = nodeMap[node.name];

            if (sourceNode) {
              // Create a list to store parameters and connectedNodes in the same order
              const connectedNodes: string[] = [];
              const parameters: number[] = [];

              node.edges.forEach((edge: NetworkGraphEdge) => {
                if (edge && edge.to) {
                  // Get target node name (handle both string and object formats)
                  const targetName =
                    typeof edge.to === "string"
                      ? edge.to
                      : edge.to && edge.to.name
                      ? edge.to.name
                      : null;

                  if (targetName && nodeMap[targetName]) {
                    // Add connection
                    connectedNodes.push(targetName);

                    // Add parameter (weight)
                    parameters.push(edge.weight || 0);

                    // Store edge weight in our edge weights map
                    this.setEdgeWeight(node.name, targetName, edge.weight || 0);
                  }
                }
              });

              // Update the node with the correctly ordered parameters and connectedNodes
              sourceNode.connectedNodes = connectedNodes;
              sourceNode.parameters = parameters;
            }
          }
        });

        // Update our nodes array from the map
        this.nodes = Object.values(nodeMap);
      }

      this.setCurrentGraph(response);
    } catch (error) {
      this.setError(
        error instanceof Error ? error.message : "Failed to fetch graph"
      );
    } finally {
      this.setLoading(false);
    }
  }

  async createGraph() {
    if (!authStore.token || this.nodes.length === 0) return;

    this.setLoading(true);
    this.setError(null);
    try {
      // Prepare nodes for the backend with proper edge weights
      const transformedNodes = this.nodes.map((node) => {
        // Create a deep copy of the node
        const nodeCopy = {
          name: node.name,
          // Keep connected nodes in the same order as parameters
          connectedNodes: [...node.connectedNodes],
          // For each connected node, get the edge weight
          parameters: node.connectedNodes.map((targetNode) =>
            this.getEdgeWeight(node.name, targetNode)
          ),
        };

        return nodeCopy;
      });

      const request: GraphRequest = {
        networkNodes: transformedNodes,
      };

      const response = await graphApi.createGraph(authStore.token, request);
      this.setCurrentGraph(response);
      return response.id;
    } catch (error) {
      this.setError(
        error instanceof Error ? error.message : "Failed to create graph"
      );
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  async calculatePath(graphId: number, n1: string, n2: string) {
    if (!authStore.token) return;

    this.setLoading(true);
    this.setError(null);
    try {
      const response = await graphApi.calculatePath(
        authStore.token,
        graphId,
        n1,
        n2
      );
      this.setCurrentPath(response);
    } catch (error) {
      this.setError(
        error instanceof Error ? error.message : "Failed to calculate path"
      );
    } finally {
      this.setLoading(false);
    }
  }
}

const graphStore = new GraphStore();
export default graphStore;
