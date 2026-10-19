'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from '@kalya/validations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  AlertCircle,
  Mail,
  User,
  HelpCircle,
  Lightbulb,
  Bug,
  ShieldAlert,
  MoreHorizontal,
  Lock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import {
  Input,
  Textarea,
  Button,
  Label,
  Alert,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';

// ============================================================
// TOPIC CONFIGURATION (setup.md Section 16)
// Choose a topic: Question · Feedback or idea · Report a problem · Privacy request · Other
// ============================================================

export const TOPIC_OPTIONS = [
  'Question',
  'Feedback or idea',
  'Report a problem',
  'Privacy request',
  'Other',
] as const;

export type ContactTopic = (typeof TOPIC_OPTIONS)[number];

export interface TopicMeta {
  id: ContactTopic;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}

export const TOPIC_METAS: readonly TopicMeta[] = [
  {
    id: 'Question',
    label: 'Question',
    icon: HelpCircle,
    hint: 'Ask about Kalya features, calculations, or how to get started.',
  },
  {
    id: 'Feedback or idea',
    label: 'Feedback or idea',
    icon: Lightbulb,
    hint: 'Suggest a feature, UI polish, or workflow that would help you.',
  },
  {
    id: 'Report a problem',
    label: 'Report a problem',
    icon: Bug,
    hint: 'Tell us about a bug or calculation discrepancy so we can fix it.',
  },
  {
    id: 'Privacy request',
    label: 'Privacy request',
    icon: ShieldAlert,
    hint: 'Sent directly to our privacy team at privacy@kalya.app for prompt resolution.',
  },
  {
    id: 'Other',
    label: 'Other',
    icon: MoreHorizontal,
    hint: 'Anything else you would like to share with the Kalya team.',
  },
];

// ============================================================
// VALIDATION SCHEMA (setup.md Section 16)
// ============================================================

export const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter a valid email, like you@example.com.')
    .email('Enter a valid email, like you@example.com.'),
  topic: z.enum(TOPIC_OPTIONS),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(2000, 'Message cannot exceed 2000 characters.'),
  // Honeypot spam trap (must remain empty)
  _company_hp: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export interface ContactFormProps {
  className?: string;
  defaultTopic?: ContactTopic;
  onSuccess?: (payload: ContactInput) => void;
  title?: string;
  description?: string;
}

// ============================================================
// MAIN CONTACT FORM COMPONENT
// ============================================================

export function ContactForm({
  className,
  defaultTopic,
  onSuccess,
  title = 'Send us a message',
  description = 'We read every message and reply within 2 working days.',
}: ContactFormProps) {
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);
  const [submittedName, setSubmittedName] = React.useState<string>('');
  const [submittedTopic, setSubmittedTopic] = React.useState<ContactTopic | ''>('');
  const [serverError, setServerError] = React.useState<string | null>(null);

  const successHeadingRef = React.useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      topic: defaultTopic,
      message: '',
      _company_hp: '',
    },
  });

  const selectedTopic = watch('topic');

  // Handle focus on success heading when message is sent
  React.useEffect(() => {
    if (submissionSuccess && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [submissionSuccess]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (payload: ContactInput) => {
    // Honeypot trap check
    if (payload._company_hp && payload._company_hp.length > 0) {
      // Quietly drop spam without error
      setSubmissionSuccess(true);
      return;
    }

    setServerError(null);
    try {
      // Simulate network request to backend
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSubmittedName(payload.name.split(' ')[0] || payload.name);
      setSubmittedTopic(payload.topic);
      setSubmissionSuccess(true);
      onSuccess?.(payload);
    } catch {
      setServerError(
        'Something went wrong, and your message was not sent. Please try again, or email us at support@kalya.app.'
      );
    }
  };

  const handleResetForm = () => {
    reset({
      name: '',
      email: '',
      topic: defaultTopic,
      message: '',
      _company_hp: '',
    });
    setSubmissionSuccess(false);
    setServerError(null);
  };

  return (
    <div
      className={cn(
        'relative rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:p-10 shadow-card transition-all',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="wait">
        {submissionSuccess ? (
          // ============================================================
          // SUCCESS STATE (setup.md Section 16)
          // Heading: Message sent
          // Body: Thanks, [first name]. We have emailed you a copy, and we will reply within 2 working days.
          // Link: Back to home
          // Animation: Success tick draws itself in 500 ms
          // ============================================================
          <motion.div
            key="success-state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center text-center py-6 sm:py-10"
          >
            {/* Animated SVG Checkmark (Draws itself in 500ms) */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-subtle text-primary border border-primary/30 shadow-md">
                <svg
                  className="h-10 w-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeInOut',
                    }}
                  />
                </svg>
              </div>
            </div>

            <h2
              ref={successHeadingRef}
              tabIndex={-1}
              className="font-display text-2xl sm:text-3xl font-bold text-text-primary tracking-tight focus:outline-none"
            >
              Message sent
            </h2>

            <p className="mt-3 max-w-md text-body-md text-text-secondary leading-relaxed">
              Thanks, <strong className="text-text-primary">{submittedName || 'there'}</strong>. We
              have emailed you a copy, and we will reply within{' '}
              <span className="font-semibold text-text-primary font-numeric">2 working days</span>.
            </p>

            {submittedTopic && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-raised border border-border px-3.5 py-1 text-caption text-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>
                  Routed to: <strong className="text-text-primary">{submittedTopic}</strong> team
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  leadingIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back to home
                </Button>
              </Link>
              <Button type="button" variant="outline" size="lg" onClick={handleResetForm}>
                Send another message
              </Button>
            </div>
          </motion.div>
        ) : (
          // ============================================================
          // FORM STATE
          // ============================================================
          <motion.div
            key="form-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="pb-6 border-b border-border/80">
              <h3 className="font-display text-2xl font-bold text-text-primary tracking-tight">
                {title}
              </h3>
              <p className="mt-1 text-body-sm text-text-secondary leading-relaxed">{description}</p>
            </div>

            {/* Server Error Alert (setup.md: Keep everything typed, show error with support email) */}
            {serverError && (
              <div className="mt-6">
                <Alert
                  variant="danger"
                  dismissible
                  onDismiss={() => setServerError(null)}
                  icon={<AlertCircle className="h-4 w-4" />}
                >
                  <span className="text-body-sm">{serverError}</span>
                </Alert>
              </div>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
              {/* Spam honeypot trap hidden from real users */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                {...register('_company_hp')}
              />

              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  id="contact-name"
                  label="Name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  leadingIcon={<User className="h-4 w-4 text-text-muted" />}
                  errorMessage={errors.name?.message}
                  disabled={isSubmitting}
                  {...register('name')}
                />

                <Input
                  id="contact-email"
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  leadingIcon={<Mail className="h-4 w-4 text-text-muted" />}
                  errorMessage={errors.email?.message}
                  disabled={isSubmitting}
                  {...register('email')}
                />
              </div>

              {/* Row 2: Topic (setup.md: Dropdown with 5 options) */}
              <div className="space-y-1.5">
                <Label htmlFor="contact-topic-trigger" required>
                  Topic
                </Label>
                <Select
                  value={selectedTopic}
                  onValueChange={(val) => {
                    setValue('topic', val as ContactTopic, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="contact-topic-trigger"
                    error={Boolean(errors.topic)}
                    className="w-full"
                  >
                    <SelectValue placeholder="Choose a topic: Question · Feedback · Problem · Privacy · Other" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_METAS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-text-muted shrink-0" />
                            <span>{item.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {errors.topic && (
                  <p
                    role="alert"
                    className="text-caption font-medium text-danger flex items-center gap-1 mt-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-danger shrink-0" />
                    <span>{errors.topic.message}</span>
                  </p>
                )}

                {/* Quick Topic Pills for Faster 1-Tap Selection */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TOPIC_OPTIONS.map((topic) => {
                    const isSelected = selectedTopic === topic;
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setValue('topic', topic, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          void trigger('topic');
                        }}
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium select-none',
                          isSelected
                            ? 'border-primary bg-primary-subtle text-primary ring-1 ring-primary/30'
                            : 'border-border bg-surface-raised/60 text-text-secondary hover:border-text-secondary/50 hover:text-text-primary'
                        )}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Message (setup.md: 10 to 2,000 characters with live counter) */}
              <Textarea
                id="contact-message"
                label="Message"
                placeholder="How can we help?"
                rows={5}
                required
                showCount
                maxLength={2000}
                errorMessage={errors.message?.message}
                disabled={isSubmitting}
                {...register('message')}
              />

              {/* Notice above the button (setup.md Section 16) */}
              <p className="text-caption text-text-secondary pt-1">
                We use your details only to reply to your message. See our{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-primary hover:underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Form Bottom: Button & Shortcuts */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border/70">
                <div className="flex items-center gap-2 text-caption text-text-muted">
                  <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Encrypted in transit · We never sell your data</span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="hidden md:inline text-caption text-text-muted">
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-numeric text-[11px]">
                      Ctrl
                    </kbd>{' '}
                    +{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-numeric text-[11px]">
                      Enter
                    </kbd>
                  </span>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    trailingIcon={<Send className="h-4 w-4" />}
                    className="min-w-36 font-semibold"
                  >
                    {isSubmitting ? 'Sending…' : 'Send message'}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
