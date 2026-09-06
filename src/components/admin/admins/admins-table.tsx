"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { setAdminActive } from "@/lib/actions/admins";
import type { Admin } from "@/types/models";

export function AdminsTable({ admins, currentAdminId }: { admins: Admin[]; currentAdminId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await setAdminActive(id, isActive);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(isActive ? "Admin activated." : "Admin deactivated.");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead className="text-right">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium text-foreground">
                {admin.name} {admin.id === currentAdminId && <Badge variant="outline" className="ml-1.5 text-[10px]">You</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
              <TableCell>
                <Badge variant={admin.role === "super_admin" ? "default" : "outline"}>
                  {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(admin.createdAt).toLocaleDateString("en-IN")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString("en-IN") : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={admin.isActive}
                  disabled={isPending || admin.id === currentAdminId}
                  onCheckedChange={(checked) => toggle(admin.id, checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
