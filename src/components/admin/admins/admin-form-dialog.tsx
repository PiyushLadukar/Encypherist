"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAdminAccount } from "@/lib/actions/admins";
import { createAdminSchema } from "@/lib/validation/admin";

export function AdminFormDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" as "admin" | "super_admin" });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    const parsed = createAdminSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid data.");
      return;
    }
    startTransition(async () => {
      const result = await createAdminAccount(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Admin created.");
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "admin" });
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <UserPlus className="size-3.5" /> Add admin
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add admin</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="admin_name">Name</Label>
            <Input
              id="admin_name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="admin_email">Email</Label>
            <Input
              id="admin_email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="admin_password">Temporary password</Label>
            <Input
              id="admin_password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="admin_role">Role</Label>
            <Select value={form.role} onValueChange={(role) => setForm((f) => ({ ...f, role: role as typeof f.role }))}>
              <SelectTrigger id="admin_role" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            Create admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
