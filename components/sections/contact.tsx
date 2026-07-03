"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Code2, Copy, Mail, MapPin, Send } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/icons";

import { person } from "@/lib/resume";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/effects/reveal";
import { Spotlight } from "@/components/effects/spotlight";
import { Magnetic } from "@/components/effects/magnetic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { useCopy } from "@/hooks/use-copy";
import { useSound } from "@/hooks/use-sound";

function CopyChip({
  icon: Icon,
  value,
  copyValue,
  label,
}: {
  icon: typeof Mail;
  value: string;
  copyValue: string;
  label: string;
}) {
  const { copied, copy } = useCopy();
  const toast = useToast();
  const { play } = useSound();

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={async () => {
        const ok = await copy(copyValue);
        if (ok) {
          play("success");
          toast({ title: `${label} copied`, description: copyValue, icon: "success" });
        }
      }}
      className={cn(
        "group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left glass",
        "transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong",
      )}
    >
      <Icon className="size-4 shrink-0 text-(--ion)" />
      <span className="flex-1">
        <span className="block font-mono text-[0.65rem] tracking-wider text-faint uppercase">
          {label}
        </span>
        <span className="block text-sm text-fg">{value}</span>
      </span>
      <span className="text-faint transition-colors group-hover:text-fg">
        {copied ? <Check className="size-4 text-operational" /> : <Copy className="size-4" />}
      </span>
    </button>
  );
}

const SOCIALS = [
  {
    label: "GitHub",
    handle: `@${person.handles.github}`,
    href: person.links.github,
    icon: GitHubIcon,
  },
  {
    label: "LinkedIn",
    handle: `in/${person.handles.linkedin}`,
    href: person.links.linkedin,
    icon: LinkedInIcon,
  },
  {
    label: "CodeChef",
    handle: `@${person.handles.codechef} · 1758`,
    href: person.links.codechef,
    icon: Code2,
  },
];

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const toast = useToast();
  const { play } = useSound();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Tell me who's calling.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      nextErrors.email = "That address doesn't parse — check it once more.";
    if (message.trim().length < 10)
      nextErrors.message = "A couple of sentences helps me reply properly.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const subject = encodeURIComponent(`Portfolio contact — ${name.trim()}`);
    const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()} <${email.trim()}>`);
    window.location.href = `mailto:${person.email}?subject=${subject}&body=${body}`;

    play("success");
    setSent(true);
    toast({
      title: "202 Accepted — handing off to your mail app",
      description: "Your message is drafted there; nothing is stored on this site.",
      icon: "success",
      durationMs: 5000,
    });
    setTimeout(() => setSent(false), 3200);
  };

  return (
    <section id="contact" aria-label="Contact" className="relative section-pad">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] p-7 glass md:p-12 lg:p-16">
            <div className="aurora-field" aria-hidden="true" style={{ opacity: 0.35 }} />
            <Spotlight size={720} />

            <div className="relative grid gap-12 lg:grid-cols-[1fr_1.15fr]">
              <div>
                <SectionHeading
                  method="POST"
                  route="/contact"
                  status="202"
                  title="Ship me a message"
                  lede="Hiring for backend or AI-platform work? Have a system worth building? My inbox is the endpoint — it accepts JSON, prose, and interesting problems."
                />

                <div className="mt-10 space-y-3">
                  <CopyChip
                    icon={Mail}
                    label="email"
                    value={person.email}
                    copyValue={person.email}
                  />
                  <div className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 glass">
                    <MapPin className="size-4 shrink-0 text-(--ion)" />
                    <span>
                      <span className="block font-mono text-[0.65rem] tracking-wider text-faint uppercase">
                        location
                      </span>
                      <span className="block text-sm text-fg">
                        {person.location} · UTC+05:30
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2.5">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className={cn(
                        "group flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 glass",
                        "transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong",
                      )}
                    >
                      <social.icon className="size-4 text-muted transition-colors group-hover:text-fg" />
                      <span className="font-mono text-xs text-muted transition-colors group-hover:text-fg">
                        {social.handle}
                      </span>
                      <ArrowUpRight className="size-3 text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* the payload */}
              <form onSubmit={submit} noValidate className="flex flex-col gap-5 lg:pt-2">
                <p className="eyebrow" aria-hidden="true">
                  request body <span className="text-faint">· application/x-human-message</span>
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-name">name</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="font-mono text-xs text-(--gold)">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-email">reply-to</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="font-mono text-xs text-(--gold)">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-message">message</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="The system you're building, the role you're hiring for, or the problem keeping you up at night…"
                    rows={6}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                  />
                  {errors.message && (
                    <p id="contact-message-error" className="font-mono text-xs text-(--gold)">
                      {errors.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Magnetic>
                    <Button type="submit" variant="aurora" size="lg" className="min-w-44">
                      {sent ? (
                        <>
                          <Check className="size-4" />
                          202 Accepted
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          POST message
                        </>
                      )}
                    </Button>
                  </Magnetic>
                  <p className="max-w-56 font-mono text-[0.65rem] leading-relaxed text-faint">
                    opens your mail app with the message drafted — nothing is stored here.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
