"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFormStatus } from "react-dom";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary h-12 rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Pending..." : "Send sign-in link"}
    </button>
  );
}

export default function Login() {
  async function sendLink(formData: FormData) {
    const email = formData.get("email") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.log(error.message);
    } else {
      console.log("Link sent");
    }
  }

  return (
    <>
      <div className="min-h-dvh flex flex-col">
        <header>
          <span className="text-2xl lowercase">Koahi</span>
        </header>

        <div className="flex-1 flex flex-col justify-start pt-[18vh] px-5 gap-3">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-sm">
            Enter your email and we&apwos;ll send you a link to sign in. No
            password needed.
          </p>

          <form action={sendLink} className="flex flex-col gap-3">
            <label htmlFor="email" className="flex flex-col gap-1">
              Email
              <input
                className="w-full border border-muted-foreground rounded-sm py-2 px-3"
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <SubmitButton />
          </form>
        </div>
        <footer className="text-sm px-4 py-4">
          <p>Private wantlist - sign-in is invited only</p>
          <Link href="/" className="underline">Back to the Hunt List</Link>
        </footer>
      </div>
    </>
  );
}
