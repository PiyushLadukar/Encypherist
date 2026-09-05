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
import { buildRegistrationSchema, type ParticipantInfoInput } from "@/lib/validation/registration";
import type { RegistrationSettings, RegistrationForm as RegistrationFormConfig, FormField } from "@/types/models";
import type { ZodIssue } from "zod";

const EMPTY_PARTICIPANT: ParticipantInfoInput = { name: "", email: "", phone: "", department: "", year: "" };

type Status = "idle" | "submitting" | "success" | "error";
type Mode = "individual" | "team";
type ErrorMap = Record<string, string>;

function issuesToErrorMap(issues: ZodIssue[]): ErrorMap {
  const map: ErrorMap = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!(key in map)) map[key] = issue.message;
  }
  return map;
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
  const availableModes: Mode[] =
    registrationConfig.type === "both" ? ["individual", "team"] : [registrationConfig.type];

  const [mode, setMode] = useState<Mode>(availableModes[0]);
  const [individual, setIndividual] = useState<ParticipantInfoInput>(EMPTY_PARTICIPANT);
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState<ParticipantInfoInput>(EMPTY_PARTICIPANT);
  const [members, setMembers] = useState<ParticipantInfoInput[]>(
    Array.from({ length: Math.max((registrationConfig.teamSize?.min ?? 2) - 1, 1) }, () => ({ ...EMPTY_PARTICIPANT }))
  );
  const [responses, setResponses] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of registrationForm.fields) {
      if (field.type === "checkbox") initial[field.key] = false;
      else if (field.type === "multiselect") initial[field.key] = [];
      else initial[field.key] = field.defaultValue ?? "";
    }
    return initial;
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ErrorMap>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fields = [...registrationForm.fields].sort((a, b) => a.order - b.order);
  const teamSize = registrationConfig.teamSize;
  const canAddMember = !teamSize || 1 + members.length < teamSize.max;

  async function handleFileSelect(field: FormField, file: File | null) {
    if (!file) return;
    setUploading((u) => ({ ...u, [field.key]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/events/${eventSlug}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, [`responses.${field.key}`]: data.error ?? "Upload failed." }));
        return;
      }
      setResponses((r) => ({ ...r, [field.key]: data.url }));
      setErrors((e) => {
        const next = { ...e };
        delete next[`responses.${field.key}`];
        return next;
      });
    } catch {
      setErrors((e) => ({ ...e, [`responses.${field.key}`]: "Network error uploading file." }));
    } finally {
      setUploading((u) => ({ ...u, [field.key]: false }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setErrors({});

    const payload =
      mode === "individual"
        ? { registrationType: "individual" as const, individual, responses }
        : { registrationType: "team" as const, team: { teamName, leader, members }, responses };

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
    const displayName = mode === "team" ? teamName : individual.name;
    const displayEmail = mode === "team" ? leader.email : individual.email;
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
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{mode === "team" ? "TEAM //" : "NAME //"}</dt>
            <dd className="truncate text-foreground">{displayName}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">EMAIL //</dt>
            <dd className="truncate text-foreground">{displayEmail}</dd>
          </div>
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
        <ParticipantFields
          idPrefix="individual"
          values={individual}
          onChange={setIndividual}
          errors={errors}
          errorPrefix="individual"
        />
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
            <div className="mt-4">
              <ParticipantFields
                idPrefix="leader"
                values={leader}
                onChange={setLeader}
                errors={errors}
                errorPrefix="team.leader"
              />
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
                onClick={() => setMembers((m) => [...m, { ...EMPTY_PARTICIPANT }])}
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
                  <div className="mt-3">
                    <ParticipantFields
                      idPrefix={`member_${i}`}
                      values={member}
                      onChange={(v) => setMembers((m) => m.map((mm, idx) => (idx === i ? v : mm)))}
                      errors={errors}
                      errorPrefix={`team.members.${i}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors["team.members"] && <p className="mt-3 text-xs text-destructive">{errors["team.members"]}</p>}
          </div>
        </div>
      )}

      {fields.length > 0 && (
        <div className="space-y-5 border-t border-border pt-6">
          {fields.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={responses[field.key]}
              onChange={(v) => setResponses((r) => ({ ...r, [field.key]: v }))}
              onFileSelect={(file) => handleFileSelect(field, file)}
              uploading={Boolean(uploading[field.key])}
              error={errors[`responses.${field.key}`]}
            />
          ))}
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

function ParticipantFields({
  idPrefix,
  values,
  onChange,
  errors,
  errorPrefix,
}: {
  idPrefix: string;
  values: ParticipantInfoInput;
  onChange: (values: ParticipantInfoInput) => void;
  errors: ErrorMap;
  errorPrefix: string;
}) {
  function set<K extends keyof ParticipantInfoInput>(key: K, value: ParticipantInfoInput[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-4">
      <Field
        id={`${idPrefix}_name`}
        label="Full name"
        value={values.name}
        onChange={(v) => set("name", v)}
        error={errors[`${errorPrefix}.name`]}
        autoComplete="name"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id={`${idPrefix}_email`}
          label="Email"
          type="email"
          value={values.email}
          onChange={(v) => set("email", v)}
          error={errors[`${errorPrefix}.email`]}
          autoComplete="email"
        />
        <Field
          id={`${idPrefix}_phone`}
          label="Phone"
          type="tel"
          value={values.phone}
          onChange={(v) => set("phone", v)}
          error={errors[`${errorPrefix}.phone`]}
          autoComplete="tel"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}_department`}>Department</Label>
          <Select value={values.department || undefined} onValueChange={(v) => set("department", v ?? "")}>
            <SelectTrigger id={`${idPrefix}_department`} className="mt-1.5 w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {SUGGESTED_DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[`${errorPrefix}.department`] && (
            <p className="mt-1.5 text-xs text-destructive">{errors[`${errorPrefix}.department`]}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}_year`}>Year</Label>
          <Select value={values.year || undefined} onValueChange={(v) => set("year", v ?? "")}>
            <SelectTrigger id={`${idPrefix}_year`} className="mt-1.5 w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[`${errorPrefix}.year`] && (
            <p className="mt-1.5 text-xs text-destructive">{errors[`${errorPrefix}.year`]}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
  onFileSelect,
  uploading,
  error,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  onFileSelect: (file: File | null) => void;
  uploading: boolean;
  error?: string;
}) {
  const id = `field_${field.key}`;
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
