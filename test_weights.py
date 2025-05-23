#!/usr/bin/env python3
import requests
import json

# Конфигурация API
BASE_URL = "http://localhost:8080"
TOKEN = "your-test-token"  # Замените на ваш токен

def test_create_graph_with_weights():
    """Тестирует создание графа с правильными весами"""
    
    # Данные для создания графа в новом формате
    graph_data = {
        "networkNodes": [
            {
                "name": "A",
                "parameters": [2, 3],
                "connectedNodes": ["B", "C"]
            },
            {
                "name": "B", 
                "parameters": [5],
                "connectedNodes": ["C"]
            },
            {
                "name": "C",
                "parameters": [],
                "connectedNodes": []
            }
        ]
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    print("Creating graph with weights...")
    print("Input data:", json.dumps(graph_data, indent=2))
    
    # Создаем граф
    response = requests.post(
        f"{BASE_URL}/graph",
        headers=headers,
        json=graph_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print("Graph created successfully!")
        print("Response:", json.dumps(result, indent=2))
        
        graph_id = result.get("id")
        if graph_id:
            print(f"\nFetching graph {graph_id}...")
            
            # Получаем созданный граф
            get_response = requests.get(
                f"{BASE_URL}/graph/{graph_id}",
                headers=headers
            )
            
            if get_response.status_code == 200:
                graph_result = get_response.json()
                print("Retrieved graph:")
                print(json.dumps(graph_result, indent=2))
                
                # Проверяем networkNodes
                if "networkNodes" in graph_result.get("graph", {}):
                    network_nodes = graph_result["graph"]["networkNodes"]
                    print("\nValidating weights:")
                    
                    for node in network_nodes:
                        name = node.get("name")
                        parameters = node.get("parameters", [])
                        connected_nodes = node.get("connectedNodes", [])
                        
                        print(f"Node {name}: parameters={parameters}, connections={connected_nodes}")
                        
                        if len(parameters) != len(connected_nodes):
                            print(f"ERROR: Mismatch in node {name} - parameters count != connections count")
                        else:
                            print(f"OK: Node {name} has matching parameters and connections")
                else:
                    print("ERROR: No networkNodes found in response!")
            else:
                print(f"Failed to get graph: {get_response.status_code}")
                print(get_response.text)
    else:
        print(f"Failed to create graph: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    try:
        test_create_graph_with_weights()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the Spring Boot app is running on localhost:8080")
    except Exception as e:
        print(f"Error: {e}") 