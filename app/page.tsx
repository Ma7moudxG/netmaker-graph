/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Graph } from "./components/Graph";
import React, { useEffect, useState, useCallback } from "react";
import { Node, Edge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { SearchBar } from "./components/SearchBar";
import { GraphKeyboardNavigator } from "./components/GraphKeyboardNavigator";

// Define NodeData type, which extends Record<string, unknown>
interface NodeData extends Record<string, unknown> {
  label: string;
}

export default function Home() {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]); // Properly typed Node state
  const [edges, setEdges] = useState<Edge[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<Node<NodeData>[]>([]);
  const [filteredEdges, setFilteredEdges] = useState<Edge[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [focusedNode, setFocusedNode] = useState<Node<NodeData> | null>(null);

  const handleFocusNode = (node: Node<NodeData>) => {
    setFocusedNode(node);
  };

  
  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  

  useEffect(() => {
    // This code runs only on the client side because window is only available in the browser
    if (typeof window !== 'undefined') {
      // Set initial dimensions
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Set up event listener for resize
      const handleResize = () => {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // Listen for window resize events
      window.addEventListener("resize", handleResize);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("https://graph-server.netlify.app/nodes")
      .then((res) => res.json())
      .then((data) => {
        fetch("https://graph-server.netlify.app/edges")
          .then((res) => res.json())
          .then((edgeData) => {
            const edgeCounts: Record<string, number> = edgeData.reduce(
              (acc: Record<string, number>, edge: any) => {
                acc[edge.source] = (acc[edge.source] || 0) + 1;
                acc[edge.target] = (acc[edge.target] || 0) + 1;
                return acc;
              },
              {}
            );

            const isSmallScreen = viewportSize.width < 768; 

            const centerX = viewportSize.width / 2;
            const centerY = viewportSize.height / 2;
            const radiusX = isSmallScreen
              ? Math.min(viewportSize.width, viewportSize.height) / 3
              : viewportSize.width / 4; 
            const radiusY = isSmallScreen
              ? Math.min(viewportSize.height, viewportSize.width) / 2.2
              : viewportSize.height / 4;
            const angleStep = (2 * Math.PI) / data.length;

            const processedNodes = data.map((node: any, index: number) => {
              const angle = index * angleStep;
              const connections = edgeCounts[node.id] || 0;

              return {
                id: String(node.id),
                type: "",
                data: { label: node.data.label },
                position: isSmallScreen
                  ? {
                      x: centerX + radiusX * Math.cos(angle),
                      y:
                        centerY +
                        radiusY * Math.sin(angle) * (connections > 2 ? 1.2 : 1),
                    }
                  : {
                      x: centerX + radiusX * Math.cos(angle),
                      y: centerY + radiusY * Math.sin(angle),
                    },
                style: {
                  background: node.color,
                  width: 50 * (connections > 2 ? 1.2 : 1),
                  height: 50 * (connections > 2 ? 1.2 : 1),
                  borderRadius: "50%",
                },
              };
            });

            const processedEdges = edgeData.map((edge: any) => ({
              id: `${edge.source}-${edge.target}`,
              source: String(edge.source),
              target: String(edge.target),
              animated: edge.animated ?? false,
              style: { stroke: edge.color },
              markerEnd: edge.markerEnd || undefined,
            }));

            setNodes(processedNodes);
            setFilteredNodes(processedNodes);
            setEdges(processedEdges);
            setFilteredEdges(processedEdges);
          })
          .catch((err) => setError("Failed to fetch edges: " + err.message))
          .finally(() => setLoading(false));
      })
      .catch((err) => setError("Failed to fetch nodes: " + err.message))
      .finally(() => setLoading(false));
  }, [viewportSize]);

  const filterGraph = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();

    const filteredNodeIds = new Set(
      nodes
        .filter((node) =>
          node.data.label.toLowerCase().includes(lowerCaseQuery)
        )
        .map((node) => node.id)
    );

    setFilteredNodes(
      nodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: filteredNodeIds.has(node.id) ? 1 : 0.3,
        },
      }))
    );

    setFilteredEdges(
      edges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          opacity:
            filteredNodeIds.has(edge.source) || filteredNodeIds.has(edge.target)
              ? 1
              : 0.2,
        },
      }))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    filterGraph(value);
  };

  const onNodeChange = useCallback(
    (changes: any) => setFilteredNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgeChange = useCallback(
    (changes: any) => setFilteredEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center"
      role="main"
    >
      <SearchBar query={query} onChange={handleInputChange} />

      {loading && <p role="status">Loading graph data...</p>}
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}

      {!loading && !filteredNodes.length && !error && (
        <p className="text-gray-500">No nodes found for {query}.</p>
      )}

      <p>Use keyboard to navigate between nodes</p>

      <div
        className="w-[100%] h-[100%] relative"
        tabIndex={0}
        role="application"
        aria-label="Interactive Graph"
      >
        <Graph
          nodes={filteredNodes.map((node) =>
            node.id === focusedNode?.id
              ? { ...node, style: { ...node.style, border: "3px solid blue" } }
              : node
          )}
          edges={filteredEdges}
          onNodeChange={onNodeChange}
          onEdgeChange={onEdgeChange}
          selectedNode={focusedNode}
        />

        <GraphKeyboardNavigator
          nodes={filteredNodes}
          onFocusNode={(node) => handleFocusNode(node as Node<NodeData>)} // Explicit type casting
        />
      </div>
    </div>
  );
}
