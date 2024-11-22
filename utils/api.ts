import { CustomNode, CustomEdge } from "@/utils/types";

export async function fetchGraphData(): Promise<{
  nodes: CustomNode[];
  edges: CustomEdge[];
}> {
  const [nodeRes, edgeRes] = await Promise.all([
    fetch("http://localhost:3000/nodes"),
    fetch("http://localhost:3000/edges"),
  ]);
  const nodes: CustomNode[] = await nodeRes.json();
  const edges: CustomEdge[] = await edgeRes.json();

  return { nodes, edges };
}
