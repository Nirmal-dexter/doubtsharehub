import { useState, type FormEvent } from "react";
import { MoonStar, Sparkles, SunMedium } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

type AuthScreenProps = {
  theme: "dark" | "light";
  toggleTheme: () => void;
};

export function AuthScreen({ theme, toggleTheme }: AuthScreenProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      if (tab === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="neon-page flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={toggleTheme}
            className="toggle-button inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"
          >
            {theme === "dark" ? (
              <SunMedium className="h-4 w-4" />
            ) : (
              <MoonStar className="h-4 w-4" />
            )}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_minmax(0,28rem)]">
          <section className="glass-panel overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="info-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Peer-to-peer help, instantly
            </div>
            <h2 className="mt-6 max-w-xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Ask clearly. Get sharper answers in a luminous social feed.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Post doubts, upvote what matters, and keep every micro-discussion organized in one
              live collaborative space.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Live feed", "Fresh questions surface the moment they are posted."],
                ["Focused replies", "Inline comments keep every thread readable."],
                ["Signal first", "Upvotes highlight the most useful discussions fast."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="surface-panel animate-float rounded-2xl p-4"
                  style={{ animationDelay: `${title.length * 60}ms` }}
                >
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="floating-label text-xs">Access</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">
                  {tab === "login" ? "Welcome back" : "Create your account"}
                </h2>
              </div>
              <div className="info-chip rounded-full px-3 py-1 text-xs font-semibold">
                Secure Firebase auth
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-border bg-muted/50 p-1">
              {(["login", "signup"] as const).map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setError("");
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      active ? "neon-button" : "ghost-button"
                    }`}
                  >
                    {t === "login" ? "Login" : "Sign up"}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-2">
                <span className="floating-label text-xs">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="field rounded-2xl px-4 py-3 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="floating-label text-xs">Password</span>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="field rounded-2xl px-4 py-3 text-sm"
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="neon-button mt-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {busy ? "Please wait…" : tab === "login" ? "Login" : "Create account"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
