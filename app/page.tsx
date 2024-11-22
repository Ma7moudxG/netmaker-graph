/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Graph } from "./components/Graph";
import React, { useEffect, useState, useCallback } from "react";
import { Node, Edge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { SearchBar } from "./components/SearchBar";
import { GraphKeyboardNavigator } from "./components/GraphKeyboardNavigator"; // Import the component

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [filteredEdges, setFilteredEdges] = useState<Edge[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [focusedNode, setFocusedNode] = useState<Node | null>(null);

  // Callback when a node gains focus
  const handleFocusNode = (node: Node) => {
    setFocusedNode(node);

    console.log(`Focused Node: ${node.data.label}`);
  };

  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update viewport on resizing
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

            const isSmallScreen = viewportSize.width < 768; // Small screens

            // layouts parameters
            const centerX = viewportSize.width / 2;
            const centerY = viewportSize.height / 2;
            const radiusX = isSmallScreen
              ? Math.min(viewportSize.width, viewportSize.height) / 3
              : viewportSize.width / 4; // small screens
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
                        radiusY * Math.sin(angle) * (connections > 2 ? 1.2 : 1), // Stretch for more connections
                    }
                  : {
                      x: centerX + radiusX * Math.cos(angle),
                      y: centerY + radiusY * Math.sin(angle),
                    },
                style: {
                  background: node.color,
                  width: 50 * (connections > 2 ? 1.2 : 1), // Larger nodes for more connections
                  height: 50 * (connections > 2 ? 1.2 : 1),
                  borderRadius: "50%",
                },
              };
            });

            const processedEdges = edgeData.map((edge: any) => ({
              id: `${edge.source}-${edge.target}`,
              source: String(edge.source),
              target: String(edge.target),
              animated: edge.animated ?? false, // Use edge.animated if available, otherwise default to false
              style: { stroke: edge.color },
              markerEnd: edge.markerEnd || undefined, // Include markerEnd if provided
            }));
            

            setNodes(processedNodes);
            setFilteredNodes(processedNodes); // Initial filtered nodes
            setEdges(processedEdges);
            setFilteredEdges(processedEdges); // Initial filtered edges
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
      {/* Search Filter */}
      <SearchBar query={query} onChange={handleInputChange} />

      {/* Loading and Error handling */}
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

      {/* Graph */}
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
          selectedNode={focusedNode} // Pass the currently focused node
        />

        {/* Keyboard Navigation */}
        <GraphKeyboardNavigator
          nodes={filteredNodes}
          onFocusNode={handleFocusNode}
        />
      </div>
    </div>
  );
}
