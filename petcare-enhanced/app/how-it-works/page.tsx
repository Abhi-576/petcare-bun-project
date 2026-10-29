import Link from "next/link";
export const metadata = { title: "How it works" };
export default function Page() {
  return (
    <main>
      <section className="container hero-mini">
        <div className="eyebrow">Simple by design</div>
        <h1 className="serif">
          Good care should feel
          <br />
          easy to find.
        </h1>
        <p>
          From the first search to the last happy update, PetCare helps pet
          parents make thoughtful choices with clarity at every step.
        </p>
      </section>
      <section className="container section">
        <div className="steps">
          {[
            [
              "01",
              "Discover a good fit",
              "Explore sitter profiles, care experience, accepted pets, home details and clearly labelled verification status.",
            ],
            [
              "02",
              "Share the details",
              "Choose your pet and dates, explain their routine and send a booking request. Review the itemised price before submitting.",
            ],
            [
              "03",
              "Stay in the loop",
              "Follow booking status and see meal, walk, medication and photo updates posted to your stay journal.",
            ],
          ].map(([n, t, p]) => (
            <div className="step" key={n}>
              <div className="step-number">{n}</div>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div className="notice" style={{ marginTop: 40 }}>
          Booking requests and messages are stored in your account. Online
          payment collection and password-reset email delivery require provider
          configuration and are not enabled yet.
        </div>
        <Link className="btn" href="/sitters">
          Find your sitter
        </Link>
      </section>
    </main>
  );
}
