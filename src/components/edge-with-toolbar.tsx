import {
  BaseEdge,
  EdgeProps,
  EdgeToolbar,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react";
import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";

export function EdgeWithToolbar(props: EdgeProps) {
  const [edgePath, centerX, centerY] = getBezierPath(props);
  const { deleteElements, getEdges } = useReactFlow();
  const deleteEdge = () => {
    const edge = getEdges().find((e) => e.id === props.id);
    if (edge) deleteElements({ edges: [edge] });
  };

  return (
    <>
      <BaseEdge id={props.id} path={edgePath} />
      <EdgeToolbar edgeId={props.id} x={centerX} y={centerY - 15}>
        <Button
          size="icon"
          variant="ghost"
          className="bg-background"
          onClick={deleteEdge}
        >
          <TrashIcon className="size-4" />
        </Button>
      </EdgeToolbar>
    </>
  );
}
