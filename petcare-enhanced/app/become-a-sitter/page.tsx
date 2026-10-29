import Link from "next/link";
import { ArrowRight, House, CalendarDays, Camera, Wallet } from "lucide-react";
export const metadata = { title: "Become a sitter" };
export default function Page() {
  return (
    <main>
      <section className="container hero-mini">
        <div className="eyebrow">For thoughtful caregivers</div>
        <h1 className="serif">
          Make room for
          <br />
          more tail wags.
        </h1>
        <p>
          Share your experience, shape a care profile and welcome pets into a
          home that fits your schedule.
        </p>
        <Link className="btn" href="/auth/register?role=sitter">
          Create your sitter account <ArrowRight size={14} />
        </Link>
      </section>
      <section className="container feature-grid section">
        <div>
          <h2 className="serif">Care on your terms.</h2>
          <div className="feature-list">
            {[
              [
                House,
                "Create your profile",
                "Tell pet parents about your home, experience and routine.",
              ],
              [
                CalendarDays,
                "Set your availability",
                "Choose the days and capacity that work for you.",
              ],
              [
                Camera,
                "Share every little moment",
                "Post thoughtful updates during an active stay.",
              ],
              [
                Wallet,
                "Review booking totals",
                "See the booking price breakdown before a stay is confirmed.",
              ],
            ].map(([I, t, p]: any) => (
              <div key={t}>
                <I size={21} className="feature-icon" />
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="eyebrow">Join PetCare</div>
          <h2 className="serif" style={{ fontSize: 30 }}>
            Let’s get to know you.
          </h2>
          <p className="subtle">
            Create an account, then complete your sitter profile with your
            location, experience, accepted pets, daily rate and availability.
          </p>
          <div className="notice">
            Profile review statuses are managed by the platform. Third-party
            identity and background-check services are not currently connected.
          </div>
          <Link
            className="btn"
            style={{ width: "100%", marginTop: 16 }}
            href="/auth/register?role=sitter"
          >
            Get started <ArrowRight size={14} />
          </Link>
          <p className="subtle" style={{ marginTop: 14 }}>
            Already have an account? <Link href="/auth/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
