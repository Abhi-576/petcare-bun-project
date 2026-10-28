"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  ShieldCheck,
  Star,
  MapPin,
  CheckCircle2,
  Heart,
  House,
  ArrowRight,
  Camera,
} from "lucide-react";
import { money } from "@/lib/utils";
type Profile = {
  id: string;
  about: string;
  headline: string | null;
  city: string;
  locality: string | null;
  dailyRate: number;
  yearsExperience: number;
  maxPets: number;
  acceptedSpecies: string[];
  acceptedSizes: string[];
  homeDescription: string | null;
  homeImageUrls: string[];
  amenities: string[];
  houseRules: string[];
  outdoorSpace: boolean;
  isAvailable: boolean;
  averageRating: number;
  reviewCount: number;
  identityStatus: string;
  addressStatus: string;
  homeStatus: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    author: { name: string };
  }[];
};
export function SitterProfileClient() {
  const { id } = useParams<{ id: string }>();
  const [s, setS] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`/api/sitters/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Sitter profile not found");
        return d.data as Profile;
      })
      .then((v) => {
        if (active) setS(v);
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Unable to load profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (loading)
    return <main className="container section">Loading sitter profile…</main>;
  if (error || !s)
    return (
      <main className="container section">
        <h1 className="serif">We couldn’t find this sitter.</h1>
        <p className="subtle">{error}</p>
        <Link className="btn" href="/sitters">
          Browse sitters
        </Link>
      </main>
    );
  const status = (v: string) =>
    v
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  return (
    <main className="container">
      <div className="page-hero" style={{ paddingBottom: 10 }}>
        <Link href="/sitters" className="subtle">
          ← Back to sitters
        </Link>
      </div>
      <section className="profile-hero">
        <div>
          <img
            className="profile-cover"
            src={
              s.homeImageUrls[0] ||
              "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=85"
            }
            alt={`Home environment hosted by ${s.user.name}`}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {(s.homeImageUrls.slice(1, 4).length
              ? s.homeImageUrls.slice(1, 4)
              : [
                  "https://images.unsplash.com/photo-1601758123927-1968b747d857?auto=format&fit=crop&w=500&q=80",
                  "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=500&q=80",
                  "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=500&q=80",
                ]
            ).map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`Pet care home photo ${i + 1}`}
                style={{
                  width: "32%",
                  height: 105,
                  objectFit: "cover",
                  borderRadius: 10,
                }}
              />
            ))}
          </div>
        </div>
        <aside className="profile-aside">
          <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
            <img
              src={
                s.user.avatarUrl ||
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
              }
              alt={s.user.name}
              className="avatar"
              style={{ width: 72, height: 72, border: 0 }}
            />
            <div>
              <h1 className="serif" style={{ fontSize: 29, margin: "0 0 3px" }}>
                {s.user.name}
              </h1>
              <div className="subtle">
                <MapPin size={12} style={{ display: "inline" }} />{" "}
                {[s.locality, s.city].filter(Boolean).join(", ")}
              </div>
              <div style={{ fontSize: 11, marginTop: 5 }}>
                <Star
                  size={12}
                  fill="#c9a86a"
                  color="#c9a86a"
                  style={{ display: "inline" }}
                />{" "}
                {s.averageRating.toFixed(2)}{" "}
                <span className="subtle">({s.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="verified">
            <ShieldCheck size={13} /> Verification statuses shown individually
          </div>
          <p className="subtle" style={{ lineHeight: 1.9, marginTop: 15 }}>
            {s.about}
          </p>
          <div className="stats-row">
            <div className="stat">
              <strong>{s.yearsExperience}</strong>
              <span>Years experience</span>
            </div>
            <div className="stat">
              <strong>{s.maxPets}</strong>
              <span>Pets at a time</span>
            </div>
            <div className="stat">
              <strong>{s.isAvailable ? "Open" : "Closed"}</strong>
              <span>Availability</span>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--line)",
              marginTop: 20,
              paddingTop: 18,
            }}
          >
            <div className="price" style={{ fontSize: 25 }}>
              {money(s.dailyRate)} <small>/ night</small>
            </div>
            <div className="subtle">Itemised total shown before request</div>
            <Link
              className="btn"
              href={`/booking/${s.id}`}
              style={{ width: "100%", marginTop: 15 }}
              aria-disabled={!s.isAvailable}
            >
              Request a stay <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </section>
      <section className="profile-details">
        <div>
          <div className="content-block">
            <div className="eyebrow">A little about the home</div>
            <h2 className="serif">Comfort, care & familiar routines.</h2>
            <p>{s.homeDescription || s.about}</p>
          </div>
          <div className="content-block">
            <h2 className="serif">Accepted pets & amenities</h2>
            <div className="tag-row">
              {s.acceptedSpecies.map((t) => (
                <span className="tag" key={t}>
                  {t[0] + t.slice(1).toLowerCase()}
                </span>
              ))}
              {s.amenities.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
              {s.outdoorSpace && <span className="tag">Outdoor space</span>}
            </div>
            <p>Capacity: up to {s.maxPets} pets at a time.</p>
            {s.houseRules.length > 0 && (
              <>
                <h3>House rules</h3>
                <ul>
                  {s.houseRules.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="content-block">
            <h2 className="serif">Trust & verification</h2>
            {[
              ["Identity", s.identityStatus],
              ["Address", s.addressStatus],
              ["Home review", s.homeStatus],
            ].map(([label, value]) => (
              <div className="list-row" key={label}>
                <CheckCircle2
                  size={17}
                  color={value === "APPROVED" ? "var(--green)" : "#b6a06b"}
                />
                <div className="row-info">
                  <strong>{label} check</strong>
                  <small>{status(value)}</small>
                </div>
                <span
                  className={`status ${value === "APPROVED" ? "green" : ""}`}
                >
                  {status(value)}
                </span>
              </div>
            ))}
          </div>
          <div className="content-block">
            <h2 className="serif">Reviews</h2>
            {s.reviews.length ? (
              s.reviews.map((r) => (
                <div className="quote" key={r.id}>
                  <div style={{ color: "#c9a86a" }}>
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                  <p>{r.comment || "No written comment."}</p>
                  <small>— {r.author.name}</small>
                </div>
              ))
            ) : (
              <p className="subtle">No published reviews yet.</p>
            )}
          </div>
        </div>
        <aside>
          <div className="panel" style={{ position: "sticky", top: 100 }}>
            <h3>Request a stay</h3>
            <p className="subtle">
              Choose dates and a pet to begin a booking request.
            </p>
            <Link
              className="btn"
              href={`/booking/${s.id}`}
              style={{ width: "100%", marginTop: 15 }}
            >
              <CalendarDays size={14} /> Choose dates & pet
            </Link>
            <p className="subtle" style={{ marginTop: 10 }}>
              You’ll sign in before submitting a request.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
