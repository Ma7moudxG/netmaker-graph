/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Node, Edge, BackgroundVariant } from "@xyflow/react";
import CircleNode from "./CircleNode.jsx";
import ButtonEdge from "./ButtonEdge";
import { useEffect, useState } from "react";

interface NodeData extends Record<string, unknown> {
  label: string;
}

export function Graph({
  nodes,
  edges,
  onNodeChange,
  onEdgeChange,
  selectedNode, // Add a prop for the currently selected node
}: {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodeChange: any;
  onEdgeChange: any;
  selectedNode: Node<NodeData> | null; // Track the focused node
}) {
  const [hoveredNode, setHoveredNode] = useState<Node<NodeData> | null>(null);
  const [popupData, setPopupData] = useState<Node<NodeData> | null>(null);

  const nodeTypes = {
    circle: CircleNode,
  };

  const edgeTypes = {
    button: ButtonEdge,
  };

  const handleNodeClick = (event: any, node: Node<NodeData>) => {
    setHoveredNode(null);
    setPopupData(node);
  };

  const handleNodeHover = (event: any, node: Node<NodeData>) => {
    setPopupData(null);
    setHoveredNode(node);
  };

  const handleNodeHoverLeave = () => {
    setHoveredNode(null);
  };

  const handlePopupClose = () => {
    setPopupData(null);
  };

  // Open popup when the selected node changes
  useEffect(() => {
    if (selectedNode) {
      setPopupData(selectedNode);
    }
  }, [selectedNode]);

  return (
    <div id="app" style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            showLabel: false,
          },
        }))}
        edges={edges}
        onNodesChange={onNodeChange}
        onEdgesChange={onEdgeChange}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeHover}
        onNodeMouseLeave={handleNodeHoverLeave}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Background color="#bbb" variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>

      {/* Tooltip on hover */}
      {hoveredNode && (
        <div
          style={{
            position: "absolute",
            left: hoveredNode.position.x - 50,
            top: hoveredNode.position.y - 40,
            background: "white",
            border: "1px solid gray",
            borderRadius: "5px",
            padding: "5px 10px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 100,
          }}
        >
          <p style={{ margin: 0, color: "#333" }}>{hoveredNode.data.label}</p>
        </div>
      )}

      {/* Popup on click or selection */}
      {popupData && (
        <div
          style={{
            position: "absolute",
            left: popupData.position.x - 50,
            top: popupData.position.y - 40,
            background: "white",
            border: "1px solid gray",
            borderRadius: "10px",
            padding: "14px",
            zIndex: 1000,
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="flex justify-between items-center text-black mb-2">
            <h1 className="font-bold">Node Details</h1>
            <button
              onClick={handlePopupClose}
              className="font-semibold text-red-400 hover:text-red-600 text-lg"
            >
              x
            </button>
          </div>
          <p className="text-slate-600">
            <strong>Label:</strong> {popupData.data.label}
          </p>
          <p className="text-slate-600">
            <strong>Connected Nodes:</strong>{" "}
          </p>
        </div>
      )}
    </div>
  );
}
