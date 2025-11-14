// import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { calculateDuration, getStatusIcon, title } from "@/lib/configs/execution-constants";
// import { useState } from "react";
// import { useSuspenseSingleExecution } from "../hooks/use-executions";

// export const ExecutionView = ({ executionId }: { executionId: string }) => {
//   const { data: execution } = useSuspenseSingleExecution(executionId);
//   const [showStackTrace, setShowStackTrace] = useState(false);
//   const duration = calculateDuration(
//     execution.startedAt,
//     execution.completedAt,
//   );

//   return (
//     <Card className="shadow-none">
//       <CardHeader>
//         <div className="flex items-center gap-3">
//           {getStatusIcon(execution.status)}
//           <div>
//             <CardTitle>
//               {title(execution.status)}
//             </CardTitle>
//             <CardDescription>
//               Execution for workflow "{execution.workflow.name || execution.workflowId}" &bull; Started{" "}
//             </CardDescription>
//           </div>
//         </div>
//       </CardHeader>
//     </Card>
//   );
// };
