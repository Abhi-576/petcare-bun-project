"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, MapPin, Star, ShieldCheck, ArrowUpRight } from "lucide-react";
import type { Sitter } from "@/lib/data";
import { money } from "@/lib/utils";
export function SitterCard({ sitter: s }: { sitter: Sitter }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let ok = true;
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (ok && d?.data)
          setSaved(
            d.data.some((f: { sitterId: string }) => f.sitterId === s.id),
          );
      })
      .catch(() => {});
    return () => {
      ok = false;
    };
  }, [s.id]);
  async function toggle() {
    setBusy(true);
    try {
      const res = saved
        ? await fetch(`/api/favorites?sitterId=${encodeURIComponent(s.id)}`, {
            method: "DELETE",
          })
        : await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sitterId: s.id }),
          });
      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Could not update favourites");
      }
      setSaved(!saved);
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Could not update favourites",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="sitter-card">
      <Link href={`/sitters/${s.id}`}>
        <img
          className="sitter-cover"
          src={s.image}
          alt={`Welcoming home hosted by ${s.name}`}
        />
      </Link>
      <div className="sitter-body">
        <div className="sitter-person">
          <img className="avatar" src={s.avatar} alt="" />
          <div style={{ paddingTop: 24, flex: 1 }}>
            <p className="sitter-name">{s.name}</p>
            <div className="subtle">
              <MapPin
                size={11}
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              {s.area}
            </div>
          </div>
          <button
            aria-label={saved ? "Remove from favourites" : "Save sitter"}
            disabled={busy}
            className={`heart ${saved ? "active" : ""}`}
            onClick={toggle}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="verified">
          <ShieldCheck size={12} />
          {s.verified[0] || "Verification not started"}
        </div>
        <div className="card-meta">
          <span>
            <Star
              size={12}
              fill="#c9a86a"
              color="#c9a86a"
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            <b>{s.rating.toFixed(2)}</b>{" "}
            <span className="subtle">({s.reviews} reviews)</span>
          </span>
          <span className="subtle">{s.experience}</span>
        </div>
        <div className="tag-row">
          {s.tags.slice(0, 3).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="card-bottom">
          <div>
            <span className="price">{money(s.price)}</span>
            <small className="subtle"> / night</small>
            <div className="subtle">
              {s.available
                ? "Available for requests"
                : "Not currently available"}
            </div>
          </div>
          <Link href={`/sitters/${s.id}`} className="btn btn-small">
            View profile <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
