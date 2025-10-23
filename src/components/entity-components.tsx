import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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

const PureHeader = ({
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

interface PureContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
}

const PureContainer = ({
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

interface PureSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PureSearch = ({ value, onChange, placeholder }: PureSearchProps) => {
  return (
    <div className="relative ml-auto">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
      <Input
        className="bg-background border-border max-w-[200px] pl-8 shadow-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export const EntitySearch = memo(PureSearch);

interface PurePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const PurePagination = ({
  page,
  totalPages,
  onPageChange,
  disabled,
}: PurePaginationProps) => {
  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <div className="text-muted-foreground flex-1 text-sm">
        Page {page} of {totalPages || 1}
      </div>
      <div className="py- flex items-center justify-end space-x-2">
        <Button
          disabled={disabled || page === 1}
          variant={"outline"}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          disabled={disabled || page === totalPages || totalPages === 0}
          variant={"outline"}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export const EntityPagination = memo(PurePagination);
