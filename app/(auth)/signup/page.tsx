"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EdisLogo } from "@/components/layout/edis-logo";
import { Icon } from "@/components/icon";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <EdisLogo variant="mark" size={40} className="mx-auto mb-6" />
          <h1
            className="mb-3 font-display text-[24px] font-medium tracking-tight text-foreground"
            style={{ letterSpacing: "-0.025em" }}
          >
            Check your email.
          </h1>
          <p className="text-[14px] leading-relaxed text-edis-text-3">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it to activate your account.
          </p>
          <p className="mt-6 text-[13px] text-edis-text-4">
            Already confirmed?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <EdisLogo variant="mark" size={40} />
          <span className="edis-tag">Sign up</span>
          <h1
            className="font-display text-[28px] font-medium leading-[1.1] tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em" }}
          >
            Ship ads like code.
          </h1>
        </div>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex flex-col gap-4 p-6">
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4"
                >
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 border-edis-line-2 bg-edis-ink-2 text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 border-edis-line-2 bg-edis-ink-2 text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-10 border-edis-line-2 bg-edis-ink-2 text-[14px]"
                />
              </div>

              {error && (
                <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-400">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-10 w-full gap-2 bg-primary text-primary-foreground hover:bg-[#33eb8c] disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
                {!loading && <Icon icon={ArrowRight01Icon} size={16} strokeWidth={2} />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-[13px] text-edis-text-3">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
