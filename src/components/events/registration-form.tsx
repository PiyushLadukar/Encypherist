"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SUGGESTED_DEPARTMENTS, ACADEMIC_YEARS } from "@/lib/constants/academic";
import { buildRegistrationSchema } from "@/lib/validation/registration";
import { splitFields, findIdentityField } from "@/lib/registration-form";
import type { RegistrationSettings, RegistrationForm as RegistrationFormConfig, FormField } from "@/types/models";
import type { ZodIssue } from "zod";

type Status = "idle" | "submitting" | "success" | "error";
type Mode = "individual" | "team";
type ErrorMap = Record<string, string>;
type ResponseMap = Record<string, unknown>;

function issuesToErrorMap(issues: ZodIssue[]): ErrorMap {
  const map: ErrorMap = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!(key in map)) map[key] = issue.message;
  }
  return map;
}

function emptyResponses(fields: FormField[]): ResponseMap {
  const initial: ResponseMap = {};
  for (const field of fields) {
    if (field.type === "checkbox") initial[field.key] = false;
    else if (field.type === "multiselect") initial[field.key] = [];
    else initial[field.key] = field.defaultValue ?? "";
  }
  return initial;
}

export function RegistrationForm({
  eventSlug,
  eventTitle,
  registrationConfig,
  registrationForm,
}: {
  eventSlug: string;
  eventTitle: string;
  registrationConfig: RegistrationSettings;
  registrationForm: RegistrationFormConfig;
}) {
  const { identityFields, customFields } = splitFields(registrationForm.fields);
  const allFields = [...registrationForm.fields].sort((a, b) => a.order - b.order);
  const nameKey = findIdentityField(registrationForm.fields, "name")?.key;
  const emailKey = findIdentityField(registrationForm.fields, "email")?.key;

  const availableModes: Mode[] =
    registrationConfig.type === "both" ? ["individual", "team"] : [registrationConfig.type];

  const [mode, setMode] = useState<Mode>(availableModes[0]);
  // Individual mode: one map covering every field. Team mode: identity fields
  // are answered per person (leader + members); custom fields once for the team.
  const [individual, setIndividual] = useState<ResponseMap>(() => emptyResponses(allFields));
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState<ResponseMap>(() => emptyResponses(identityFields));
  const [members, setMembers] = useState<ResponseMap[]>(() =>
    Array.from({ length: Math.max((registrationConfig.teamSize?.min ?? 2) - 1, 1) }, () =>
      emptyResponses(identityFields)
    )
  );
  const [teamResponses, setTeamResponses] = useState<ResponseMap>(() => emptyResponses(customFields));
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ErrorMap>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const teamSize = registrationConfig.teamSize;
  const canAddMember = !teamSize || 1 + members.length < teamSize.max;

  async function handleFileSelect(field: FormField, file: File | null, scopeKey: string) {
    if (!file) return;
    const uploadKey = `${scopeKey}:${field.key}`;
    setUploading((u) => ({ ...u, [uploadKey]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/events/${eventSlug}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, [`responses.${field.key}`]: data.error ?? "Upload failed." }));
        return;
      }
      setTeamResponses((r) => ({ ...r, [field.key]: data.url }));
      setIndividual((r) => ({ ...r, [field.key]: data.url }));
      setErrors((e) => {
        const next = { ...e };
        delete next[`responses.${field.key}`];
        return next;
      });
    } catch {
      setErrors((e) => ({ ...e, [`responses.${field.key}`]: "Network error uploading file." }));
    } finally {
      setUploading((u) => ({ ...u, [uploadKey]: false }));
    }
  }

  function buildPayload() {
    if (mode === "individual") {
      const identity: ResponseMap = {};
      const responses: ResponseMap = {};
      for (const field of identityFields) identity[field.key] = individual[field.key];
      for (const field of customFields) responses[field.key] = individual[field.key];
      return { registrationType: "individual" as const, identity, responses };
    }
    return {
      registrationType: "team" as const,
      team: { teamName, leader, members },
      responses: teamResponses,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setErrors({});

    const payload = buildPayload();
    const schema = buildRegistrationSchema({ registration: registrationConfig, registrationForm });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setErrors(issuesToErrorMap(parsed.error.issues));
      setErrorMessage("Please check the form for errors.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(`/api/events/${eventSlug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error — check your connection and try again.");
    }
  }

  if (status === "success") {
    const displayName =
      mode === "team" ? teamName : nameKey ? String(individual[nameKey] ?? "") : eventTitle;
    const displayEmail =
      mode === "team"
        ? emailKey
          ? String(leader[emailKey] ?? "")
          : ""
        : emailKey
          ? String(individual[emailKey] ?? "")
          : "";
    return (
      <div className="corner-brackets border border-verified/30 bg-verified/5 px-6 py-10 text-center sm:px-10 sm:py-14">
        <CheckCircle2 className="mx-auto size-9 text-verified" />
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-verified">
          {"// REGISTRATION_CONFIRMED"}
        </p>
        <p className="mt-2 font-heading text-2xl font-semibold text-foreground">You&apos;re on the list.</p>
        <dl className="mx-auto mt-6 max-w-xs space-y-2 border-t border-verified/20 pt-6 text-left font-mono text-xs">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">EVENT //</dt>
            <dd className="truncate text-foreground">{eventTitle}</dd>
          </div>
          {displayName && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{mode === "team" ? "TEAM //" : "NAME //"}</dt>
              <dd className="truncate text-foreground">{displayName}</dd>
            </div>
          )}
          {displayEmail && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">EMAIL //</dt>
              <dd className="truncate text-foreground">{displayEmail}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">STATUS //</dt>
            <dd className="text-verified">PENDING REVIEW</dd>
          </div>
        </dl>
        <p className="mt-6 max-w-sm text-sm text-muted-foreground">
          Keep an eye on your email for updates from the forum.
        </p>
      </div>
    );
  }

  function renderFieldList(
    list: FormField[],
    values: ResponseMap,
    setValues: (updater: (prev: ResponseMap) => ResponseMap) => void,
    errorPrefix: string | ((field: FormField) => string),
    scopeKey: string
  ) {
    return list.map((field) => {
      const prefix = typeof errorPrefix === "function" ? errorPrefix(field) : errorPrefix;
      return (
        <DynamicField
          key={`${scopeKey}:${field.key}`}
          field={field}
          idPrefix={scopeKey}
          value={values[field.key]}
          onChange={(v) => setValues((r) => ({ ...r, [field.key]: v }))}
          onFileSelect={(file) => handleFileSelect(field, file, scopeKey)}
          uploading={Boolean(uploading[`${scopeKey}:${field.key}`])}
          error={errors[`${prefix}.${field.key}`]}
        />
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {availableModes.length > 1 && (
        <div className="flex gap-2 border-b border-border pb-5">
          {availableModes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                mode === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "individual" ? "Individual" : "Team"}
            </button>
          ))}
        </div>
      )}

      {mode === "individual" ? (
        <div className="space-y-5">
          {renderFieldList(
            allFields,
            individual,
            setIndividual,
            (field) => (field.identity ? "identity" : "responses"),
            "individual"
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <Label htmlFor="team_name">Team name</Label>
            <Input
              id="team_name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1.5"
              aria-invalid={Boolean(errors["team.teamName"])}
            />
            {errors["team.teamName"] && (
              <p className="mt-1.5 text-xs text-destructive">{errors["team.teamName"]}</p>
            )}
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Team leader</h3>
            <div className="mt-4 space-y-5">
              {renderFieldList(identityFields, leader, setLeader, "team.leader", "leader")}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Team members {teamSize && `(${teamSize.min}–${teamSize.max} total, including leader)`}
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canAddMember}
                onClick={() => setMembers((m) => [...m, emptyResponses(identityFields)])}
              >
                <Plus className="size-3.5" />
                Add member
              </Button>
            </div>
            <div className="mt-4 space-y-6">
              {members.map((member, i) => (
                <div key={i} className="relative border border-dashed border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Member {i + 2}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMembers((m) => m.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove member ${i + 2}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-5">
                    {renderFieldList(
                      identityFields,
                      member,
                      (updater) =>
                        setMembers((m) => m.map((mm, idx) => (idx === i ? updater(mm) : mm))),
                      `team.members.${i}`,
                      `member_${i}`
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors["team.members"] && <p className="mt-3 text-xs text-destructive">{errors["team.members"]}</p>}
          </div>

          {customFields.length > 0 && (
            <div className="space-y-5 border-t border-border pt-6">
              {renderFieldList(customFields, teamResponses, setTeamResponses, "responses", "team")}
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full font-mono text-sm"
        disabled={status === "submitting" || Object.values(uploading).some(Boolean)}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit registration"
        )}
      </Button>
    </form>
  );
}

function DynamicField({
  field,
  idPrefix,
  value,
  onChange,
  onFileSelect,
  uploading,
  error,
}: {
  field: FormField;
  idPrefix: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onFileSelect: (file: File | null) => void;
  uploading: boolean;
  error?: string;
}) {
  const id = `${idPrefix}_${field.key}`;
  const labelNode = (
    <Label htmlFor={id}>
      {field.label}
      {field.required && <span className="ml-1 text-destructive">*</span>}
    </Label>
  );

  switch (field.type) {
    case "long_text":
      return (
        <div>
          {labelNode}
          {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
          <Textarea
            id={id}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1.5"
            aria-invalid={Boolean(error)}
          />
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div className="group/field flex items-start gap-2.5">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(Boolean(checked))}
            className="mt-0.5"
          />
          <div>
            <Label htmlFor={id}>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>
        </div>
      );

    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          {labelNode}
          {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
          <div className="mt-2 space-y-2">
            {(field.options ?? []).map((option) => (
              <label key={option} className="flex items-center gap-2.5 text-sm">
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) =>
                    onChange(checked ? [...selected, option] : selected.filter((o) => o !== option))
                  }
                />
                {option}
              </label>
            ))}
          </div>
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
      );
    }

    case "radio":
      return (
        <div>
          {labelNode}
          {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
          <div className="mt-2 space-y-2">
            {(field.options ?? []).map((option) => (
              <label key={option} className="flex items-center gap-2.5 text-sm">
                <input
                  type="radio"
                  name={id}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="size-4 accent-primary"
                />
                {option}
              </label>
            ))}
          </div>
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
      );

    case "dropdown":
    case "department":
    case "year": {
      const options = field.options?.length
        ? field.options
        : field.type === "department"
          ? [...SUGGESTED_DEPARTMENTS]
          : field.type === "year"
            ? [...ACADEMIC_YEARS]
            : [];
      return (
        <div>
          {labelNode}
          {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
          <Select value={(value as string) || undefined} onValueChange={onChange}>
            <SelectTrigger id={id} className="mt-1.5 w-full">
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
      );
    }

    case "file": {
      const currentUrl = typeof value === "string" ? value : "";
      return (
        <div>
          {labelNode}
          {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
          <div className="mt-1.5 flex items-center gap-3">
            <label
              htmlFor={id}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-muted"
            >
              <Upload className="size-3.5" />
              {uploading ? "Uploading..." : currentUrl ? "Replace file" : "Choose file"}
            </label>
            <input
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
            />
            {currentUrl && !uploading && <span className="text-xs text-verified">Uploaded ✓</span>}
          </div>
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
      );
    }

    case "email":
    case "phone":
    case "url":
    case "number":
    case "college":
    case "short_text":
    default:
      return (
        <Field
          id={id}
          label={field.label}
          required={field.required}
          description={field.description}
          type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={onChange}
          error={error}
        />
      );
  }
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
  required,
  description,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
