"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  onboardingSchema,
  type OnboardingSchema,
  type TagItem,
} from "@/lib/onboarding-schema";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import {
  FormHeader,
  FormFooter,
  StepFields,
  PreviousButton,
  NextButton,
  SubmitButton,
  MultiStepFormContent,
} from "@/components/multi-step-viewer";
import { MultiStepFormProvider } from "@/hooks/use-multi-step-viewer";
import { Input } from "@/components/ui/input";
import { Password } from "@/components/password";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/tag-input";
import type { Tag as EmblorTag } from "emblor";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
  Shield,
  Bell,
  Globe,
  CalendarDays,
  Tag,
  Loader2,
} from "lucide-react";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const form = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      workspaceName: "",
      adminEmail: "",
      adminPassword: "",
      loginMethod: "",
      termsAgreement: undefined,
      notificationPreferences: [],
      workspaceDescription: "",
      tags: [] as TagItem[],
      language: "",
      scheduleDays: [],
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email && !watchedValues.adminEmail) {
      form.setValue("adminEmail", session.user.email);
    }
  }, [session, form, watchedValues.adminEmail]);

  const handleSubmit = form.handleSubmit(async (data: OnboardingSchema) => {
    setIsSubmitting(true);
    try {
        const payload = {
          ...data,
          tags: (data.tags ?? []).map((t) => t.text),
        };
        const res = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

      if (!res.ok) {
        throw new Error("Failed to create workspace");
      }

      setIsSubmitSuccessful(true);
      toast.success("Workspace created successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      toast.error("Failed to create workspace. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const languageOptions = [
    { value: "arabic", label: "Arabic" },
    { value: "english", label: "English" },
    { value: "turkish", label: "Turkish" },
    { value: "russian", label: "Russian" },
    { value: "korean", label: "Korean" },
    { value: "chinese", label: "Chinese" },
    { value: "german", label: "German" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
  ];

  const dayOptions = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const stepsFields = [
    {
      fields: ["workspaceName", "adminEmail", "adminPassword"],
      component: (
        <>
          <Controller
            name="workspaceName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="workspaceName">
                  Workspace Name
                </FieldLabel>
                <Input
                  {...field}
                  id="workspaceName"
                  type="text"
                  onChange={(e) => field.onChange(e.target.value)}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your workspace name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="adminEmail"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="adminEmail">Admin Email</FieldLabel>
                <Input
                  {...field}
                  id="adminEmail"
                  type="email"
                  onChange={(e) => field.onChange(e.target.value)}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter admin email address"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="adminPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldContent className="gap-0.5">
                  <FieldLabel htmlFor="adminPassword">
                    Admin Password
                  </FieldLabel>
                </FieldContent>
                <Password
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="adminPassword"
                  placeholder="Create a password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </>
      ),
    },
    {
      fields: ["loginMethod", "termsAgreement"],
      component: (
        <>
          <Controller
            name="loginMethod"
            control={form.control}
            render={({ field, fieldState }) => {
              const options = [
                { label: "Email", value: "email" },
                { label: "Google", value: "google" },
                { label: "Microsoft", value: "microsoft" },
              ];
              return (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="loginMethod">
                    Select Login Method
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a login method" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
          <Controller
            name="termsAgreement"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox
                    id="termsAgreement"
                    checked={field.value === true}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel htmlFor="termsAgreement">
                    Agree to Terms and Conditions
                  </FieldLabel>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </>
      ),
    },
    {
      fields: [
        "notificationPreferences",
        "workspaceDescription",
        "tags",
        "language",
        "scheduleDays",
      ],
      component: (
        <>
          <Controller
            name="notificationPreferences"
            control={form.control}
            render={({ field, fieldState }) => {
              const options = [
                { label: "Email Notifications", value: "email" },
                { label: "SMS Notifications", value: "sms" },
              ];
              return (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 [&_p]:pb-2 col-span-full"
                >
                  <FieldLabel htmlFor="notificationPreferences">
                    Notification Preferences
                  </FieldLabel>
                  <ToggleGroup
                    variant="outline"
                    value={
                      [field.value]
                        .flat()
                        .filter(
                          (val): val is string => val !== undefined
                        )
                    }
                    onValueChange={field.onChange}
                    className="flex justify-start items-center gap-2 flex-wrap"
                  >
                    {options.map(({ label, value }) => (
                      <ToggleGroupItem
                        key={value}
                        value={value}
                        className="flex items-center gap-x-2"
                      >
                        {label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
          <Controller
            name="workspaceDescription"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="workspaceDescription">
                  Workspace Description
                </FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="workspaceDescription"
                  placeholder="Add a brief description of your workspace"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <FieldSeparator className="my-2 col-span-full" />
          <Controller
            name="tags"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 [&_p]:pb-2 col-span-full"
              >
                <FieldLabel htmlFor="tags">Tags</FieldLabel>
                <FieldDescription>
                  Add tags to categorize your workspace
                </FieldDescription>
                <TagInput
                  tags={(field.value ?? []) as EmblorTag[]}
                  setTags={(tags) => {
                    if (typeof tags === "function") {
                      field.onChange(tags((field.value ?? []) as EmblorTag[]));
                    } else {
                      field.onChange(tags);
                    }
                  }}
                  id="tags"
                  placeholder="Enter your tags"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="language"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-2 col-span-full"
              >
                <FieldLabel htmlFor="language">
                  Select Language
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between active:scale-100",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languageOptions.find(
                            (option) =>
                              option.value === field.value
                          )?.label
                        : "Select a language"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 min-w-(--radix-popper-anchor-width) w-full"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search language..."
                        className="h-10"
                      />
                      <CommandList>
                        <CommandEmpty>
                          No language found.
                        </CommandEmpty>
                        <CommandGroup>
                          {languageOptions.map(
                            ({ label, value }) => (
                              <CommandItem
                                value={value}
                                key={value}
                                onSelect={() => {
                                  form.setValue(
                                    "language",
                                    value
                                  );
                                }}
                              >
                                {label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    value ===
                                      field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="scheduleDays"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 [&_p]:pb-1 col-span-full"
              >
                <FieldLabel htmlFor="scheduleDays">
                  Schedule Days
                </FieldLabel>
                <FieldDescription>
                  Select active days for your workspace
                </FieldDescription>
                <MultiSelect
                  values={field.value ?? []}
                  onValuesChange={(value) =>
                    field.onChange(value ?? [])
                  }
                >
                  <MultiSelectTrigger>
                    <MultiSelectValue placeholder="Pick one or more days" />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    {dayOptions.map(({ label, value }) => (
                      <MultiSelectItem
                        key={value}
                        value={value}
                      >
                        {label}
                      </MultiSelectItem>
                    ))}
                  </MultiSelectContent>
                </MultiSelect>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </>
      ),
    },
  ];

  if (isSubmitSuccessful) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 w-full max-w-md rounded-lg border">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
            className="py-6 px-3"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 500,
                damping: 15,
              }}
              className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
            >
              <Check className="size-8" />
            </motion.div>
            <h2 className="text-center text-2xl font-bold mb-2">
              Welcome to your workspace!
            </h2>
            <p className="text-center text-lg text-muted-foreground">
              Redirecting you to the dashboard...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side: Multi-step form */}
      <div className="flex-1 flex items-start justify-center p-6 pt-12 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Set up your workspace</h1>
            <p className="text-muted-foreground mt-1">
              Complete these steps to get started with DocAI
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col p-5 md:p-8 w-full rounded-lg border gap-2"
          >
            <MultiStepFormProvider
              stepsFields={stepsFields}
              onStepValidation={async (step) => {
                const isValid = await form.trigger(
                  step.fields as (keyof OnboardingSchema)[]
                );
                return isValid;
              }}
            >
              <MultiStepFormContent>
                <FormHeader />
                <StepFields />
                <FormFooter>
                  <PreviousButton>
                    <ChevronLeft />
                    Previous
                  </PreviousButton>
                  <NextButton>
                    Next <ChevronRight />
                  </NextButton>
                  <SubmitButton
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </SubmitButton>
                </FormFooter>
              </MultiStepFormContent>
            </MultiStepFormProvider>
          </form>
        </div>
      </div>

      {/* Right side: Live workspace preview sidebar */}
      <div className="hidden lg:block w-96 border-l bg-muted/30 p-6 overflow-y-auto">
        <WorkspacePreview values={watchedValues} languageOptions={languageOptions} dayOptions={dayOptions} />
      </div>
    </div>
  );
}

function WorkspacePreview({
  values,
  languageOptions,
  dayOptions,
}: {
  values: Partial<OnboardingSchema>;
  languageOptions: { value: string; label: string }[];
  dayOptions: { value: string; label: string }[];
}) {
  const hasAnyValue =
    values.workspaceName ||
    values.adminEmail ||
    values.workspaceDescription ||
    values.loginMethod ||
    (values.tags && values.tags.length > 0) ||
    values.language ||
    (values.scheduleDays && values.scheduleDays.length > 0) ||
    (values.notificationPreferences &&
      values.notificationPreferences.length > 0);

  return (
    <div className="sticky top-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5" />
        Workspace Preview
      </h2>

      <AnimatePresence mode="popLayout">
        {!hasAnyValue ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Start filling in the form to see your workspace preview
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {values.workspaceName || "Untitled Workspace"}
                </CardTitle>
                {values.workspaceDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {values.workspaceDescription}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {values.adminEmail && (
                  <PreviewField
                    icon={<Mail className="h-4 w-4" />}
                    label="Admin"
                    value={values.adminEmail}
                  />
                )}

                {values.loginMethod && (
                  <PreviewField
                    icon={<Shield className="h-4 w-4" />}
                    label="Login"
                    value={
                      values.loginMethod.charAt(0).toUpperCase() +
                      values.loginMethod.slice(1)
                    }
                  />
                )}

                {values.language && (
                  <PreviewField
                    icon={<Globe className="h-4 w-4" />}
                    label="Language"
                    value={
                      languageOptions.find(
                        (l) => l.value === values.language
                      )?.label || values.language
                    }
                  />
                )}

                {values.notificationPreferences &&
                  values.notificationPreferences.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Bell className="h-4 w-4" />
                          <span>Notifications</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {values.notificationPreferences.map(
                            (pref) => (
                              <Badge
                                key={pref}
                                variant="secondary"
                                className="text-xs"
                              >
                                {pref === "email"
                                  ? "Email"
                                  : "SMS"}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}

                {values.tags && values.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <span>Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {values.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag.text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {values.scheduleDays &&
                  values.scheduleDays.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>Schedule</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {values.scheduleDays.map(
                            (day) => (
                              <Badge
                                key={day}
                                variant="secondary"
                                className="text-xs"
                              >
                                {dayOptions.find(
                                  (d) =>
                                    d.value ===
                                    day
                                )?.label || day}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>

            {values.termsAgreement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
              >
                <Check className="h-4 w-4" />
                Terms accepted
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PreviewField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
