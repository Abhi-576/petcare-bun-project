"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  ShieldCheck,
  Wallet,
  HeartHandshake,
  Camera,
  House,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { sitters, image } from "@/lib/data";
import { SitterCard } from "./sitter-card";
type ApiHomeSitter = {
  id: string;
  city: string;
  locality: string | null;
  dailyRate: number;
  yearsExperience: number;
  maxPets: number;
  about: string;
  acceptedSpecies: string[];
  amenities: string[];
  outdoorSpace: boolean;
  isAvailable: boolean;
  averageRating: number;
  reviewCount: number;
  identityStatus: string;
  homeImageUrls: string[];
  user: { name: string; avatarUrl: string | null };
};
function toCard(x: ApiHomeSitter) {
  return {
    id: x.id,
    name: x.user.name,
    area: [x.locality, x.city].filter(Boolean).join(", "),
    price: x.dailyRate,
    rating: x.averageRating,
    reviews: x.reviewCount,
    experience: `${x.yearsExperience} years of care`,
    bio: x.about,
    image: x.homeImageUrls[0] || image,
    avatar:
      x.user.avatarUrl ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    tags: [
      ...x.acceptedSpecies.map((v) => v[0] + v.slice(1).toLowerCase()),
      ...x.amenities,
      ...(x.outdoorSpace ? ["Outdoor space"] : []),
    ],
    verified: [`Identity ${x.identityStatus.toLowerCase()}`],
    capacity: x.maxPets,
    available: x.isAvailable,
    home: x.about,
  };
}
async function setRandomDogImage(img: HTMLImageElement): Promise<void> {
  try {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();

    if (response.ok && data.status === "success") {
      img.src = data.message;
    }
  } catch {
    img.src = "https://images.dog.ceo/breeds/labrador/n02099712_2223.jpg";
  }
}
export function HomeClient() {
  const router = useRouter();
  const [featured, setFeatured] = useState<ReturnType<typeof toCard>[]>([]);
  useEffect(() => {
    let active = true;
    fetch("/api/sitters?limit=3")
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d.data)) setFeatured(d.data.map(toCard));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const [location, setLocation] = useState("New Delhi");
  const [pet, setPet] = useState("Dog");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow">Care that feels like home</div>
              <h1 className="serif">
                A loving home,
                <br />
                whenever you're <em>away.</em>
              </h1>
              <p className="lead">
                Find thoughtful, trusted pet sitters who make every stay feel
                familiar. More tail wags for them, more peace of mind for you.
              </p>
              <form
                className="searchbox"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (start && end && end <= start) {
                    setError("Check-out must be after check-in.");
                    return;
                  }
                  setError("");
                  const q = new URLSearchParams({
                    location,
                    pet,
                    ...(start ? { checkin: start } : {}),
                    ...(end ? { checkout: end } : {}),
                  });
                  router.push(`/sitters?${q.toString()}`);
                }}
              >
                <div className="field">
                  <label>
                    <MapPin size={12} style={{ display: "inline" }} /> Where
                  </label>
                  <input
                    aria-label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or neighbourhood"
                  />
                </div>
                <div className="field">
                  <label>Pet type</label>
                  <select value={pet} onChange={(e) => setPet(e.target.value)}>
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Small pet</option>
                  </select>
                </div>
                <div className="field">
                  <label>
                    <CalendarDays size={12} style={{ display: "inline" }} />{" "}
                    Check in
                  </label>
                  <input
                    aria-label="Check-in date"
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>
                    <CalendarDays size={12} style={{ display: "inline" }} />{" "}
                    Check out
                  </label>
                  <input
                    aria-label="Check-out date"
                    type="date"
                    min={start || undefined}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
                <button className="btn" type="submit">
                  Find a trusted sitter <ArrowRight size={15} />
                </button>
              </form>
              {error && (
                <p role="alert" style={{ color: "#a34c43", fontSize: 11 }}>
                  {error}
                </p>
              )}
              <div className="trustline">
                <ShieldCheck size={16} /> Thoughtful care starts with clear,
                transparent profiles.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 25,
                }}
              >
                <div className="note-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>Care with clarity</strong>
                  <div className="subtle">Transparent profiles and pricing</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <img
                className="hero-photo"
                src={image}
                alt="A dog enjoying a relaxed moment with a caregiver at home"
              />
              <div className="floating-pill">
                <span style={{ color: "#b18a42" }}>✳</span> Care, with a little
                extra heart
              </div>
              <div className="photo-note">
                <span className="note-icon">
                  <HeartHandshake size={20} />
                </span>
                <div>
                  <strong>Every pet is one of a kind.</strong>
                  <small>Care that follows their routine.</small>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="trust-strip">
          <div className="container trust-items">
            {[
              [
                ShieldCheck,
                "Clear sitter profiles",
                "Know what has been reviewed",
              ],
              [Wallet, "Transparent pricing", "See the breakdown upfront"],
              [
                HeartHandshake,
                "Personalised care",
                "Routines made for your pet",
              ],
              [Camera, "Daily updates", "Stay close while away"],
            ].map(([Icon, title, sub]: any) => (
              <div className="trust-item" key={title}>
                <Icon />
                <div>
                  {title}
                  <small>{sub}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">A simpler kind of care</div>
                <h2 className="serif">
                  Three steps to a<br />
                  happier stay.
                </h2>
              </div>
              <p>
                Finding care should feel reassuring, not overwhelming. Start
                with your pet’s needs, and find a person who gets them.
              </p>
            </div>
            <div className="steps">
              {[
                {
                  n: "01",
                  img: "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=80",
                  title: "Discover your people",
                  text: "Explore detailed profiles, home environments and care styles to find a natural fit.",
                },
                {
                  n: "02",
                  img: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80",
                  title: "Meet, choose & book",
                  text: "Compare availability and clear nightly pricing, then send a thoughtful booking request.",
                },
                {
                  n: "03",
                  img: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=800&q=80",
                  title: "Feel close, even away",
                  text: "Follow along with daily notes, meal logs, walks and little photo moments.",
                },
              ].map((x) => (
                <div className="step" key={x.n}>
                  <img className="step-img" src={x.img} alt="Pet care moment" />
                  <div className="step-number">{x.n}</div>
                  <h3>{x.title}</h3>
                  <p>{x.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section" style={{ background: "#f3f1e9" }}>
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Meet your neighbourhood</div>
                <h2 className="serif">
                  Good people.
                  <br />
                  Lovely homes.
                </h2>
              </div>
              <Link className="btn btn-outline" href="/sitters">
                Explore all sitters <ArrowRight size={15} />
              </Link>
            </div>
            <div className="sitter-grid">
              {featured.map((s) => (
                <SitterCard key={s.id} sitter={s} />
              ))}
            </div>
            {featured.length === 0 && (
              <div className="empty-state">
                <h3>Meet your first local sitters</h3>
                <p className="subtle">
                  Available sitter profiles will appear here once caregivers
                  create their profiles.
                </p>
                <Link className="btn btn-outline" href="/become-a-sitter">
                  Become a sitter
                </Link>
              </div>
            )}
          </div>
        </section>
        <section className="feature-band">
          <div className="container feature-grid">
            <img
              className="feature-img"
              alt="A random dog"
              ref={(img) => {
                if (img) void setRandomDogImage(img);
              }}
            />
            <div>
              <div className="eyebrow">The PetCare difference</div>
              <h2 className="serif" style={{ fontSize: 46 }}>
                More than a place to stay.
              </h2>
              <p className="lead">
                It’s the familiar little things that make a big difference. We
                help you find care that fits the life your pet already loves.
              </p>
              <div className="feature-list">
                {[
                  [
                    House,
                    "A real home environment",
                    "Explore the space, routines and house rules.",
                  ],
                  [
                    ShieldCheck,
                    "Clear trust signals",
                    "See each review status, not just a badge.",
                  ],
                  [
                    Camera,
                    "Little moments, shared",
                    "Daily updates help you feel part of the stay.",
                  ],
                  [
                    HeartHandshake,
                    "Care that fits",
                    "Share feeding, activity and medical notes.",
                  ],
                ].map(([I, t, p]: any) => (
                  <div key={t}>
                    <I className="feature-icon" size={21} />
                    <h3>{t}</h3>
                    <p>{p}</p>
                  </div>
                ))}
              </div>
              <Link className="btn" href="/safety" style={{ marginTop: 15 }}>
                Our safety promise <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  Notes from the pet parent community
                </div>
                <h2 className="serif">
                  The little things
                  <br />
                  mean everything.
                </h2>
              </div>
              <span className="tag">CARE THAT MATTERS</span>
            </div>
            <div className="quote-grid">
              <div className="quote">
                <div style={{ color: "#c9a86a" }}>01 · TRUST</div>
                <blockquote>
                  Know who is caring for your pet, what has been reviewed, and
                  what still needs attention.
                </blockquote>
                <small>
                  Clear sitter profiles and individual verification statuses.
                </small>
              </div>
              <div className="quote">
                <div style={{ color: "#c9a86a" }}>02 · CONNECTION</div>
                <blockquote>
                  Keep care instructions, booking conversations and stay updates
                  together in one place.
                </blockquote>
                <small>
                  Built around the everyday details that help pets feel at home.
                </small>
              </div>
            </div>
          </div>
        </section>
        <section className="container">
          <div className="cta-band">
            <div>
              <div className="eyebrow" style={{ color: "#d8c59f" }}>
                For the good humans
              </div>
              <h2 className="serif">
                Open your home
                <br />
                to a little more joy.
              </h2>
              <p>
                Build a thoughtful profile and care on a schedule that works for
                you.
              </p>
            </div>
            <Link
              className="btn"
              href="/become-a-sitter"
              style={{ background: "#faf8f2", color: "var(--deep)" }}
            >
              Become a sitter <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <section className="section">
          <div className="container" style={{ maxWidth: 780 }}>
            <div className="eyebrow">A few good questions</div>
            <h2 className="serif">Good to know.</h2>
            {[
              [
                "How are sitters verified?",
                "Profiles show the status of each review, such as submitted, pending, approved or rejected. An approved status reflects an administrator’s review in the platform and should not be interpreted as a government or background check unless explicitly stated.",
              ],
              [
                "How does booking work?",
                "Choose a sitter, select your pet and dates, and send a booking request. You can track the request and its status from your account.",
              ],
              [
                "What about payment?",
                "The booking summary shows the sitter subtotal and platform fee. Online payment collection is not enabled until a payment provider is configured.",
              ],
              [
                "Can I share medical information?",
                "Pet profiles include fields for feeding, allergies, medication notes and veterinary contacts. Share only what is needed for care.",
              ],
              [
                "Will I get updates?",
                "Sitters can publish stay updates including meal, walk, medication and photo notes for the booking participants.",
              ],
              [
                "What happens in an emergency?",
                "Agree on an emergency contact and veterinarian before a stay. PetCare is a marketplace and does not replace veterinary or emergency services.",
              ],
            ].map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
            <div style={{ marginTop: 22 }}>
              <Link href="/faq" className="btn btn-outline">
                Visit all FAQs <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
