"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PawPrint,
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";

type SessionUser = {
  id: string;
  name: string;
  role: "OWNER" | "SITTER" | "ADMIN";
  email: string;
};
const homeFor = (role: SessionUser["role"]) =>
  role === "ADMIN"
    ? "/admin/dashboard"
    : role === "SITTER"
      ? "/sitter/dashboard"
      : "/owner/dashboard";
const messagesFor = (role: SessionUser["role"]) =>
  role === "SITTER" ? "/sitter/messages" : "/owner/messages";

export function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    const refreshSession = () => {
      fetch("/api/auth/me", { cache: "no-store" })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (alive) setUser(response.ok ? (data.user ?? null) : null);
        })
        .catch(() => {
          if (alive) setUser(null);
        });
    };
    refreshSession();
    window.addEventListener("petcare-auth-changed", refreshSession);
    return () => {
      alive = false;
      window.removeEventListener("petcare-auth-changed", refreshSession);
    };
  }, [pathname]);

  async function logout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      setUser(null);
      setOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      window.alert("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <div className="announcement">
        A little more peace of mind for every pet parent{" "}
        <span style={{ color: "#c9a86a" }}>✳</span>
      </div>
      <header className="header container">
        <Link className="brand" href="/">
          <span className="brandmark">
            <PawPrint size={19} />
          </span>
          petcare<span style={{ color: "#9aaa91" }}>.</span>
        </Link>
        <nav className={`navlinks ${open ? "open" : ""}`}>
          <Link href="/sitters" onClick={() => setOpen(false)}>
            Find a sitter
          </Link>
          <Link href="/how-it-works" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/safety" onClick={() => setOpen(false)}>
            Our safety promise
          </Link>
          <Link href="/become-a-sitter" onClick={() => setOpen(false)}>
            Become a sitter
          </Link>
        </nav>
        <div className="navright">
          {user ? (
            <>
              <span className="header-greeting">
                Hi, {user.name.split(" ")[0]}
              </span>
              <Link
                className="login-link"
                href={homeFor(user.role)}
                title="Your dashboard"
              >
                <LayoutDashboard size={15} /> <span>Dashboard</span>
              </Link>
              <Link
                className="login-link"
                href={messagesFor(user.role)}
                title="Messages"
              >
                <MessageCircle size={15} /> <span>Messages</span>
              </Link>
              <button
                className="btn btn-small header-logout"
                type="button"
                disabled={loggingOut}
                onClick={logout}
              >
                <LogOut size={14} />
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </>
          ) : (
            <Link
              className="login-link"
              href="/auth/login"
              style={{ fontSize: 12, fontWeight: 800 }}
            >
              Log in
            </Link>
          )}
          <Link className="btn btn-small header-find" href="/sitters">
            Find a stay <ArrowUpRight size={14} />
          </Link>
          <button
            className="mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link className="brand" href="/">
              <span className="brandmark">
                <PawPrint size={18} />
              </span>
              petcare.
            </Link>
            <p style={{ maxWidth: 260, marginTop: 18, lineHeight: 1.9 }}>
              A loving home, whenever you're away. Thoughtful care for the ones
              who make a house a home.
            </p>
            <span className="tag">THOUGHTFUL PET CARE</span>
          </div>
          <div>
            <h4>Explore</h4>
            <div className="footer-links">
              <Link href="/sitters">Find a sitter</Link>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/safety">Safety promise</Link>
              <Link href="/faq">FAQs</Link>
            </div>
          </div>
          <div>
            <h4>For sitters</h4>
            <div className="footer-links">
              <Link href="/become-a-sitter">Become a sitter</Link>
              <Link href="/sitter/dashboard">Sitter dashboard</Link>
              <Link href="/sitter/availability">Manage availability</Link>
              <Link href="/sitter/earnings">Earnings</Link>
            </div>
          </div>
          <div>
            <h4>Your account</h4>
            <div className="footer-links">
              <Link href="/owner/dashboard">Owner dashboard</Link>
              <Link href="/owner/pets">My pets</Link>
              <Link href="/owner/bookings">My bookings</Link>
              <Link href="/admin/dashboard">Admin workspace</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 PetCare</span>
          <span>
            Bookings are subject to sitter confirmation · Payments are not yet
            enabled
          </span>
        </div>
      </div>
    </footer>
  );
}
