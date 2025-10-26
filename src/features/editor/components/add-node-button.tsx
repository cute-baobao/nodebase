import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { memo } from "react";

function PureAddNodeButton() {
  return (
    <Button
      onClick={() => {}}
      size="icon"
      variant="outline"
      className="bg-background"
    >
      <PlusIcon />
    </Button>
  );
}

export const AddNodeButton = memo(PureAddNodeButton);

AddNodeButton.displayName = "AddNodeButton";