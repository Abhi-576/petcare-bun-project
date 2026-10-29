"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Search,
  RotateCcw,
} from "lucide-react";
import { SitterCard } from "./sitter-card";
import type { Sitter } from "@/lib/data";

type ApiSitter = {
  id: string;
  city: string;
  locality: string | null;
  dailyRate: number;
  yearsExperience: number;
  maxPets: number;
  about: string;
  headline?: string | null;
  acceptedSpecies: string[];
  amenities: string[];
  outdoorSpace: boolean;
  isAvailable: boolean;
  averageRating: number;
  reviewCount: number;
  identityStatus: string;
  addressStatus: string;
  homeStatus: string;
  homeImageUrls: string[];
  user: { id: string; name: string; avatarUrl: string | null };
};
function mapSitter(x: ApiSitter): Sitter {
  const verified = [
    x.identityStatus === "APPROVED"
      ? "Identity approved"
      : `Identity ${x.identityStatus.toLowerCase()}`,
    x.addressStatus === "APPROVED"
      ? "Address approved"
      : `Address ${x.addressStatus.toLowerCase()}`,
    x.homeStatus === "APPROVED"
      ? "Home reviewed"
      : `Home ${x.homeStatus.toLowerCase()}`,
  ];
  return {
    id: x.id,
    name: x.user.name,
    area: [x.locality, x.city].filter(Boolean).join(", "),
    price: x.dailyRate,
    rating: x.averageRating,
    reviews: x.reviewCount,
    experience: `${x.yearsExperience} years of care`,
    bio: x.about,
    image:
      x.homeImageUrls[0] ||
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=85",
    avatar:
      x.user.avatarUrl ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    tags: [
      ...x.acceptedSpecies.map((s) => s[0] + s.slice(1).toLowerCase()),
      ...x.amenities,
      ...(x.outdoorSpace ? ["Outdoor space"] : []),
    ],
    verified,
    capacity: x.maxPets,
    available: x.isAvailable,
    home: x.headline || x.about,
  };
}
export function Marketplace() {
  const params = useSearchParams();
  const [location, setLocation] = useState(params.get("location") || "");
  const [pet, setPet] = useState(params.get("pet")?.toUpperCase() || "Any pet");
  const [max, setMax] = useState("3000");
  const [verified, setVerified] = useState(false);
  const [outdoor, setOutdoor] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    const q = new URLSearchParams({ limit: "50" });
    if (location) q.set("city", location);
    if (query) q.set("q", query);
    if (
      pet !== "Any pet" &&
      ["DOG", "CAT", "BIRD", "RABBIT", "OTHER"].includes(pet)
    )
      q.set("species", pet);
    q.set("maxRate", max);
    fetch(`/api/sitters?${q}`)
      .then((r) =>
        r.json().then((d) => {
          if (!r.ok) throw new Error(d.error || "Could not load sitters");
          return d;
        }),
      )
      .then((d) => {
        if (active) setSitters((d.data as ApiSitter[]).map(mapSitter));
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Could not load sitters");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [location, pet, max, query]);
  const results = useMemo(() => {
    let r = sitters.filter(
      (s) =>
        (!verified || s.verified.includes("Identity approved")) &&
        (!outdoor || s.tags.some((t) => /garden|outdoor/i.test(t))),
    );
    if (sort === "rating") r.sort((a, b) => b.rating - a.rating);
    if (sort === "low") r.sort((a, b) => a.price - b.price);
    if (sort === "high") r.sort((a, b) => b.price - a.price);
    return r;
  }, [sitters, verified, outdoor, sort]);
  function reset() {
    setLocation("");
    setPet("Any pet");
    setMax("3000");
    setVerified(false);
    setOutdoor(false);
    setQuery("");
  }
  return (
    <>
      <section className="page-hero container">
        <div className="eyebrow">The right fit for your best friend</div>
        <h1 className="page-title serif">
          Find their home away
          <br />
          from home.
        </h1>
        <p>
          Meet thoughtful local sitters, explore their spaces and choose care
          that feels right.
        </p>
        <div
          className="searchbox"
          style={{
            maxWidth: 800,
            gridTemplateColumns: "1.2fr 1fr 1fr",
            marginTop: 24,
          }}
        >
          <div className="field">
            <label>Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Area or city"
            />
          </div>
          <div className="field">
            <label>Pet type</label>
            <select value={pet} onChange={(e) => setPet(e.target.value)}>
              <option>Any pet</option>
              <option value="DOG">Dog</option>
              <option value="CAT">Cat</option>
              <option value="BIRD">Bird</option>
              <option value="RABBIT">Rabbit</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Search sitters</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or keyword"
            />
          </div>
        </div>
      </section>
      <section className="container market-layout">
        <aside className={`filters ${showFilters ? "" : "collapsed"}`}>
          <div className="panel-head">
            <h3>
              <SlidersHorizontal
                size={15}
                style={{ display: "inline", marginRight: 6 }}
              />{" "}
              Refine your search
            </h3>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"}
            </button>
          </div>
          <div className="filter-group">
            <h4>Nightly budget · up to ₹{max}</h4>
            <input
              aria-label="Maximum nightly budget"
              type="range"
              min="1000"
              max="3000"
              step="100"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              style={{ width: "100%", accentColor: "var(--green)" }}
            />
            <div className="subtle">
              ₹1,000 <span style={{ float: "right" }}>₹3,000+</span>
            </div>
          </div>
          <div className="filter-group">
            <h4>Trust & home</h4>
            <label className="check">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />{" "}
              Identity approved
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={outdoor}
                onChange={(e) => setOutdoor(e.target.checked)}
              />{" "}
              Outdoor space
            </label>
          </div>
          <button
            className="btn btn-outline"
            style={{ width: "100%" }}
            onClick={reset}
          >
            <RotateCcw size={13} /> Clear all filters
          </button>
        </aside>
        <div>
          <div className="market-tools">
            <div>
              <strong>{loading ? "…" : results.length} sitters</strong>
              <span className="subtle"> · matching your preferences</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                aria-label="Sort sitters"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
              <button
                className={`heart ${view === "grid" ? "active" : ""}`}
                aria-label="Grid view"
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                className={`heart ${view === "list" ? "active" : ""}`}
                aria-label="List view"
                onClick={() => setView("list")}
              >
                <List size={15} />
              </button>
            </div>
          </div>
          {error && (
            <div className="notice" role="alert">
              {error}. Check the database connection and try again.
            </div>
          )}
          {loading ? (
            <div className="panel">Loading available sitter profiles…</div>
          ) : results.length ? (
            <div className={`results-grid ${view}`}>
              {results.map((s) => (
                <SitterCard key={s.id} sitter={s} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={28} color="var(--green)" />
              <h3>No sitters found just yet</h3>
              <p className="subtle">
                Try a broader area or clear a few filters to see available
                profiles.
              </p>
              <button className="btn" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
