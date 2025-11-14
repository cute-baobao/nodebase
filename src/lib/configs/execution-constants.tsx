import { ExecutionStatus } from "@/db";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

export const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case "FAILED":
      return <XCircleIcon className="size-5 text-red-600" />;
    case "RUNNING":
      return <Loader2Icon className="size-5 animate-spin text-blue-600" />;
    default:
      return <ClockIcon className="text-muted-foreground size-5" />;
  }
};

export const calculateDuration = (
  startedAt: Date,
  completedAt: Date | null,
) => {
  return completedAt
    ? Math.round(
        new Date(completedAt).getTime() - new Date(startedAt).getTime(),
      ) / 1000
    : null;
};
