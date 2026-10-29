import {
  ShieldCheck,
  HeartHandshake,
  ClipboardCheck,
  PhoneCall,
} from "lucide-react";
export const metadata = { title: "Our safety promise" };
export default function Page() {
  return (
    <main>
      <section className="container hero-mini">
        <div className="eyebrow">Trust is a practice</div>
        <h1 className="serif">
          Clear information.
          <br />
          Thoughtful decisions.
        </h1>
        <p>
          Safety starts with knowing who may care for your pet, what their home
          is like and how they plan to meet your pet’s needs.
        </p>
      </section>
      <section className="container section">
        <div className="feature-list">
          {[
            [
              ShieldCheck,
              "Transparent review statuses",
              "Profiles show individual identity, address and home review statuses. These statuses reflect platform review workflow and are not a substitute for independent background checks.",
            ],
            [
              HeartHandshake,
              "Care plans that travel",
              "Keep feeding, allergies, medication notes and familiar routines together in the pet profile.",
            ],
            [
              ClipboardCheck,
              "Clear booking terms",
              "Review dates, nightly rates and itemised totals before sending a booking request.",
            ],
            [
              PhoneCall,
              "Plan for emergencies",
              "Agree on an emergency contact and veterinarian before any real-world stay. PetCare is not an emergency service.",
            ],
          ].map(([I, t, p]: any) => (
            <div key={t}>
              <I size={24} className="feature-icon" />
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div className="notice" style={{ marginTop: 35 }}>
          PetCare does not currently provide third-party identity verification,
          background checks, insurance coverage or emergency response. Verify
          caregivers independently until those services are available.
        </div>
      </section>
    </main>
  );
}
