import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AuthScreen } from "@/components/AuthScreen";
import { DoubtFeed } from "@/components/DoubtFeed";
import { isFirebaseConfigured } from "@/lib/firebase";

type ThemeMode = "dark" | "light";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DoubtHub — Peer Doubt Sharing & Micro-Discussions" },
      {
        name: "description",
        content:
          "Post doubts, upvote helpful ones, and discuss with peers in real time on DoubtHub.",
      },
      { property: "og:title", content: "DoubtHub — Peer Doubt Sharing" },
      {
        property: "og:description",
        content: "Real-time peer-to-peer doubt sharing and micro-discussions.",
      },
    ],
  }),
  component: Index,
});

function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("theme-mode");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(prefersLight ? "light" : "dark");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.localStorage.setItem("theme-mode", theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
}

function Shell({ theme, toggleTheme }: { theme: ThemeMode; toggleTheme: () => void }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="neon-page flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel rounded-3xl px-6 py-5">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return user ? (
    <DoubtFeed theme={theme} toggleTheme={toggleTheme} />
  ) : (
    <AuthScreen theme={theme} toggleTheme={toggleTheme} />
  );
}

function SetupNotice({ theme, toggleTheme }: { theme: ThemeMode; toggleTheme: () => void }) {
  return (
    <div className="neon-page flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-2xl rounded-[2rem] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="floating-label text-xs">Configuration</p>
            <h1 className="mt-2 text-3xl font-bold text-glow text-foreground">DoubtHub setup</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="toggle-button rounded-full px-4 py-2 text-sm font-semibold"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Add your Firebase web config to <code className="rounded bg-muted px-1 py-0.5 text-xs">src/lib/firebase.ts</code>{" "}
          to start using the app.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>Go to Firebase Console → Project Settings → Your apps → Web app.</li>
          <li>Copy the <code className="rounded bg-muted px-1 text-xs">firebaseConfig</code> object.</li>
          <li>Replace the placeholder values in <code className="rounded bg-muted px-1 text-xs">src/lib/firebase.ts</code>.</li>
          <li>Enable Email/Password Auth and Firestore in the Firebase Console.</li>
        </ol>
      </div>
    </div>
  );
}

function Index() {
  const themeState = useThemeMode();

  if (!isFirebaseConfigured) return <SetupNotice {...themeState} />;

  return (
    <AuthProvider>
      <Shell {...themeState} />
    </AuthProvider>
  );
}
