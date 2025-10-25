import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PackageOpenIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
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

interface StateViewProps {
  message?: string;
}

interface LoadingViewProps extends StateViewProps {
  entity?: string;
}

export function LoadingView({ message, entity = "items" }: LoadingViewProps) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4">
      <Loader2Icon className="text-primary size-6 animate-spin" />
      {!!message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}

interface ErrorViewProps extends StateViewProps {
  entity?: string;
}

export function ErrorView({ message, entity = "items" }: ErrorViewProps) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4">
      <AlertTriangleIcon className="text-primary size-6" />
      {!!message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}

interface EmptyViewProps extends StateViewProps {
  onNew?: () => void;
}

export function EmptyView({ message, onNew }: EmptyViewProps) {
  return (
    <Empty className="gap-4 border border-dashed bg-white">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageOpenIcon />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No items</EmptyTitle>
      {!!message && <EmptyDescription>{message}</EmptyDescription>}
      {!!onNew && (
        <EmptyContent>
          <Button onClick={onNew}>Add item</Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

interface EntityListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => string | number;
  emptyView?: React.ReactNode;
  className?: string;
}

export function EntityList<T>({
  items,
  renderItem,
  getKey,
  emptyView,
  className,
}: EntityListProps<T>) {
  if (items.length === 0 && emptyView) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-sm">{emptyView}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-y-4", className)}>
      {items.map((item, index) => (
        <div key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

interface EntityItemProps {
  href: string;
  title: string;
  subtitle?: React.ReactNode;
  image?: React.ReactNode;
  actions?: React.ReactNode;
  onRemove?: () => void | Promise<void>;
  isRemoving?: boolean;
  className?: string;
}

export function EntityItem({
  href,
  title,
  subtitle,
  image,
  actions,
  onRemove,
  isRemoving,
  className,
}: EntityItemProps) {
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isRemoving) return;
    if (onRemove) await onRemove();
  };

  return (
    <Link href={href} prefetch>
      <Card
        className={cn(
          "cursor-pointer p-4 shadow-none hover:shadow",
          isRemoving && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <CardContent className="flex flex-row items-center justify-between p-0">
          <div className="flex items-center gap-3">
            {image}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {!!subtitle && (
              <CardDescription className="text-xs">{subtitle}</CardDescription>
            )}
          </div>
          {(actions || onRemove) && (
            <div className="flex items-center gap-x-4">
              {actions}
              {onRemove && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem onClick={handleRemove}>
                      <TrashIcon className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
