"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagMultiSelect } from "@/components/admin/tag-multiselect";
import { OPTION_FIELD_TYPES } from "@/lib/validation/form-field";
import type { FormField, FormFieldType } from "@/types/models";

const TYPE_LABELS: Record<FormFieldType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  email: "Email",
  phone: "Phone number",
  number: "Number",
  dropdown: "Dropdown",
  radio: "Radio buttons",
  checkbox: "Checkbox (yes/no)",
  multiselect: "Multiple select",
  file: "File upload",
  url: "URL",
  department: "Department",
  year: "Academic year",
  college: "College name",
};

function slugifyKey(text: string): string {
  const key = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_");
  return /^[a-z]/.test(key) ? key : `f_${key}`;
}

const EMPTY_FIELD: Omit<FormField, "order"> = {
  key: "",
  type: "short_text",
  label: "",
  description: "",
  placeholder: "",
  required: false,
  defaultValue: "",
  options: [],
};

export function FieldEditorDialog({
  open,
  onOpenChange,
  field,
  existingKeys,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: FormField | null;
  existingKeys: string[];
  onSave: (field: Omit<FormField, "order">) => void;
}) {
  const [draft, setDraft] = useState<Omit<FormField, "order">>(EMPTY_FIELD);
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the draft whenever the dialog transitions to open — adjusted
  // directly during render (React's documented pattern for resetting state
  // when a prop changes) rather than in an effect, which would cost an
  // extra render pass for no benefit.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraft(field ? { ...field } : EMPTY_FIELD);
      setKeyManuallyEdited(Boolean(field));
      setError(null);
    }
  }

  const needsOptions = OPTION_FIELD_TYPES.has(draft.type);

  function handleSave() {
    if (!draft.label.trim()) return setError("Label is required.");
    if (!draft.key.trim()) return setError("Field key is required.");
    const otherKeys = field ? existingKeys.filter((k) => k !== field.key) : existingKeys;
    if (otherKeys.includes(draft.key)) return setError("This field key is already used by another field.");
    if (needsOptions && (!draft.options || draft.options.length === 0)) {
      return setError("Add at least one option.");
    }
    onSave(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{field ? "Edit field" : "Add field"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label htmlFor="field_type">Field type</Label>
            <Select value={draft.type} onValueChange={(type) => setDraft((d) => ({ ...d, type: type as FormFieldType }))}>
              <SelectTrigger id="field_type" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABELS) as FormFieldType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="field_label">Label</Label>
            <Input
              id="field_label"
              value={draft.label}
              onChange={(e) => {
                const label = e.target.value;
                setDraft((d) => ({ ...d, label, key: keyManuallyEdited ? d.key : slugifyKey(label) }));
              }}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="field_key">Field key</Label>
            <Input
              id="field_key"
              value={draft.key}
              onChange={(e) => {
                setKeyManuallyEdited(true);
                setDraft((d) => ({ ...d, key: slugifyKey(e.target.value) }));
              }}
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="field_description">Help text (optional)</Label>
            <Input
              id="field_description"
              value={draft.description ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="field_placeholder">Placeholder (optional)</Label>
            <Input
              id="field_placeholder"
              value={draft.placeholder ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, placeholder: e.target.value }))}
              className="mt-1.5"
            />
          </div>

          {needsOptions && (
            <div>
              <Label>Options</Label>
              <div className="mt-1.5">
                <TagMultiSelect
                  value={draft.options ?? []}
                  onChange={(options) => setDraft((d) => ({ ...d, options }))}
                  placeholder="Add an option and press Enter"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label htmlFor="field_required">Required</Label>
            <Switch
              id="field_required"
              checked={draft.required}
              onCheckedChange={(required) => setDraft((d) => ({ ...d, required }))}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSave}>Save field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
