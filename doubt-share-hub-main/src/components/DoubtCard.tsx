import { useState } from "react";
import { ArrowBigUp, MessageSquare } from "lucide-react";
import { arrayRemove, arrayUnion, doc, updateDoc, type Timestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { formatTime } from "@/lib/format";
import { CommentSection } from "./CommentSection";

export type Doubt = {
  id: string;
  text: string;
  authorEmail: string;
  authorId: string;
  likes: string[];
  createdAt: Timestamp | null;
};

export function DoubtCard({ doubt }: { doubt: Doubt }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const liked = !!user && doubt.likes.includes(user.uid);

  const toggleLike = async () => {
    if (!user) return;
    const ref = doc(getDb(), "doubts", doubt.id);
    await updateDoc(ref, {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const author = (doubt.authorEmail || "anon").split("@")[0];

  return (
    <article className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 font-semibold text-primary shadow-neon">
            {author.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <div className="font-semibold text-foreground">u/{author}</div>
            <div>{formatTime(doubt.createdAt)}</div>
          </div>
        </div>
        <span className="info-chip rounded-full px-3 py-1 font-semibold">Open thread</span>
      </div>

      <p className="whitespace-pre-wrap break-words text-base leading-7 text-foreground sm:text-[1.05rem]">
        {doubt.text}
      </p>

      <div className="soft-divider mt-5 h-px w-full" />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${
            liked ? "neon-button" : "ghost-button"
          }`}
        >
          <ArrowBigUp className="h-4 w-4" />
          {doubt.likes.length}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="ghost-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
        >
          <MessageSquare className="h-4 w-4" />
          {showComments ? "Hide comments" : "Comments"}
        </button>
      </div>

      {showComments && <CommentSection doubtId={doubt.id} />}
    </article>
  );
}
