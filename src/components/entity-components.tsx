import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Button } from "./ui/button";

type PureHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

export const PureHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  newButtonHref,
  onNew,
}: PureHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-xs md:text-sm">
            {description}
          </p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button disabled={disabled || isCreating} onClick={onNew} size={"sm"}>
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Button size={"sm"} asChild>
          <Link href={newButtonHref} prefetch>
            <PlusIcon className="size-4" />
            {newButtonLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

export const EntityHeader = memo(PureHeader);

type PureContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
};
export const PureContainer = ({
  children,
  header,
  search,
  pagination,
}: PureContainerProps) => {
  return (
    <div className="h-full p-4 md:p-10 md:py-6">
      <div className="mx-auto flex h-full w-full max-w-screen flex-col gap-y-8">
        {header}
        <div className="flex h-full flex-col gap-y-4">
          {search}
          {children}
        </div>
        {pagination}
      </div>
    </div>
  );
};

export const EntityContainer = memo(PureContainer);
