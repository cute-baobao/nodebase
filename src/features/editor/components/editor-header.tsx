"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  useSuspenseSingleWorkflow,
  useUpdatedWorkflow,
  useUpdatedWorkflowName,
} from "@/features/workflows/hooks/use-workflows";
import { useAtomValue } from "jotai";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { createContext, use, useEffect, useRef, useState } from "react";
import { editorAtom } from "../store/atoms";

function EditorNameInput() {
  const { workflowId } = use(EditorHeaderContext);
  const { data: workflow } = useSuspenseSingleWorkflow(workflowId);
  const updateWorkflowName = useUpdatedWorkflowName();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name === workflow.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateWorkflowName.mutateAsync({
        id: workflowId,
        name,
      });
    } catch {
      setName(workflow.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      setName(workflow.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        disabled={updateWorkflowName.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-[100px] px-2"
      />
    );
  }

  return (
    <BreadcrumbItem
      onClick={() => setIsEditing(true)}
      className="hover:text-foreground cursor-pointer transition-colors"
    >
      {workflow.name}
    </BreadcrumbItem>
  );
}

export function EditorBreadcrumbs() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput />
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function EditorSaveButton() {
  const { workflowId } = use(EditorHeaderContext);
  const editor = useAtomValue(editorAtom);
  const saveWorkflow = useUpdatedWorkflow();

  const handleSave = async () => {
    if (!editor) return;
    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    saveWorkflow.mutate({
      id: workflowId,
      nodes,
      edges,
    });
  };

  return (
    <div className="ml-auto">
      <Button size="sm" onClick={handleSave} disabled={saveWorkflow.isPending}>
        <SaveIcon className="size-4" />
        Save
      </Button>
    </div>
  );
}

const EditorHeaderContext = createContext({
  workflowId: "",
});

export function EditorHeader({ workflowId }: { workflowId: string }) {
  return (
    <EditorHeaderContext.Provider value={{ workflowId }}>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <div className="flex w-full flex-row items-center justify-between gap-x-4">
          <EditorBreadcrumbs />
          <EditorSaveButton />
        </div>
      </header>
    </EditorHeaderContext.Provider>
  );
}
