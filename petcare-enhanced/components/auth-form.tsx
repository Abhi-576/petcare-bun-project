"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Eye, EyeOff, ArrowRight } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"OWNER" | "SITTER">("OWNER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("role") === "sitter")
      setRole("SITTER");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "forgot") {
      setError(
        "Password recovery is not enabled yet. Configure an email provider and reset-token workflow before using this feature.",
      );
      return;
    }
    if (mode === "register" && password.length < 10) {
      setError("Use at least 10 characters for your password.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        `/api/auth/${mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "login"
              ? { email, password }
              : { name, email, password, role },
          ),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Unable to authenticate.");
      setDone(true);
      window.dispatchEvent(new Event("petcare-auth-changed"));
      const actualRole = payload.user?.role || role;
      window.setTimeout(
        () =>
          router.push(
            actualRole === "ADMIN"
              ? "/admin/dashboard"
              : actualRole === "SITTER"
                ? mode === "register"
                  ? "/sitter/profile"
                  : "/sitter/dashboard"
                : "/owner/dashboard",
          ),
        350,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to the server.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <div className="auth-visual">
        <Link className="brand" href="/">
          <span className="brandmark">
            <PawPrint size={19} />
          </span>
          petcare.
        </Link>
        <h2
          className="serif"
          style={{ fontSize: 43, color: "var(--deep)", marginTop: 35 }}
        >
          Care that feels
          <br />
          like coming home.
        </h2>
        <p className="subtle">
          A little peace of mind, for you and your best friend.
        </p>
        <img
          src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=85"
          alt="Happy dog relaxing at home"
        />
        <div className="tag">SECURE ACCOUNT ACCESS</div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form">
          <div className="eyebrow">
            {mode === "login"
              ? "Welcome back"
              : mode === "register"
                ? "A lovely place to begin"
                : "Account support"}
          </div>
          <h1 className="serif">
            {mode === "login"
              ? "Good to see you."
              : mode === "register"
                ? "Join the family."
                : "Reset your password."}
          </h1>
          <p className="subtle">
            {mode === "login"
              ? "Sign in to your PetCare account."
              : mode === "register"
                ? "Create your owner or sitter account."
                : "Request account recovery."}
          </p>
          {done ? (
            <div className="notice">
              <b>Your account is ready.</b>
              <p style={{ margin: "8px 0 0" }}>
                You are signed in. Opening your workspace…
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              {mode === "register" && (
                <>
                  <div className="form-control">
                    <label htmlFor="name">Your name</label>
                    <input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      minLength={2}
                    />
                  </div>
                  <div className="form-control">
                    <label htmlFor="role">I’m here as a</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as "OWNER" | "SITTER")}
                    >
                      <option value="OWNER">Pet owner</option>
                      <option value="SITTER">Pet sitter</option>
                    </select>
                  </div>
                </>
              )}
              <div className="form-control">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {mode !== "forgot" && (
                <div className="form-control">
                  <label htmlFor="password">Password</label>
                  <div
                    style={{
                      display: "flex",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      background: "white",
                      paddingRight: 10,
                    }}
                  >
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      required
                      minLength={mode === "register" ? 10 : 1}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "register"
                          ? "At least 10 characters"
                          : "Your password"
                      }
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      style={{ border: 0, flex: 1, minWidth: 0 }}
                    />
                    <button
                      type="button"
                      aria-label={show ? "Hide password" : "Show password"}
                      onClick={() => setShow(!show)}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "var(--muted)",
                      }}
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              {mode === "login" && (
                <div style={{ textAlign: "right", margin: "-5px 0 18px" }}>
                  <Link className="subtle" href="/auth/forgot-password">
                    Forgot password?
                  </Link>
                </div>
              )}
              {error && (
                <div
                  className="notice"
                  role="alert"
                  style={{ color: "#a34c43", marginBottom: 12 }}
                >
                  {error}
                </div>
              )}
              <button className="btn" type="submit" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Log in securely"
                    : mode === "register"
                      ? "Create account"
                      : "Request password reset"}{" "}
                <ArrowRight size={14} />
              </button>
            </form>
          )}
          <p className="subtle" style={{ marginTop: 22 }}>
            {mode === "login" ? (
              <>
                New to PetCare?{" "}
                <Link
                  href="/auth/register"
                  style={{ color: "var(--green)", fontWeight: 800 }}
                >
                  Create an account
                </Link>
              </>
            ) : mode === "register" ? (
              <>
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  style={{ color: "var(--green)", fontWeight: 800 }}
                >
                  Log in
                </Link>
              </>
            ) : (
              <>
                Remembered it?{" "}
                <Link
                  href="/auth/login"
                  style={{ color: "var(--green)", fontWeight: 800 }}
                >
                  Back to login
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
