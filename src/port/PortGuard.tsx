import React from "react";
import { usePort } from "./PortContext";

export const PortGuard: React.FC<{
  key?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ key, children, fallback }) => {
  const { client } = usePort();

  if (client) return <>{children}</>;

  return <>{fallback || `Not yet with Arkitekt`}</>;
};

export const portGuarded = (
  Child: React.ComponentClass,
  fallback?: React.ReactNode
) => {
  return (props: any) => (
    <PortGuard fallback={fallback}>
      <Child {...props} />
    </PortGuard>
  );
};
