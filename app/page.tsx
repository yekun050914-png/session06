"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/jeonhae-supabase";
import styles from "./page.module.css";

type Post = {
  id: string;
  nickname: string | null;
  content: string;
  created_at: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { data, error } = await supabase
        .from("posts")
        .select("id, nickname, content, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (ignore) return;
      if (error) setError("목록을 불러오지 못했어요: " + error.message);
      else setPosts(data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = nickname.trim();
    const text = content.trim();
    if (!name || !text) return;
    if (!window.confirm("진짜 올릴건가요?")) return;
    setSending(true);
    setError("");
    const { data, error } = await supabase
      .from("posts")
      .insert({ nickname: name, content: text })
      .select("id, nickname, content, created_at")
      .single();
    setSending(false);
    if (error) {
      setError("전하지 못했어요: " + error.message);
      return;
    }
    setPosts((prev) => [data, ...prev]);
    setContent("");
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.next}>NEXT</span> 대신 전해드립니다
        </h1>
        <p className={styles.sub}>
          <span className={styles.next}>next</span> 15기 익명 속마음 전하기.
          못생겼어요 이런 나쁜 말은 ㄴㄴ
        </p>

        <form onSubmit={submit} className={styles.form}>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="별명 (최대 20자)"
            maxLength={20}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="속마음을 적어주세요 (최대 500자)"
            maxLength={500}
            rows={4}
          />
          <div className={styles.row}>
            <span>{content.length} / 500</span>
            <button
              type="submit"
              disabled={sending || !content.trim() || !nickname.trim()}
            >
              {sending ? "전하는 중..." : "전하기"}
            </button>
          </div>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.list}>
          {loading && <p className={styles.empty}>불러오는 중...</p>}
          {!loading && posts.length === 0 && (
            <p className={styles.empty}>아직 전해진 마음이 없어요.</p>
          )}
          {posts.map((p) => (
            <article key={p.id} className={styles.card}>
              <div className={styles.meta}>
                <span className={styles.nick}>{p.nickname || "익명"}</span>
                <time>{new Date(p.created_at).toLocaleString("ko-KR")}</time>
              </div>
              <p>{p.content}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
