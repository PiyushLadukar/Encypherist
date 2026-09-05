"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldEditorDialog } from "./field-editor-dialog";
import type { FormField } from "@/types/models";

export function FormBuilderSection({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const sorted = [...fields].sort((a, b) => a.order - b.order);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((f, i) => ({ ...f, order: i })));
  }

  function remove(key: string) {
    onChange(sorted.filter((f) => f.key !== key).map((f, i) => ({ ...f, order: i })));
  }

  function save(field: Omit<FormField, "order">) {
    if (editingField) {
      onChange(sorted.map((f) => (f.key === editingField.key ? { ...field, order: f.order } : f)));
    } else {
      onChange([...sorted, { ...field, order: sorted.length }]);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Registration form</CardTitle>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditingField(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-3.5" /> Add field
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-muted-foreground">
          These questions appear in addition to the built-in name/email/phone/department/year fields collected for
          every participant (and team leader/members, for team events).
        </p>

        {sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No custom fields yet — add one above (e.g. GitHub URL, Project Idea, Upload Photograph).
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((field, i) => (
              <div
                key={field.key}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{field.label}</span>
                    {field.required && (
                      <Badge variant="outline" className="text-[10px]">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {field.key} · {field.type}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={i === sorted.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ChevronDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditingField(field);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(field.key)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <FieldEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        field={editingField}
        existingKeys={sorted.map((f) => f.key)}
        onSave={save}
      />
    </Card>
  );
}
