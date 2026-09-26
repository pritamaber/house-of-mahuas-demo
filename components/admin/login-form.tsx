"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useRef } from "react";
import { loginAction, type LoginState } from "@/lib/actions/admin";

export function LoginForm({ demo }: { demo: { email: string; password: string } | null }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input ref={emailRef} id="email" name="email" type="email" required autoComplete="username" className="field" aria-invalid={state.error ? true : undefined} />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input ref={passwordRef} id="password" name="password" type="password" required autoComplete="current-password" className="field" aria-invalid={state.error ? true : undefined} />
      </div>

      {state.error && (
        <p className="border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-[14px] text-danger" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-block h-[3.25rem]">
        {pending ? (
          <>
            <LoaderCircle size={16} className="animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      {demo && (
        <div className="border border-gold/40 bg-gold-soft/50 p-4 text-[13.5px]">
          <p className="font-medium text-ink">Demo login</p>
          <p className="mt-1 text-muted">
            Email <span className="font-medium text-ink">{demo.email}</span>
            <br />
            Password <span className="font-medium text-ink">{demo.password}</span>
          </p>
          <button
            type="button"
            className="mt-3 text-[12px] font-medium tracking-[0.14em] text-maroon uppercase underline underline-offset-4"
            onClick={() => {
              if (emailRef.current) emailRef.current.value = demo.email;
              if (passwordRef.current) passwordRef.current.value = demo.password;
            }}
          >
            Fill demo login
          </button>
        </div>
      )}
    </form>
  );
}
