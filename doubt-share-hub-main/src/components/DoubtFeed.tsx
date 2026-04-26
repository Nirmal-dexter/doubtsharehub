import { useEffect, useState, type FormEvent } from "react";
import { LogOut, MoonStar, Plus, Sparkles, SunMedium } from "lucide-react";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { DoubtCard, type Doubt } from "./DoubtCard";

type DoubtFeedProps = {
  theme: "dark" | "light";
  toggleTheme: () => void;
};

export function DoubtFeed({ theme, toggleTheme }: DoubtFeedProps) {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(getDb(), "doubts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDoubts(
          snap.docs.map((d) => {
            const data = d.data() as {
              text: string;
              authorEmail: string;
              authorId: string;
              likes?: string[];
              createdAt: Timestamp | null;
            };
            return {
              id: d.id,
              text: data.text,
              authorEmail: data.authorEmail,
              authorId: data.authorId,
              likes: data.likes ?? [],
              createdAt: data.createdAt,
            };
          })
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const post = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setPosting(true);
    try {
      await addDoc(collection(getDb(), "doubts"), {
        text: text.trim(),
        authorId: user.uid,
        authorEmail: user.email,
        likes: [],
        createdAt: serverTimestamp(),
      });
      setText("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="neon-page min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <header className="glass-panel sticky top-4 z-20 rounded-[1.75rem] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="info-chip rounded-full px-3 py-2 text-xs font-semibold">
                {user?.email}
              </div>
              <button
                onClick={toggleTheme}
                className="toggle-button inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <button
                onClick={() => signOut(getFirebaseAuth())}
                className="ghost-button inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="feed-layout mt-5">
          <aside className="desktop-sidebar gap-4">
            <section className="glass-panel rounded-[1.75rem] p-5">
              <p className="floating-label text-xs">Overview</p>
              <h2 className="mt-3 text-2xl font-bold text-foreground">Stay on top of every open question.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                A focused neon workspace for fast peer help, structured threads, and live community signal.
              </p>
            </section>
            <section className="surface-panel rounded-[1.5rem] p-5">
              <div className="grid gap-3">
                {[
                  ["Threads", String(doubts.length)],
                  ["Upvotes", String(doubts.reduce((sum, doubt) => sum + doubt.likes.length, 0))],
                  ["Status", loading ? "Syncing" : "Live"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border bg-background/30 px-4 py-3">
                    <p className="floating-label text-[11px]">{label}</p>
                    <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <div className="flex min-w-0 flex-col gap-5">
            <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="floating-label text-xs">Create thread</p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">Ask a doubt</h2>
                </div>
                <div className="info-chip inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Real-time updates
                </div>
              </div>
              <form onSubmit={post} className="flex flex-col gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What’s your doubt? Be specific so others can help…"
                  required
                  rows={4}
                  className="field min-h-32 resize-y rounded-[1.5rem] px-4 py-3 text-sm leading-6"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={posting}
                    className="neon-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {posting ? "Posting…" : "Post doubt"}
                  </button>
                </div>
              </form>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="floating-label text-xs">Community feed</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Recent doubts</h2>
                </div>
                <div className="info-chip rounded-full px-3 py-2 text-xs font-semibold">
                  {loading ? "Refreshing" : `${doubts.length} live`}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {loading && <p className="glass-panel rounded-3xl px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>}
                {!loading && doubts.length === 0 && (
                  <p className="glass-panel rounded-3xl px-4 py-8 text-center text-sm text-muted-foreground">
                    No doubts yet. Be the first to ask.
                  </p>
                )}
                {doubts.map((d) => (
                  <DoubtCard key={d.id} doubt={d} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
