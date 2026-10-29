"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Wallet,
  LockKeyhole,
} from "lucide-react";
import { money } from "@/lib/utils";
type Sitter = {
  id: string;
  dailyRate: number;
  currency: string;
  isAvailable: boolean;
  user: { name: string; avatarUrl: string | null };
  city: string;
  locality: string | null;
};
type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  ageYears: number | null;
};
type Booking = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  subtotal: number;
  platformFee: number;
  total: number;
  specialInstructions: string | null;
  pet: Pet;
  sitter: {
    user: { name: string };
    dailyRate: number;
    city: string;
    locality: string | null;
  };
  payment?: { status: string } | null;
};
export function BookingFlow({ mode }: { mode: "booking" | "checkout" }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [petId, setPetId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        if (mode === "checkout") {
          const r = await fetch(`/api/bookings/${params.id}`);
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Booking not found");
          if (active) setBooking(d.data as Booking);
          return;
        }
        const [sr, pr, br] = await Promise.all([
          fetch(`/api/sitters/${params.id}`),
          fetch("/api/pets"),
          fetch(`/api/bookings/${params.id}`),
        ]);
        if (sr.ok) {
          const sd = await sr.json();
          if (active) setSitter(sd.data as Sitter);
          if (pr.ok) {
            const pd = await pr.json();
            if (active) {
              setPets(pd.data as Pet[]);
              if (pd.data?.length) setPetId(pd.data[0].id);
            }
          }
        } else if (br.ok) {
          const bd = await br.json();
          if (active) setBooking(bd.data as Booking);
        } else {
          const d = await sr.json();
          throw new Error(d.error || "Sitter not found");
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "Unable to load booking information",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [mode, params.id]);
  const nights = useMemo(
    () =>
      start && end
        ? Math.ceil(
            (new Date(`${end}T00:00:00`).getTime() -
              new Date(`${start}T00:00:00`).getTime()) /
              86400000,
          )
        : 0,
    [start, end],
  );
  const subtotal = nights * (sitter?.dailyRate || 0);
  const fee = Math.round(subtotal * 0.08);
  const total = subtotal + fee;
  async function proceed(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!terms) {
      setError("Please accept the booking and cancellation terms.");
      return;
    }
    if (!petId) {
      setError("Add a pet profile before requesting a stay.");
      return;
    }
    if (!start || !end || nights < 1) {
      setError("Choose a check-out date after check-in.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitterId: sitter?.id,
          petId,
          checkIn: `${start}T00:00:00.000Z`,
          checkOut: `${end}T00:00:00.000Z`,
          specialInstructions: notes,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!response.ok)
        throw new Error(data.error || "Could not create booking request");
      router.push(`/booking/${data.data.id}?created=1`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not create booking request",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return <main className="container section">Loading booking details…</main>;
  if (mode === "checkout") {
    if (error || !booking)
      return (
        <main className="container section">
          <h1 className="serif">Booking unavailable</h1>
          <p className="subtle">{error}</p>
          <Link className="btn" href="/owner/bookings">
            View bookings
          </Link>
        </main>
      );
    return (
      <main className="container section" style={{ maxWidth: 780 }}>
        <div className="eyebrow">
          <LockKeyhole size={14} /> Secure checkout
        </div>
        <h1 className="serif page-title">Review your stay.</h1>
        <p className="subtle">
          Your booking request is saved with status{" "}
          <b>{booking.status.replaceAll("_", " ")}</b>.
        </p>
        <div className="panel">
          <div className="panel-head">
            <h3>Booking summary</h3>
            <span className="status">{booking.status}</span>
          </div>
          <div className="list-row">
            <div className="row-info">
              <strong>{booking.sitter.user.name}</strong>
              <small>
                {[booking.sitter.locality, booking.sitter.city]
                  .filter(Boolean)
                  .join(", ")}
              </small>
            </div>
            <span>{booking.nights} nights</span>
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
          <div className="notice">
            <Wallet
              size={15}
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            Payment processing is not enabled. No charge has been made. Connect
            a payment provider and verified webhooks before enabling payment
            collection.
          </div>
          <Link
            className="btn btn-outline"
            href={`/booking/${booking.id}`}
            style={{ marginTop: 15 }}
          >
            Return to booking details
          </Link>
        </div>
      </main>
    );
  }
  if (booking && !sitter)
    return (
      <main
        className="container section"
        style={{ maxWidth: 760, textAlign: "center" }}
      >
        <div
          className="note-icon"
          style={{ margin: "0 auto 20px", width: 64, height: 64 }}
        >
          <CheckCircle2 size={30} />
        </div>
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          Booking request submitted
        </div>
        <h1 className="serif page-title">Your request is with the sitter.</h1>
        <p className="subtle">
          Reference {booking.id}. Current status:{" "}
          <b>{booking.status.replaceAll("_", " ")}</b>. The request is stored in
          your PetCare account.
        </p>
        <div className="panel" style={{ textAlign: "left" }}>
          <div className="panel-head">
            <h3>Stay summary</h3>
            <span className="status">{booking.status}</span>
          </div>
          <div className="list-row">
            <div className="row-info">
              <strong>{booking.sitter.user.name}</strong>
              <small>
                {[booking.sitter.locality, booking.sitter.city]
                  .filter(Boolean)
                  .join(", ")}
              </small>
            </div>
            <strong>{money(booking.total)}</strong>
          </div>
          <div className="list-row">
            <div className="row-info">
              <strong>{booking.pet.name}</strong>
              <small>
                {new Date(booking.checkIn).toLocaleDateString()} –{" "}
                {new Date(booking.checkOut).toLocaleDateString()}
              </small>
            </div>
            <span>{booking.nights} nights</span>
          </div>
          <p className="subtle">
            The sitter can review the request from their booking workspace.
            Payment remains unavailable until a payment provider is configured.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            <Link className="btn" href={`/checkout/${booking.id}`}>
              Review price <ArrowRight size={14} />
            </Link>
            <Link className="btn btn-outline" href="/owner/bookings">
              View my bookings
            </Link>
          </div>
        </div>
      </main>
    );
  if (error && !sitter)
    return (
      <main className="container section" style={{ maxWidth: 700 }}>
        <h1 className="serif page-title">Unable to start a booking.</h1>
        <p className="subtle">{error}</p>
        <Link className="btn" href="/sitters">
          Browse sitters
        </Link>
      </main>
    );
  if (!sitter)
    return (
      <main className="container section">
        <h1 className="serif">Sitter not found</h1>
        <Link href="/sitters" className="btn">
          Browse sitters
        </Link>
      </main>
    );
  return (
    <main className="container section" style={{ maxWidth: 1050 }}>
      <div className="eyebrow">
        <CalendarDays size={14} /> Your stay, thoughtfully planned
      </div>
      <h1 className="serif page-title">Request a stay.</h1>
      <p className="subtle">
        Choose your pet and dates. Your request will be saved to your account
        for the sitter to review.
      </p>
      <div
        className="booking-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.5fr) minmax(280px,1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <form className="panel" onSubmit={proceed}>
          <h3>Stay details</h3>
          <div className="form-control">
            <label htmlFor="pet">Pet profile</label>
            {pets.length ? (
              <select
                id="pet"
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                required
              >
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.species}
                    {p.breed ? ` · ${p.breed}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="notice">
                You need a pet profile before booking.{" "}
                <Link href="/owner/pets/new">Add a pet</Link>
              </div>
            )}
          </div>
          <div className="form-grid" style={{ marginTop: 14 }}>
            <div className="form-control">
              <label htmlFor="checkin">Check-in</label>
              <input
                id="checkin"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="checkout">Check-out</label>
              <input
                id="checkout"
                type="date"
                min={start || new Date().toISOString().slice(0, 10)}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-control" style={{ marginTop: 14 }}>
            <label htmlFor="instructions">Special instructions</label>
            <textarea
              id="instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Feeding routine, favourite toy, or care notes…"
              maxLength={3000}
            />
          </div>
          <label className="check" style={{ marginTop: 16 }}>
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />{" "}
            I agree to review the sitter’s rules and cancellation terms before
            confirming.
          </label>
          {error && (
            <div
              className="notice"
              role="alert"
              style={{ marginTop: 12, color: "#a34c43" }}
            >
              {error}
            </div>
          )}
          <button
            className="btn"
            type="submit"
            disabled={busy || !pets.length || !sitter.isAvailable}
            style={{ marginTop: 18, width: "100%" }}
          >
            {busy ? "Submitting request…" : "Request booking"}{" "}
            <ArrowRight size={14} />
          </button>
          {!sitter.isAvailable && (
            <p className="subtle">
              This sitter is not currently accepting requests.
            </p>
          )}
        </form>
        <aside className="panel" style={{ position: "sticky", top: 100 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img
              src={
                sitter.user.avatarUrl ||
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
              }
              alt=""
              className="avatar"
            />
            <div>
              <h3 style={{ margin: 0 }}>{sitter.user.name}</h3>
              <p className="subtle" style={{ margin: "4px 0 0" }}>
                {[sitter.locality, sitter.city].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <span className="price">{money(sitter.dailyRate)}</span>
            <span className="subtle"> / night</span>
          </div>
          <div className="list-row">
            <span>Nights</span>
            <b>{Math.max(0, nights)}</b>
          </div>
          <div className="list-row">
            <span>Sitter subtotal</span>
            <b>{money(subtotal)}</b>
          </div>
          <div className="list-row">
            <span>Platform fee (8%)</span>
            <b>{money(fee)}</b>
          </div>
          <div className="list-row">
            <strong>Total</strong>
            <strong className="price">{money(total)}</strong>
          </div>
          <div className="notice">
            <ShieldCheck
              size={14}
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            No payment is taken when you send a request.
          </div>
        </aside>
      </div>
    </main>
  );
}
