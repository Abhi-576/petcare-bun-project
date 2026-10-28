export const metadata = { title: "Frequently asked questions" };
const faqs = [
  [
    "How are sitters verified?",
    "The platform records identity, address and home review statuses. These are administrative workflow statuses, not a guarantee of a government or background check.",
  ],
  [
    "When am I charged?",
    "Online payment processing is not enabled yet. Booking requests show the itemised total, but no card details are collected and no payment is processed.",
  ],
  [
    "What is the cancellation policy?",
    "Review the sitter’s rules and booking details before requesting a stay. A complete platform-wide cancellation and refund policy must be published before accepting payments.",
  ],
  [
    "What pet information should I share?",
    "Include feeding routines, allergies, medication notes, temperament, exercise needs, veterinary details and emergency contacts where appropriate.",
  ],
  [
    "Will I receive updates?",
    "Sitters can post meal, walk, medication, check-in and other notes to an active booking. Updates are stored and visible to booking participants.",
  ],
  [
    "What if there is an emergency?",
    "Agree on a plan, emergency contact and veterinarian with the sitter before the stay. PetCare does not provide emergency response.",
  ],
  [
    "Can I get a refund?",
    "No online payments are currently processed through PetCare, so refunds are not available in the app.",
  ],
  [
    "Are the sitters and reviews real?",
    "Marketplace listings come from sitter accounts in the database. Reviews are displayed only when submitted and stored through the platform; do not rely on a profile status as an independent vetting guarantee.",
  ],
];
export default function Page() {
  return (
    <main className="container section" style={{ maxWidth: 820 }}>
      <div className="eyebrow">Help & reassurance</div>
      <h1 className="serif page-title">Questions, answered.</h1>
      <p className="subtle">
        Straightforward answers about bookings, account security and the current
        service capabilities.
      </p>
      {faqs.map(([q, a]) => (
        <details className="faq-item" key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </main>
  );
}
