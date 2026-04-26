import { useEffect, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { formatTime } from "@/lib/format";

type Comment = {
  id: string;
  text: string;
  authorEmail: string;
  createdAt: Timestamp | null;
};

export function CommentSection({ doubtId }: { doubtId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(getDb(), "doubts", doubtId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, "id">) }))
      );
    });
    return () => unsub();
  }, [doubtId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    await addDoc(collection(getDb(), "doubts", doubtId, "comments"), {
      text: text.trim(),
      authorId: user.uid,
      authorEmail: user.email,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="mt-5 border-t border-border pt-4">
      <form onSubmit={submit} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="field min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm"
          required
        />
        <button
          type="submit"
          className="neon-button rounded-full px-4 py-3 text-xs font-semibold sm:px-5"
        >
          Send
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="surface-panel rounded-2xl px-4 py-3 text-sm">
            <div className="text-xs font-semibold text-primary">
              u/{(c.authorEmail || "anon").split("@")[0]}
            </div>
            <div className="mt-1 break-words leading-6 text-foreground">{c.text}</div>
            <div className="mt-2 text-[10px] text-muted-foreground">{formatTime(c.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
