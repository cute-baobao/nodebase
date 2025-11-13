"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { Credential } from "@/db";
import { getCredentialLogo } from "@/lib/configs/credential-constants";
import { useEntitySearch } from "@/lib/hooks/use-entity-search";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";

export function CredentialList() {
  const credentials = useSuspenseCredentials();
  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialEmpty />}
    />
  );
}

export function CredentialHeader({ disabled }: { disabled?: boolean }) {
  return (
    <>
      <EntityHeader
        title="Credentials"
        description="Create and manage your credentials"
        newButtonLabel="New credential"
        disabled={disabled}
        newButtonHref="/credentials/new"
      />
    </>
  );
}

export function CredentialSearch() {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <>
      <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search credentials..."
      />
    </>
  );
}

export function CredentialPagination() {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={params.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}

export function CredentialsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntityContainer
      header={<CredentialHeader />}
      search={<CredentialSearch />}
      pagination={<CredentialPagination />}
    >
      {children}
    </EntityContainer>
  );
}

export function CredentialLoading() {
  return <LoadingView message="Loading credentials..." entity="credentials" />;
}

export function CredentialError() {
  return <ErrorView message="Error loading credentials..." />;
}

export function CredentialEmpty() {
  const router = useRouter();
  const handleNew = () => {
    router.push("/credentials/new");
  };
  return (
    <>
      <EmptyView
        onNew={handleNew}
        message="No credentials found, Get started by creating a credential"
      />
    </>
  );
}

export function CredentialItem({ data }: { data: Credential }) {
  const removeCredential = useRemoveCredential();

  const src = useMemo(() => {
    return getCredentialLogo(data.type);
  }, [data.type]);

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="flex size-8 items-center justify-center">
          <Image
            src={src}
            alt={data.name + "credential"}
            height={20}
            width={20}
          />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
}
