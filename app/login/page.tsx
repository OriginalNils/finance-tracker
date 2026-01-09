// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Zugriff verweigert. Login-Daten prüfen.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md space-y-8 border border-border/40 p-10 rounded-[40px] bg-card shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">FF<span className="text-muted-foreground/30">.OS</span></h1>
          <p className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] uppercase opacity-50">Identity Verification Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="TERMINAL-ID (EMAIL)"
              className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-primary transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="ACCESS-KEY"
              className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-primary transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-[10px] text-rose-500 font-black uppercase text-center tracking-widest">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}