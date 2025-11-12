import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Edge, Node } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
const elk = new ELK();
// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

type Payload = { nodes: Node[]; edges: Edge[] };
type Result = { nodes: Node[]; edges: Edge[] };

export function useFormatWorkflow(
  options?: UseMutationOptions<Result, Error, Payload>,
) {
  return useMutation<Result, Error, Payload>({
    mutationFn: async ({ nodes, edges }) => {
      const graph = {
        id: "root",
        layoutOptions: elkOptions,
        children: nodes.map((node) => ({
          ...node,
          width: node.measured?.width ?? 42,
          height: node.measured?.height ?? 42,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };
      return await elk
        .layout(graph)
        .then((layoutedGraph) => ({
          nodes: layoutedGraph!.children!.map((node) => ({
            ...node,
            position: { x: node.x ?? 0, y: node.y ?? 0 },
          })),
          edges: edges,
        }))
        .catch((error) => {
          console.error(error);
          throw error;
        });
    },
    ...options,
  });
}
