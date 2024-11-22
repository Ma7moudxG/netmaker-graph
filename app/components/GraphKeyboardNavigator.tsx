import React, { useEffect, useState, useCallback } from "react";
import { Node } from "@xyflow/react";

interface GraphKeyboardNavigatorProps {
  nodes: Node[];
  onFocusNode: (node: Node) => void; // Callback when a node is focused
}

export const GraphKeyboardNavigator: React.FC<GraphKeyboardNavigatorProps> = ({
  nodes,
  onFocusNode,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  // Find the nearest node in the given direction
  const findNearestNode = (currentNode: Node | undefined, direction: string) => {
    if (!currentNode) return null;

    const { position: currentPos } = currentNode;

    // Calculate nearest node based on direction
    const candidates = nodes.filter((node) => node.id !== currentNode.id);
    let nearestNode: Node | null = null;
    let minDistance = Infinity;

    candidates.forEach((node) => {
      const { position } = node;

      // Directional logic
      const isCandidate =
        (direction === "ArrowRight" && position.x > currentPos.x) ||
        (direction === "ArrowLeft" && position.x < currentPos.x) ||
        (direction === "ArrowDown" && position.y > currentPos.y) ||
        (direction === "ArrowUp" && position.y < currentPos.y);

      if (isCandidate) {
        const distance = Math.hypot(position.x - currentPos.x, position.y - currentPos.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestNode = node;
        }
      }
    });

    return nearestNode;
  };

  // Handle key events for navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentNode = nodes.find((node) => node.id === currentNodeId);
      if (!currentNode) {
        // If no node is selected, default to the first node
        setCurrentNodeId(nodes[0]?.id || null);
        if (nodes[0]) onFocusNode(nodes[0]);
        return;
      }

      const nearestNode = findNearestNode(currentNode, event.key);
      if (nearestNode) {
        setCurrentNodeId(nearestNode.id);
        onFocusNode(nearestNode);
      }
    },
    [currentNodeId, nodes, onFocusNode]
  );

  useEffect(() => {
    // Attach keyboard event listeners
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Set initial node focus
  useEffect(() => {
    if (!currentNodeId && nodes.length > 0) {
      setCurrentNodeId(nodes[0].id);
      onFocusNode(nodes[0]);
    }
  }, [nodes, currentNodeId, onFocusNode]);

  return null; // This component doesn't render anything
};
