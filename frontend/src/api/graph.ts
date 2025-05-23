import apiClient from "./axios";

export interface NetworkNode {
  name: string;
  parameters: number[];
  connectedNodes: string[];
}

export interface GraphRequest {
  networkNodes: NetworkNode[];
}

export interface NetworkGraphNode {
  name: string;
  value: number;
  edges: NetworkGraphEdge[];
}

export interface NetworkGraphEdge {
  weight: number;
  to: string | NetworkGraphNode;
}

export interface NetworkGraph {
  nodes?: NetworkGraphNode[];
  networkNodes?: NetworkNode[];
}

export interface GraphResponse {
  id: number;
  graph: NetworkGraph;
}

export interface GraphListResponse {
  graphs: Record<string, NetworkGraph> | null;
}

export interface GraphPathResponse {
  path: string[];
  totalWeight: number;
}

const graphApi = {
  createGraph: async (
    token: string,
    data: GraphRequest
  ): Promise<GraphResponse> => {
    const response = await apiClient.post(`/graph?token=${token}`, data);
    return response.data;
  },

  getUserGraphs: async (token: string): Promise<GraphListResponse> => {
    const response = await apiClient.get(`/graph?token=${token}`);
    return response.data;
  },

  getGraph: async (token: string, graphId: number): Promise<GraphResponse> => {
    const response = await apiClient.get(`/graph/${graphId}?token=${token}`);
    return response.data;
  },

  calculatePath: async (
    token: string,
    graphId: number,
    n1: string,
    n2: string
  ): Promise<GraphPathResponse> => {
    const response = await apiClient.get(
      `/graph/${graphId}/path?token=${token}&n1=${n1}&n2=${n2}`
    );
    return response.data;
  },
};

export default graphApi;
