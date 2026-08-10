import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireUserId } from "@/lib/auth";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUserId();
  return <AppShell>{children}</AppShell>;
}
