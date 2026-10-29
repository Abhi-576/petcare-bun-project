"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, MapPin, Star } from "lucide-react";
import { money } from "@/lib/utils";
type Conversation = {
  id: string;
  bookingId: string;
  booking: {
    id: string;
    status: string;
    pet: { name: string };
    owner: { id: string; name: string };
    sitter: {
      user: { id: string; name: string };
      city: string;
      locality: string | null;
    };
  };
  messages: {
    id: string;
    body: string;
    createdAt: string;
    sender: { id: string; name: string };
  }[];
};
export function MessagesPanel({
  role,
}: {
  role: "owner" | "sitter" | "admin";
}) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState("");
  const [body, setBody] = useState("");
  const [me, setMe] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    try {
      const [mr, cr] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/messages"),
      ]);
      if (mr.ok) {
        const m = await mr.json();
        setMe(m.user?.id || "");
      }
      const d = await cr.json();
      if (!cr.ok) throw new Error(d.error || "Could not load messages");
      setItems(d.data || []);
      setSelected((current) => current || d.data?.[0]?.bookingId || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load messages");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const current = items.find((x) => x.bookingId === selected);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !selected) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: selected, body }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not send message");
      setBody("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send message");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Booking conversations</h3>
        <span className="status">Account messages</span>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <MessageCircle size={28} />
          <h3>No conversations yet</h3>
          <p className="subtle">
            Messages become available when a booking conversation is started.
          </p>
          <Link
            className="btn btn-outline"
            href={role === "owner" ? "/sitters" : "/sitter/bookings"}
          >
            {role === "owner" ? "Find a sitter" : "View booking requests"}
          </Link>
        </div>
      ) : (
        <>
          <div className="form-control">
            <label htmlFor="conversation">Choose a booking</label>
            <select
              id="conversation"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {items.map((c) => (
                <option key={c.bookingId} value={c.bookingId}>
                  {c.booking.pet.name} · {c.booking.owner.name} /{" "}
                  {c.booking.sitter.user.name}
                </option>
              ))}
            </select>
          </div>
          {current && (
            <>
              <div
                style={{
                  minHeight: 220,
                  maxHeight: 420,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  justifyContent: "end",
                  padding: "18px 0",
                }}
              >
                {current.messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender.id === me ? "flex-end" : "flex-start",
                      background:
                        m.sender.id === me ? "var(--sage)" : "#f5f3ed",
                      padding: "12px 15px",
                      borderRadius: 12,
                      maxWidth: "82%",
                      fontSize: 12,
                    }}
                  >
                    {m.body}
                    <div className="subtle" style={{ marginTop: 5 }}>
                      {m.sender.name} · {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} style={{ display: "flex", gap: 8 }}>
                <input
                  className="control"
                  style={{ flex: 1 }}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a message…"
                  maxLength={2000}
                  required
                />
                <button className="btn" disabled={busy} type="submit">
                  <Send size={14} /> {busy ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          )}
        </>
      )}
      {error && (
        <div role="alert" className="notice" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
      <p className="subtle" style={{ marginTop: 12 }}>
        Messages are saved to your account and visible to the booking
        participants.
      </p>
    </section>
  );
}

type Favorite = {
  id: string;
  sitterId: string;
  sitter: {
    id: string;
    dailyRate: number;
    city: string;
    locality: string | null;
    averageRating: number;
    reviewCount: number;
    user: { name: string; avatarUrl: string | null };
    homeImageUrls: string[];
    about: string;
  };
};
export function FavoritesPanel() {
  const [items, setItems] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/favorites");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load favourites");
      setItems(d.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load favourites");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function remove(id: string) {
    const r = await fetch(`/api/favorites?sitterId=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (r.ok) setItems((old) => old.filter((x) => x.sitterId !== id));
    else setError("Could not remove this sitter from favourites.");
  }
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Saved sitters</h3>
        <Link className="btn btn-small" href="/sitters">
          Discover sitters
        </Link>
      </div>
      {loading ? (
        <p className="subtle">Loading your saved sitters…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Heart size={28} />
          <h3>No favourites yet</h3>
          <p className="subtle">
            Save a sitter from the marketplace and they’ll appear here.
          </p>
          <Link className="btn" href="/sitters">
            Explore sitters
          </Link>
        </div>
      ) : (
        <div className="sitter-grid">
          {items.map(({ sitter: s, sitterId }) => (
            <article className="sitter-card" key={sitterId}>
              <Link href={`/sitters/${sitterId}`}>
                <img
                  className="sitter-cover"
                  src={
                    s.homeImageUrls[0] ||
                    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=85"
                  }
                  alt={`Home hosted by ${s.user.name}`}
                />
              </Link>
              <div className="sitter-body">
                <h3>{s.user.name}</h3>
                <p className="subtle">
                  <MapPin size={12} style={{ display: "inline" }} />{" "}
                  {[s.locality, s.city].filter(Boolean).join(", ")}
                </p>
                <p>
                  <Star size={12} style={{ display: "inline" }} />{" "}
                  {s.averageRating.toFixed(2)} · {s.reviewCount} reviews
                </p>
                <b>
                  {money(s.dailyRate)} <small>/ night</small>
                </b>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Link className="btn btn-small" href={`/sitters/${sitterId}`}>
                    View profile
                  </Link>
                  <button
                    className="btn btn-outline btn-small"
                    onClick={() => remove(sitterId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}

export function StayUpdatesPanel() {
  const [bookings, setBookings] = useState<
    {
      id: string;
      pet: { name: string };
      status: string;
      checkIn: string;
      checkOut: string;
    }[]
  >([]);
  const [bookingId, setBookingId] = useState("");
  const [updates, setUpdates] = useState<
    { id: string; type: string; message: string; createdAt: string }[]
  >([]);
  const [type, setType] = useState("NOTE");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function loadBookings() {
    const r = await fetch("/api/bookings");
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Could not load stays");
    const list = (d.data || []).filter((b: { status: string }) =>
      ["CHECKED_IN", "ACTIVE"].includes(b.status),
    );
    setBookings(list);
    setBookingId((current) => current || list[0]?.id || "");
  }
  useEffect(() => {
    loadBookings().catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    fetch(`/api/bookings/${bookingId}/updates`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Could not load stay updates");
        return d.data;
      })
      .then((d) => {
        if (active) setUpdates(d || []);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [bookingId]);
  async function submit() {
    if (!bookingId || !message.trim()) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/bookings/${bookingId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save update");
      setUpdates((old) => [d.data, ...old]);
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save update");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h3>Stay care journal</h3>
          <span className="status green">Connected</span>
        </div>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No active stays</h3>
            <p className="subtle">
              Stay updates can be posted after a booking is checked in.
            </p>
            <Link className="btn btn-outline" href="/sitter/bookings">
              View booking requests
            </Link>
          </div>
        ) : (
          <>
            <div className="form-control">
              <label htmlFor="stay-booking">Active booking</label>
              <select
                id="stay-booking"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.pet.name} · {new Date(b.checkIn).toLocaleDateString()} –{" "}
                    {new Date(b.checkOut).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-control">
                <label htmlFor="stay-type">Update type</label>
                <select
                  id="stay-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="NOTE">General note</option>
                  <option value="FOOD">Meal</option>
                  <option value="WALK">Walk / activity</option>
                  <option value="MEDICATION">Medication</option>
                  <option value="CHECK_IN">Check-in</option>
                  <option value="CHECK_OUT">Check-out</option>
                </select>
              </div>
              <div className="form-control">
                <label htmlFor="stay-note">Short note</label>
                <input
                  id="stay-note"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a care update…"
                  maxLength={2000}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn"
                disabled={busy || !message.trim()}
                onClick={submit}
              >
                {busy ? "Saving…" : "Save update"}
              </button>
            </div>
          </>
        )}
      </section>
      <section className="panel">
        <h3>Recent updates</h3>
        {updates.length ? (
          updates.map((u) => (
            <div className="list-row" key={u.id}>
              <span className="note-icon">
                {/* <Camera size={17} /> */}
              </span>
              <div className="row-info">
                <strong>{u.message}</strong>
                <small>
                  {u.type.replaceAll("_", " ")} ·{" "}
                  {new Date(u.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        ) : (
          <p className="subtle">
            No updates have been posted for this stay yet.
          </p>
        )}
        {error && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}
      </section>
    </>
  );
}

type SitterFormData = {
  headline: string;
  about: string;
  city: string;
  locality: string;
  dailyRate: number;
  yearsExperience: number;
  maxPets: number;
  acceptedSpecies: string[];
  acceptedSizes: string[];
  homeDescription: string;
  amenities: string[];
  houseRules: string[];
  outdoorSpace: boolean;
  isAvailable: boolean;
};
export function SitterProfilePanel() {
  const [form, setForm] = useState<SitterFormData>({
    headline: "",
    about: "",
    city: "",
    locality: "",
    dailyRate: 1200,
    yearsExperience: 0,
    maxPets: 1,
    acceptedSpecies: ["DOG", "CAT"],
    acceptedSizes: ["small", "medium"],
    homeDescription: "",
    amenities: [],
    houseRules: [],
    outdoorSpace: false,
    isAvailable: true,
  });
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/sitter/profile"), fetch("/api/auth/me")])
      .then(async ([pr, mr]) => {
        const pd = await pr.json();
        const md = await mr.json();
        if (!pr.ok)
          throw new Error(pd.error || "Could not load sitter profile");
        if (active) {
          setName(md.user?.name || "");
          if (pd.data)
            setForm({
              ...form,
              ...pd.data,
              locality: pd.data.locality || "",
              homeDescription: pd.data.homeDescription || "",
              acceptedSpecies: pd.data.acceptedSpecies || ["DOG", "CAT"],
              acceptedSizes: pd.data.acceptedSizes || ["small", "medium"],
              amenities: pd.data.amenities || [],
              houseRules: pd.data.houseRules || [],
            });
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  function change<K extends keyof SitterFormData>(
    key: K,
    value: SitterFormData[K],
  ) {
    setForm((old) => ({ ...old, [key]: value }));
  }
  function toggleArray(
    key: "acceptedSpecies" | "acceptedSizes",
    value: string,
  ) {
    const current = form[key];
    change(
      key,
      (current.includes(value)
        ? current.filter((x) => x !== value)
        : [...current, value]) as SitterFormData[typeof key],
    );
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const [pr, nr] = await Promise.all([
        fetch("/api/sitter/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            locality: form.locality || undefined,
            headline: form.headline || undefined,
            homeDescription: form.homeDescription || undefined,
          }),
        }),
        fetch("/api/account", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }),
      ]);
      const pd = await pr.json();
      if (!pr.ok) throw new Error(pd.error || "Could not save sitter profile");
      const nd = await nr.json();
      if (!nr.ok) throw new Error(nd.error || "Could not save account name");
      setSuccess("Your sitter profile has been saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Public profile details</h3>
        <span className="status">Connected</span>
      </div>
      {loading ? (
        <p className="subtle">Loading your profile…</p>
      ) : (
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-control">
              <label htmlFor="sitter-name">Display name</label>
              <input
                id="sitter-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="form-control">
              <label htmlFor="sitter-headline">Profile headline</label>
              <input
                id="sitter-headline"
                value={form.headline}
                onChange={(e) => change("headline", e.target.value)}
                maxLength={140}
              />
            </div>
            <div className="form-control">
              <label htmlFor="sitter-city">City</label>
              <input
                id="sitter-city"
                value={form.city}
                onChange={(e) => change("city", e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="form-control">
              <label htmlFor="sitter-locality">Neighbourhood</label>
              <input
                id="sitter-locality"
                value={form.locality}
                onChange={(e) => change("locality", e.target.value)}
              />
            </div>
            <div className="form-control">
              <label htmlFor="sitter-rate">Nightly rate (INR)</label>
              <input
                id="sitter-rate"
                type="number"
                min="100"
                max="100000"
                value={form.dailyRate}
                onChange={(e) => change("dailyRate", Number(e.target.value))}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="sitter-experience">Years of experience</label>
              <input
                id="sitter-experience"
                type="number"
                min="0"
                max="80"
                value={form.yearsExperience}
                onChange={(e) =>
                  change("yearsExperience", Number(e.target.value))
                }
              />
            </div>
            <div className="form-control">
              <label htmlFor="sitter-capacity">Maximum pets</label>
              <input
                id="sitter-capacity"
                type="number"
                min="1"
                max="20"
                value={form.maxPets}
                onChange={(e) => change("maxPets", Number(e.target.value))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="sitter-species">Accepted pets</label>
              <select
                id="sitter-species"
                value={form.acceptedSpecies[0] || "DOG"}
                onChange={(e) => change("acceptedSpecies", [e.target.value])}
              >
                <option value="DOG">Dogs</option>
                <option value="CAT">Cats</option>
                <option value="BIRD">Birds</option>
                <option value="RABBIT">Rabbits</option>
                <option value="OTHER">Other pets</option>
              </select>
            </div>
            <div className="form-control" style={{ gridColumn: "1/-1" }}>
              <label htmlFor="sitter-about">About your care</label>
              <textarea
                id="sitter-about"
                value={form.about}
                onChange={(e) => change("about", e.target.value)}
                required
                minLength={20}
                maxLength={4000}
              />
            </div>
            <div className="form-control" style={{ gridColumn: "1/-1" }}>
              <label htmlFor="sitter-home">About your home</label>
              <textarea
                id="sitter-home"
                value={form.homeDescription}
                onChange={(e) => change("homeDescription", e.target.value)}
              />
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={form.outdoorSpace}
                onChange={(e) => change("outdoorSpace", e.target.checked)}
              />{" "}
              Outdoor space available
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => change("isAvailable", e.target.checked)}
              />{" "}
              Accepting booking requests
            </label>
          </div>
          {error && (
            <div className="notice" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="notice" role="status">
              {success}
            </div>
          )}
          <div className="form-actions">
            <button className="btn" disabled={busy} type="submit">
              {busy ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export function AvailabilityPanel() {
  const [days, setDays] = useState<
    { id: string; date: string; isAvailable: boolean; note: string | null }[]
  >([]);
  const [profileExists, setProfileExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/sitter/availability");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load availability");
      setDays(d.data || []);
      setProfileExists(d.profileExists !== false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load availability");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function toggle(date: string, available: boolean) {
    setSaving(date);
    setError("");
    try {
      const r = await fetch("/api/sitter/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, isAvailable: available }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not update availability");
      setDays((old) => {
        const exists = old.some((x) => x.date.slice(0, 10) === date);
        return exists
          ? old.map((x) => (x.date.slice(0, 10) === date ? d.data : x))
          : [...old, d.data].sort((a, b) => a.date.localeCompare(b.date));
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not update availability",
      );
    } finally {
      setSaving("");
    }
  }
  const nextDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    const found = days.find((x) => x.date.slice(0, 10) === date);
    return { date, available: found?.isAvailable ?? true, explicit: !!found };
  });
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Availability calendar</h3>
        <span className="status">Saved to account</span>
      </div>
      <p className="subtle">
        Select a date to mark it available or unavailable. Confirmed stays
        cannot be blocked.
      </p>
      {!loading && !profileExists ? (
        <div className="notice" role="alert">
          <h3>Finish your sitter profile first</h3>
          <p>
            Availability can only be saved after you create your public sitter
            profile. This is also required before you can appear in sitter
            search.
          </p>
          <Link className="btn" href="/sitter/profile">
            Create sitter profile
          </Link>
        </div>
      ) : loading ? (
        <p className="subtle">Loading availability…</p>
      ) : (
        <div className="sitter-grid">
          {nextDays.map((d) => (
            <button
              key={d.date}
              disabled={saving === d.date}
              className={`panel ${d.available ? "" : "notice"}`}
              style={{
                textAlign: "left",
                cursor: "pointer",
                minHeight: 72,
                borderColor: d.available ? "var(--line)" : "#d6b8aa",
              }}
              onClick={() => toggle(d.date, !d.available)}
            >
              <b>
                {new Date(`${d.date}T12:00:00`).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </b>
              <div className="subtle" style={{ marginTop: 7 }}>
                {saving === d.date
                  ? "Saving…"
                  : d.available
                    ? "Available"
                    : "Unavailable"}
              </div>
            </button>
          ))}
        </div>
      )}
      {error && (
        <div className="notice" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </section>
  );
}

export function AdminDataPanel({
  section,
}: {
  section: "users" | "verifications" | "reports";
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Care concern");
  const [description, setDescription] = useState("");
  async function load() {
    try {
      const r = await fetch(
        `/api/admin/${section}${section === "users" && query ? `?q=${encodeURIComponent(query)}` : ""}`,
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load records");
      setRows(d.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load records");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [section]);
  async function update(id: string, payload: Record<string, string>) {
    setError("");
    try {
      const r = await fetch(
        `/api/admin/${section}${section === "users" || section === "reports" ? `/${id}` : ""}`,
        {
          method:
            section === "users" ||
            section === "verifications" ||
            section === "reports"
              ? "PATCH"
              : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            section === "verifications" ? { id, ...payload } : payload,
          ),
        },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not update record");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update record");
    }
  }
  async function createReport(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not create report");
      setDescription("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create report");
    }
  }
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>
          {section === "users"
            ? "User directory"
            : section === "verifications"
              ? "Verification queue"
              : "Reports & complaints"}
        </h3>
        {section === "users" && (
          <input
            className="control"
            placeholder="Search name or email"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
          />
        )}
        <span className="status">Database records</span>
      </div>
      {section === "reports" && (
        <form
          onSubmit={createReport}
          className="form-grid"
          style={{ marginBottom: 20 }}
        >
          <div className="form-control">
            <label htmlFor="report-category">Category</label>
            <select
              id="report-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Care concern</option>
              <option>Communication issue</option>
              <option>Profile information</option>
              <option>Safety concern</option>
              <option>Booking dispute</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="report-description">Report details</label>
            <input
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={5}
              maxLength={4000}
              required
              placeholder="Describe the concern"
            />
          </div>
          <div>
            <button className="btn" type="submit">
              Create report
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p className="subtle">Loading records…</p>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <h3>No records found</h3>
          <p className="subtle">
            Records will appear here as users create accounts and submit
            requests.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {(section === "users"
                  ? ["User", "Email", "Role", "Status", "Actions"]
                  : section === "verifications"
                    ? ["Applicant", "Type", "Submitted", "Status", "Review"]
                    : [
                        "Category",
                        "Description",
                        "Reporter",
                        "Status",
                        "Resolution",
                      ]
                ).map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = String(row.id || "");
                if (section === "users") {
                  return (
                    <tr key={id}>
                      <td>
                        <b>{String(row.name || "")}</b>
                      </td>
                      <td>{String(row.email || "")}</td>
                      <td>{String(row.role || "")}</td>
                      <td>
                        <span className="status">
                          {String(row.status || "")}
                        </span>
                      </td>
                      <td>
                        <select
                          aria-label={`Change status for ${String(row.name || row.email || "user")}`}
                          defaultValue={String(row.status)}
                          onChange={(e) =>
                            void update(id, { status: e.target.value })
                          }
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="DEACTIVATED">Deactivated</option>
                        </select>
                      </td>
                    </tr>
                  );
                }
                if (section === "verifications") {
                  const u = row.user as
                    { name?: string; email?: string } | undefined;
                  return (
                    <tr key={id}>
                      <td>
                        <b>{u?.name || u?.email || "Applicant"}</b>
                      </td>
                      <td>{String(row.kind || "")}</td>
                      <td>
                        {row.submittedAt
                          ? new Date(
                              String(row.submittedAt),
                            ).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        <span className="status">
                          {String(row.status || "")}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              void update(id, { status: "APPROVED" })
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline btn-small"
                            onClick={() =>
                              void update(id, {
                                status: "REJECTED",
                                rejectionReason:
                                  note ||
                                  "Please provide the required information.",
                              })
                            }
                          >
                            Reject
                          </button>
                        </div>
                        <input
                          className="control"
                          placeholder="Rejection reason (optional)"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          style={{ marginTop: 6 }}
                        />
                      </td>
                    </tr>
                  );
                }
                const reporter = row.reporter as { name?: string } | undefined;
                return (
                  <tr key={id}>
                    <td>{String(row.category || "")}</td>
                    <td>{String(row.description || "")}</td>
                    <td>{reporter?.name || "—"}</td>
                    <td>
                      <span className="status">{String(row.status || "")}</span>
                    </td>
                    <td>
                      <select
                        aria-label="Report status"
                        value={String(row.status)}
                        onChange={(e) =>
                          void update(id, {
                            status: e.target.value,
                            resolutionNote: note,
                          })
                        }
                      >
                        <option value="OPEN">Open</option>
                        <option value="UNDER_REVIEW">Under review</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="DISMISSED">Dismissed</option>
                      </select>
                      <input
                        className="control"
                        placeholder="Internal note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{ marginTop: 6 }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {error && (
        <div className="notice" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </section>
  );
}

export function PetDetailPanel() {
  const [id, setId] = useState("");
  const [pet, setPet] = useState<{
    id: string;
    name: string;
    species: string;
    breed: string | null;
    ageYears: number | null;
    weightKg: number | null;
    temperament: string | null;
    feedingInstructions: string | null;
    allergies: string | null;
    medicationNotes: string | null;
    vetName: string | null;
    vetPhone: string | null;
    emergencyContact: string | null;
    notes: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const petId = parts[parts.length - 1];
    setId(petId);
    fetch(`/api/pets/${petId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Pet not found");
        setPet(d.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  function change<K extends keyof NonNullable<typeof pet>>(
    key: K,
    value: NonNullable<typeof pet>[K],
  ) {
    setPet((old) => (old ? { ...old, [key]: value } : old));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!pet) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const r = await fetch(`/api/pets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pet),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not update pet");
      setPet(d.data);
      setSuccess("Pet profile updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update pet");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <section className="panel">Loading pet profile…</section>;
  if (!pet)
    return (
      <section className="panel">
        <h3>Pet profile unavailable</h3>
        <p className="subtle">{error}</p>
        <Link className="btn" href="/owner/pets">
          Back to pets
        </Link>
      </section>
    );
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Edit {pet.name}'s care profile</h3>
        <Link className="btn btn-outline btn-small" href="/owner/pets">
          Back to pets
        </Link>
      </div>
      <form onSubmit={save}>
        <div className="form-grid">
          <div className="form-control">
            <label htmlFor="pet-edit-name">Name</label>
            <input
              id="pet-edit-name"
              value={pet.name}
              onChange={(e) => change("name", e.target.value)}
              required
              maxLength={80}
            />
          </div>
          <div className="form-control">
            <label htmlFor="pet-edit-species">Species</label>
            <select
              id="pet-edit-species"
              value={pet.species}
              onChange={(e) => change("species", e.target.value)}
            >
              {["DOG", "CAT", "BIRD", "RABBIT", "OTHER"].map((v) => (
                <option key={v} value={v}>
                  {v[0] + v.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="pet-edit-breed">Breed</label>
            <input
              id="pet-edit-breed"
              value={pet.breed || ""}
              onChange={(e) => change("breed", e.target.value || null)}
              maxLength={100}
            />
          </div>
          <div className="form-control">
            <label htmlFor="pet-edit-age">Age in years</label>
            <input
              id="pet-edit-age"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={pet.ageYears ?? ""}
              onChange={(e) =>
                change(
                  "ageYears",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            />
          </div>
          <div className="form-control">
            <label htmlFor="pet-edit-weight">Weight in kg</label>
            <input
              id="pet-edit-weight"
              type="number"
              min="0"
              max="500"
              step="0.1"
              value={pet.weightKg ?? ""}
              onChange={(e) =>
                change(
                  "weightKg",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            />
          </div>
          <div className="form-control">
            <label htmlFor="pet-edit-temperament">Temperament</label>
            <input
              id="pet-edit-temperament"
              value={pet.temperament || ""}
              onChange={(e) => change("temperament", e.target.value || null)}
              maxLength={500}
            />
          </div>
          {(
            [
              ["feedingInstructions", "Feeding instructions"],
              ["allergies", "Allergies"],
              ["medicationNotes", "Medication notes"],
              ["vetName", "Veterinarian"],
              ["vetPhone", "Veterinarian phone"],
              ["emergencyContact", "Emergency contact"],
              ["notes", "Additional care notes"],
            ] as const
          ).map(([key, label]) => (
            <div className="form-control" key={key}>
              <label htmlFor={`pet-${key}`}>{label}</label>
              <textarea
                id={`pet-${key}`}
                value={pet[key] || ""}
                onChange={(e) => change(key, e.target.value || null)}
              />
            </div>
          ))}
        </div>
        {error && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="notice" role="status">
            {success}
          </div>
        )}
        <div className="form-actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save pet profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function AccountSettingsPanel() {
  const [form, setForm] = useState({ name: "", phone: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/account")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Could not load account");
        if (active)
          setForm({
            name: d.data.name || "",
            phone: d.data.phone || "",
            bio: d.data.bio || "",
          });
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const r = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone || null,
          bio: form.bio || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save account");
      setSuccess("Account details saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save account");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Account settings</h3>
        <span className="status">Connected</span>
      </div>
      {loading ? (
        <p className="subtle">Loading account details…</p>
      ) : (
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-control">
              <label htmlFor="account-name">Display name</label>
              <input
                id="account-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                minLength={2}
                maxLength={80}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="account-phone">Phone number</label>
              <input
                id="account-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={40}
              />
            </div>
            <div className="form-control" style={{ gridColumn: "1/-1" }}>
              <label htmlFor="account-bio">About you</label>
              <textarea
                id="account-bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={2000}
              />
            </div>
          </div>
          {error && (
            <div className="notice" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="notice" role="status">
              {success}
            </div>
          )}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save account details"}
            </button>
          </div>
        </form>
      )}
      <p className="subtle" style={{ marginTop: 14 }}>
        Password reset email and external notification preferences require
        provider setup.
      </p>
    </section>
  );
}

export function BookingDetailPanel() {
  const [booking, setBooking] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [id, setId] = useState("");
  useEffect(() => {
    const bookingId = window.location.pathname.split("/").pop() || "";
    setId(bookingId);
    fetch(`/api/bookings/${bookingId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Booking not found");
        setBooking(d.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function cancel() {
    if (!booking) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          cancellationReason: "Cancelled by owner",
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not cancel booking");
      setBooking((old: any) => ({ ...old, ...d.data }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel booking");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <section className="panel">Loading booking…</section>;
  if (!booking)
    return (
      <section className="panel">
        <h3>Booking not found</h3>
        <p className="subtle">{error}</p>
        <Link className="btn" href="/owner/bookings">
          Back to bookings
        </Link>
      </section>
    );
  const s = booking.sitter;
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Booking details</h3>
        <span className="status">
          {String(booking.status).replaceAll("_", " ")}
        </span>
      </div>
      <div className="list-row">
        <div className="row-info">
          <strong>{s.user.name}</strong>
          <small>{[s.locality, s.city].filter(Boolean).join(", ")}</small>
        </div>
        <Link className="btn btn-outline btn-small" href={`/sitters/${s.id}`}>
          Sitter profile
        </Link>
      </div>
      <div className="list-row">
        <div className="row-info">
          <strong>{booking.pet.name}</strong>
          <small>
            {booking.pet.species}
            {booking.pet.breed ? ` · ${booking.pet.breed}` : ""}
          </small>
        </div>
        <span>
          {new Date(booking.checkIn).toLocaleDateString()} –{" "}
          {new Date(booking.checkOut).toLocaleDateString()}
        </span>
      </div>
      <div className="list-row">
        <span>Number of nights</span>
        <b>{booking.nights}</b>
      </div>
      <div className="list-row">
        <span>Sitter subtotal</span>
        <b>{money(booking.subtotal)}</b>
      </div>
      <div className="list-row">
        <span>Platform fee</span>
        <b>{money(booking.platformFee)}</b>
      </div>
      <div className="list-row">
        <strong>Total</strong>
        <strong className="price">{money(booking.total)}</strong>
      </div>
      {booking.specialInstructions && (
        <div className="content-block">
          <h3>Care instructions</h3>
          <p>{booking.specialInstructions}</p>
        </div>
      )}
      <div className="content-block">
        <h3>Stay updates</h3>
        {booking.stayUpdates?.length ? (
          booking.stayUpdates.map((u: any) => (
            <div className="list-row" key={u.id}>
              <div className="row-info">
                <strong>{u.message}</strong>
                <small>
                  {u.type.replaceAll("_", " ")} ·{" "}
                  {new Date(u.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        ) : (
          <p className="subtle">No updates have been posted yet.</p>
        )}
      </div>
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}
      >
        {["ACCEPTED", "PAYMENT_PENDING"].includes(booking.status) && (
          <Link className="btn" href={`/checkout/${booking.id}`}>
            Review price
          </Link>
        )}
        {booking.status === "PENDING" && (
          <button className="btn btn-outline" disabled={busy} onClick={cancel}>
            {busy ? "Cancelling…" : "Cancel request"}
          </button>
        )}
        <Link className="btn btn-outline" href="/owner/messages">
          Messages
        </Link>
        <Link className="btn btn-outline" href="/owner/bookings">
          All bookings
        </Link>
      </div>
      {error && (
        <div className="notice" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </section>
  );
}
