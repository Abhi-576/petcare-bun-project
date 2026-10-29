"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PawPrint,
  LayoutDashboard,
  CalendarDays,
  Heart,
  MessageCircle,
  Settings,
  Users,
  ShieldCheck,
  Wallet,
  ClipboardList,
  House,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Camera,
  Clock,
  Dog,
  Search,
  Bell,
  X,
  Save,
  Send,
} from "lucide-react";
import { initialBookings, pets, sitters } from "@/lib/data";
import { money } from "@/lib/utils";
import {
  FavoritesPanel,
  MessagesPanel,
  SitterProfilePanel,
  StayUpdatesPanel,
  AvailabilityPanel,
  AdminDataPanel,
  AccountSettingsPanel,
  PetDetailPanel,
  BookingDetailPanel,
} from "@/components/account-panels";
const ownerLinks = [
  ["Overview", "/owner/dashboard", LayoutDashboard],
  ["My pets", "/owner/pets", PawPrint],
  ["Bookings", "/owner/bookings", CalendarDays],
  ["Messages", "/owner/messages", MessageCircle],
  ["Favourites", "/owner/favorites", Heart],
  ["Settings", "/owner/settings", Settings],
] as const;
const sitterLinks = [
  ["Overview", "/sitter/dashboard", LayoutDashboard],
  ["My profile", "/sitter/profile", Users],
  ["Booking requests", "/sitter/bookings", CalendarDays],
  ["Messages", "/sitter/messages", MessageCircle],
  ["Availability", "/sitter/availability", CalendarDays],
  ["Stay updates", "/sitter/stay-updates", Camera],
  ["Earnings", "/sitter/earnings", Wallet],
  ["Settings", "/sitter/settings", Settings],
] as const;
const adminLinks = [
  ["Overview", "/admin/dashboard", LayoutDashboard],
  ["Verifications", "/admin/verifications", ShieldCheck],
  ["Users", "/admin/users", Users],
  ["Bookings", "/admin/bookings", CalendarDays],
  ["Reports & cases", "/admin/reports", ClipboardList],
] as const;
const configs: Record<
  string,
  {
    title: string;
    desc: string;
    links: readonly (readonly [string, string, any])[];
    role: string;
  }
> = {
  owner: {
    title: "Your pet parent space",
    desc: "Your pet care, bookings and conversations in one place.",
    links: ownerLinks,
    role: "Pet owner",
  },
  sitter: {
    title: "Your care studio",
    desc: "Manage stays, welcome new guests and keep pet parents close.",
    links: sitterLinks,
    role: "Pet sitter",
  },
  admin: {
    title: "Platform operations",
    desc: "Review accounts, bookings and verification requests.",
    links: adminLinks,
    role: "Administrator",
  },
};
export function Dashboard({
  role,
  section = "dashboard",
}: {
  role: "owner" | "sitter" | "admin";
  section?: string;
}) {
  const cfg = configs[role];
  const [toast, setToast] = useState("");
  const [bookings, setBookings] = useState<typeof initialBookings>([]);
  const [petList, setPetList] = useState<typeof pets>([]);
  const [newName, setNewName] = useState("");
  const [newBreed, setNewBreed] = useState("");
  const [newType, setNewType] = useState("Dog");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [updates, setUpdates] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [profileName, setProfileName] = useState("Maya Shah");
  const [rate, setRate] = useState("1800");
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [read, setRead] = useState(false);
  const [modal, setModal] = useState("");
  const [adminMetrics, setAdminMetrics] = useState<{
    users: number;
    activeSitters: number;
    pendingVerifications: number;
    openReports: number;
    bookings: Record<string, number>;
  } | null>(null);
  const active =
    cfg.links.find((x) => x[1].split("/").pop() === section) || cfg.links[0];
  const titleMap: Record<string, string> = {
    dashboard:
      role === "owner"
        ? "Welcome back, there."
        : role === "sitter"
          ? "Good morning, Maya."
          : "Overview",
    pets: "Your pet profiles",
    new: "Add a pet",
    "[id]": "Pet details",
    bookings: "Your bookings",
    messages: "Messages",
    favorites: "Your favourite sitters",
    settings: "Account settings",
    profile: "Your sitter profile",
    availability: "Availability calendar",
    "stay-updates": "Stay updates",
    earnings: "Earnings overview",
    verifications: "Verification queue",
    users: "User directory",
    reports: "Reports & complaints",
  };
  const title = titleMap[section] || titleMap.dashboard;
  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const mr = await fetch("/api/auth/me");
        if (!mr.ok) {
          window.location.href = "/auth/login";
          return;
        }
        const md = await mr.json();
        const expected = role.toUpperCase();
        if (md.user?.role !== expected) {
          window.location.href =
            md.user?.role === "ADMIN"
              ? "/admin/dashboard"
              : md.user?.role === "SITTER"
                ? "/sitter/dashboard"
                : "/owner/dashboard";
          return;
        }
        if (role === "owner" || role === "sitter" || role === "admin") {
          const requests = [fetch("/api/bookings")];
          if (role === "owner") requests.push(fetch("/api/pets"));
          if (role === "admin") requests.push(fetch("/api/admin/metrics"));
          const responses = await Promise.all(requests);
          const br = responses[0];
          if (br.ok) {
            const bd = await br.json();
            if (active)
              setBookings(
                (bd.data || []).map((b: any) => ({
                  id: b.id,
                  sitter: b.sitter?.user?.name || "Sitter",
                  sitterId: b.sitterId,
                  pet: b.pet?.name || "Pet",
                  dates: `${new Date(b.checkIn).toLocaleDateString()} – ${new Date(b.checkOut).toLocaleDateString()}`,
                  status: String(b.status)
                    .toLowerCase()
                    .split("_")
                    .map(
                      (part: string) =>
                        part.charAt(0).toUpperCase() + part.slice(1),
                    )
                    .join(" "),
                  total: b.total,
                })),
              );
          }
          if (role === "owner" && responses[1]?.ok) {
            const pd = await responses[1].json();
            if (active)
              setPetList(
                (pd.data || []).map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  breed:
                    [p.breed, p.ageYears != null ? `${p.ageYears} years` : null]
                      .filter(Boolean)
                      .join(" · ") || p.species,
                  type:
                    p.species === "DOG"
                      ? "Dog"
                      : p.species === "CAT"
                        ? "Cat"
                        : p.species,
                  image:
                    p.imageUrl ||
                    "https://images.dog.ceo/breeds/corgi-cardigan/n02113186_6415.jpg",
                })),
              );
          }
          if (role === "admin" && responses[1]?.ok) {
            const md = await responses[1].json();
            if (active) setAdminMetrics(md.data);
          }
        }
      } catch (e) {
        console.error("Could not load account data", e);
      }
    }
    void hydrate();
    return () => {
      active = false;
    };
  }, [role]);
  const ping = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2600);
  };
  const linkTo = (label: string) =>
    cfg.links.find((l) => l[0] === label)?.[1] || "/";
  const changeStatus = async (id: string, status: string) => {
    try {
      const r = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status.toUpperCase().replaceAll(" ", "_"),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not update booking");
      setBookings((b) =>
        b.map((x) => (x.id === id ? { ...x, status: d.data.status } : x)),
      );
      ping(`Booking status updated to ${status.toLowerCase()}.`);
    } catch (e) {
      ping(e instanceof Error ? e.message : "Could not update booking");
    }
  };
  const addPet = async () => {
    if (!newName.trim()) {
      ping("Add a pet name to continue.");
      return;
    }
    const species: Record<string, string> = {
      Dog: "DOG",
      Cat: "CAT",
      Bird: "BIRD",
      Rabbit: "RABBIT",
      Other: "OTHER",
    };
    const ageMatch = newBreed.match(/(\d+(?:\.\d+)?)/);
    const payload = {
      name: newName.trim(),
      species: species[newType] || "DOG",
      breed: newBreed.trim() || null,
      ageYears: ageMatch ? Number(ageMatch[1]) : null,
    };
    try {
      const r = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (r.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      if (!r.ok) throw new Error(d.error || "Could not save pet");
      const p = d.data;
      setPetList((items) => [
        ...items,
        {
          id: p.id,
          name: p.name,
          breed:
            [p.breed, p.ageYears != null ? `${p.ageYears} years` : null]
              .filter(Boolean)
              .join(" · ") || p.species,
          type:
            p.species === "DOG"
              ? "Dog"
              : p.species === "CAT"
                ? "Cat"
                : p.species,
          image:
            p.imageUrl ||
            "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=240&q=80",
        },
      ]);
      setNewName("");
      setNewBreed("");
      ping("Pet profile saved.");
    } catch (e) {
      ping(e instanceof Error ? e.message : "Could not save pet");
    }
  };
  const addMessage = () => {
    if (!message.trim()) return;
    setMessages((m) => [...m, message]);
    setMessage("");
    ping("Message added locally. It was not delivered to a real person.");
  };
  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <Link className="brand" href="/">
            <span className="brandmark">
              <PawPrint size={18} />
            </span>
            petcare.
          </Link>
          <div className="side-label">{cfg.role} workspace</div>
          {cfg.links.map(([label, url, Icon]) => (
            <Link
              key={url}
              className={`side-link ${url === `/${role}/${section}` || url.endsWith("/" + section) ? "active" : ""}`}
              href={url}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div
            style={{
              marginTop: "auto",
              padding: "15px 11px",
              background: "var(--ivory)",
              borderRadius: 10,
            }}
          >
            <div className="verified">
              <CheckCircle2 size={12} /> ACCOUNT CONNECTED
            </div>
            <p
              className="subtle"
              style={{ lineHeight: 1.8, margin: "10px 0 0" }}
            >
              Your account and pet records are loaded from the PetCare database.
            </p>
            <button
              className="btn btn-outline btn-small"
              style={{ marginTop: 12, width: "100%" }}
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/auth/login";
              }}
            >
              Log out
            </button>
            <Link
              href="/"
              className="subtle"
              style={{ display: "block", marginTop: 12 }}
            >
              ← Back to PetCare
            </Link>
          </div>
        </aside>
        <nav className="mobile-sidebar">
          {cfg.links.map(([label, url, Icon]) => (
            <Link
              key={url}
              className={`side-link ${url === `/${role}/${section}` ? "active" : ""}`}
              href={url}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <main className="dashboard-main">
          <div className="dash-header">
            <div>
              <div className="eyebrow">{cfg.role} workspace</div>
              <h1 className="serif">{title}</h1>
              <p>
                {section === "dashboard"
                  ? cfg.desc
                  : "Manage your details and account activity."}
              </p>
            </div>
            <button
              className="heart"
              aria-label="Notifications"
              onClick={async () => {
                try {
                  const r = await fetch("/api/notifications");
                  if (r.ok) {
                    await fetch("/api/notifications", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ all: true }),
                    });
                    setRead(true);
                    ping("Notifications marked as read.");
                  } else ping("Unable to load notifications.");
                } catch {
                  ping("Unable to load notifications.");
                }
              }}
            >
              <Bell size={17} />
              {!read && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#c9a86a",
                    position: "absolute",
                    margin: "-20px 0 0 13px",
                  }}
                />
              )}
            </button>
          </div>
          {section === "dashboard" && (
            <>
              <div className="metric-grid">
                {(role === "owner"
                  ? [
                      [
                        "Your pets",
                        String(petList.length),
                        "Profiles in your care",
                      ],
                      [
                        "Upcoming stays",
                        String(
                          bookings.filter((b) =>
                            [
                              "Accepted",
                              "Confirmed",
                              "Checked In",
                              "Active",
                              "Upcoming",
                            ].includes(b.status),
                          ).length,
                        ),
                        "Across your bookings",
                      ],
                      [
                        "Saved sitters",
                        "—",
                        "Open your favourites to view saved profiles",
                      ],
                      [
                        "Stay updates",
                        String(updates.length),
                        "Recent stay notes",
                      ],
                    ]
                  : role === "sitter"
                    ? [
                        [
                          "New requests",
                          String(
                            bookings.filter((b) => b.status === "Pending")
                              .length,
                          ),
                          "Requests awaiting your response",
                        ],
                        [
                          "Upcoming stays",
                          String(
                            bookings.filter((b) =>
                              ["Accepted", "Confirmed"].includes(b.status),
                            ).length,
                          ),
                          "On your booking list",
                        ],
                        ["Average rating", "—", "Based on published reviews"],
                        ["Earnings", "—", "Payment setup required"],
                      ]
                    : [
                        [
                          "Users",
                          String(adminMetrics?.users ?? "—"),
                          "Registered accounts",
                        ],
                        [
                          "Active sitters",
                          String(adminMetrics?.activeSitters ?? "—"),
                          "Available sitter profiles",
                        ],
                        [
                          "Pending reviews",
                          String(adminMetrics?.pendingVerifications ?? "—"),
                          "Verification requests",
                        ],
                        [
                          "Bookings",
                          String(bookings.length),
                          "Booking records",
                        ],
                      ]
                ).map(([l, v, f]) => (
                  <div className="metric" key={l}>
                    <div className="metric-label">{l}</div>
                    <div className="metric-value">{v}</div>
                    <div className="metric-foot">{f}</div>
                  </div>
                ))}
              </div>
              <div className="two-col">
                <section className="panel">
                  <div className="panel-head">
                    <h3>
                      {role === "admin"
                        ? "Recent platform activity"
                        : "Booking activity"}
                    </h3>
                    <Link
                      href={linkTo(role === "admin" ? "Bookings" : "Bookings")}
                      className="subtle"
                    >
                      View all ↗
                    </Link>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Booking</th>
                          <th>Pet / guest</th>
                          <th>Dates</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id}>
                            <td>
                              <b>{b.id}</b>
                            </td>
                            <td>
                              {b.pet} · {b.sitter}
                            </td>
                            <td>{b.dates}</td>
                            <td>
                              <span
                                className={`status ${b.status === "Completed" ? "green" : b.status === "Pending" ? "" : "gray"}`}
                              >
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-head">
                    <h3>
                      {role === "owner"
                        ? "Your pets"
                        : role === "sitter"
                          ? "Your next guests"
                          : "Needs attention"}
                    </h3>
                    <Link
                      href={linkTo(
                        role === "owner"
                          ? "My pets"
                          : role === "sitter"
                            ? "Booking requests"
                            : "Verifications",
                      )}
                      className="subtle"
                    >
                      See more ↗
                    </Link>
                  </div>
                  {(role === "owner" ? petList : role === "sitter" ? [] : [])
                    .slice(0, 3)
                    .map((p: any) => (
                      <div className="list-row" key={p.id}>
                        <img src={p.image || p.avatar} alt="" />
                        <div className="row-info">
                          <strong>{p.name}</strong>
                          <small>{p.breed || p.area || "Sample record"}</small>
                        </div>
                        <ArrowUpRight size={15} color="var(--green)" />
                      </div>
                    ))}
                </section>
              </div>
              <section className="panel">
                <div className="panel-head">
                  <h3>Thoughtful next steps</h3>
                  <span className="tag">QUICK ACTIONS</span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {role === "owner" ? (
                    <>
                      <Link className="btn" href="/sitters">
                        Find a sitter <ArrowUpRight size={14} />
                      </Link>
                      <Link className="btn btn-outline" href="/owner/pets/new">
                        <Plus size={14} /> Add a pet
                      </Link>
                      <Link className="btn btn-outline" href="/owner/messages">
                        Message a sitter
                      </Link>
                    </>
                  ) : role === "sitter" ? (
                    <>
                      <Link className="btn" href="/sitter/bookings">
                        Review requests
                      </Link>
                      <Link
                        className="btn btn-outline"
                        href="/sitter/availability"
                      >
                        Update availability
                      </Link>
                      <Link
                        className="btn btn-outline"
                        href="/sitter/stay-updates"
                      >
                        Add stay update
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link className="btn" href="/admin/verifications">
                        Review verification queue
                      </Link>
                      <Link className="btn btn-outline" href="/admin/reports">
                        Review reports
                      </Link>
                    </>
                  )}
                </div>
              </section>
            </>
          )}
          {(section === "pets" || section === "new") && role === "owner" && (
            <>
              <section className="panel">
                <div className="panel-head">
                  <h3>
                    {section === "new"
                      ? "Create a pet profile"
                      : "Pet profiles"}
                  </h3>
                  <Link className="btn btn-small" href="/owner/pets/new">
                    <Plus size={14} /> Add pet
                  </Link>
                </div>
                {section === "new" || modal === "addpet" ? (
                  <>
                    <div className="form-grid">
                      <div className="form-control">
                        <label htmlFor="petname">Pet name *</label>
                        <input
                          id="petname"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Pepper"
                        />
                      </div>
                      <div className="form-control">
                        <label htmlFor="breed">Breed and age *</label>
                        <input
                          id="breed"
                          value={newBreed}
                          onChange={(e) => setNewBreed(e.target.value)}
                          placeholder="e.g. Indie · 3 years"
                        />
                      </div>
                      <div className="form-control">
                        <label htmlFor="type">Species</label>
                        <select
                          id="type"
                          value={newType}
                          onChange={(e) => setNewType(e.target.value)}
                        >
                          <option>Dog</option>
                          <option>Cat</option>
                          <option>Bird</option>
                          <option>Rabbit</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="form-control">
                        <label>Care notes</label>
                        <input placeholder="Feeding routine, temperament…" />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn" onClick={addPet}>
                        <Save size={14} /> Save pet profile
                      </button>
                    </div>
                  </>
                ) : null}
                <div className="sitter-grid" style={{ marginTop: 20 }}>
                  {petList.map((p) => (
                    <div className="sitter-card" key={p.id}>
                      <img
                        className="sitter-cover"
                        src={p.image}
                        alt={p.name}
                      />
                      <div className="sitter-body">
                        <h3>{p.name}</h3>
                        <p className="subtle">
                          {p.breed} · {p.type}
                        </p>
                        <div className="tag-row">
                          <span className="tag">Care profile</span>
                          <span className="tag">Pet profile</span>
                        </div>
                        <button
                          className="btn btn-outline btn-small"
                          style={{ marginTop: 15 }}
                          onClick={() =>
                            (window.location.href = `/owner/pets/${p.id}`)
                          }
                        >
                          Edit details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {section === "bookings" && (
            <section className="panel">
              <div className="panel-head">
                <h3>Booking records</h3>
                <select
                  className="control"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Upcoming</option>
                  <option>Completed</option>
                  <option>Accepted</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Pet</th>
                      <th>Sitter</th>
                      <th>Stay dates</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(
                        (b) =>
                          filter === "All" ||
                          b.status === filter ||
                          (filter === "Upcoming" &&
                            [
                              "Accepted",
                              "Confirmed",
                              "Checked In",
                              "Active",
                            ].includes(b.status)),
                      )
                      .map((b) => (
                        <tr key={b.id}>
                          <td>
                            <b>{b.id}</b>
                          </td>
                          <td>{b.pet}</td>
                          <td>{b.sitter}</td>
                          <td>{b.dates}</td>
                          <td>{money(b.total)}</td>
                          <td>
                            <span
                              className={`status ${b.status === "Completed" ? "green" : ""}`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 5 }}>
                              {b.status === "Pending" && (
                                <button
                                  className="btn btn-small"
                                  onClick={() =>
                                    changeStatus(
                                      b.id,
                                      role === "sitter"
                                        ? "Accepted"
                                        : "Cancelled",
                                    )
                                  }
                                >
                                  {role === "sitter" ? "Accept" : "Cancel"}
                                </button>
                              )}
                              {b.status === "Accepted" && (
                                <Link
                                  className="btn btn-small"
                                  href={`/checkout/${b.id}`}
                                >
                                  Review total
                                </Link>
                              )}
                              <Link
                                className="btn btn-outline btn-small"
                                href={
                                  role === "owner"
                                    ? `/owner/bookings/${b.id}`
                                    : `/sitter/bookings`
                                }
                              >
                                Details
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {modal && bookings.some((b) => b.id === modal) && (
                <div className="notice-bar">
                  {bookings.find((b) => b.id === modal)?.id} · Booking details.{" "}
                  <button
                    onClick={() => setModal("")}
                    style={{ float: "right", border: 0, background: "none" }}
                  >
                    Close
                  </button>
                </div>
              )}
            </section>
          )}
          {section === "favorites" && role === "owner" && <FavoritesPanel />}
          {section === "messages" &&
            (role === "owner" || role === "sitter") && (
              <MessagesPanel role={role} />
            )}
          {section === "stay-updates" && role === "sitter" && (
            <StayUpdatesPanel />
          )}
          {section === "availability" && role === "sitter" && (
            <AvailabilityPanel />
          )}
          {section === "profile" && role === "sitter" && <SitterProfilePanel />}
          {section === "earnings" && role === "sitter" && (
            <section className="panel">
              <h3>Earnings and payouts</h3>
              <p className="subtle">
                Online payments are not enabled yet, so PetCare has no payout
                balance or transaction history to display.
              </p>
              <div className="notice">
                Once a payment provider and webhook reconciliation are
                configured, completed bookings and payouts can appear here.
              </div>
            </section>
          )}
          {section === "verifications" && role === "admin" && (
            <AdminDataPanel section="verifications" />
          )}
          {section === "users" && role === "admin" && (
            <AdminDataPanel section="users" />
          )}
          {section === "reports" && role === "admin" && (
            <AdminDataPanel section="reports" />
          )}
          {section === "settings" && <AccountSettingsPanel />}
          {section === "[id]" && role === "owner" && <PetDetailPanel />}
          {section === "booking-detail" && role === "owner" && (
            <BookingDetailPanel />
          )}
          {section === "dashboard" && role === "admin" && (
            <section className="panel">
              <h3>Booking status breakdown</h3>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 16,
                }}
              >
                {["Pending", "Upcoming", "Completed"].map((x) => (
                  <div
                    key={x}
                    style={{
                      padding: 18,
                      background: "var(--ivory)",
                      borderRadius: 10,
                      flex: 1,
                      minWidth: 100,
                    }}
                  >
                    <span className="subtle">{x}</span>
                    <div className="metric-value">
                      {bookings.filter((b) => b.status === x).length}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {![
            "dashboard",
            "pets",
            "new",
            "bookings",
            "favorites",
            "messages",
            "stay-updates",
            "availability",
            "profile",
            "earnings",
            "verifications",
            "users",
            "reports",
            "settings",
            "[id]",
            "booking-detail",
          ].includes(section) && (
            <section className="panel">
              <div className="panel-head">
                <h3>{title}</h3>
                <span className="tag">WORKSPACE</span>
              </div>
              <p className="subtle">
                Use the navigation to manage your account, bookings, pet care
                and messages.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {cfg.links.map(([label, url, Icon]) => (
                  <Link className="btn btn-outline" href={url} key={url}>
                    <Icon size={14} />
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
      <nav className="mobile-bottom">
        <Link href="/">
          <PawPrint />
          <span>Home</span>
        </Link>
        <Link href="/sitters">
          <Search />
          <span>Explore</span>
        </Link>
        <Link href={linkTo("Overview")}>
          <LayoutDashboard />
          <span>Dashboard</span>
        </Link>
        <Link href={linkTo("Settings")}>
          <Settings />
          <span>Settings</span>
        </Link>
      </nav>
    </>
  );
}
