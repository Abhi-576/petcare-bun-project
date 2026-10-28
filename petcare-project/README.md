# PetCare — Premium Pet Boarding Marketplace Demo

A responsive multi-page Next.js App Router frontend for a premium pet-care marketplace. Built with strict TypeScript and intended to run with **Bun**.

## Requirements

- Bun 1.2+ (Node.js 20+ also works if needed)

## Run locally

```bash
bun install
bun run dev
```

Open http://localhost:3000.

## Production build

```bash
bun run build
bun run start
```

## Included experiences

- Editorial marketing homepage and responsive navigation
- Sitter discovery with URL-synced initial search values, working filters, sorting, grid/list layout and favourites
- Detailed sitter profiles and booking request / simulated checkout flow
- Login, registration and password-reset demo screens
- Owner workspace: overview, pet management, bookings, messages, favourites and settings
- Sitter workspace: overview, profile editing, booking actions, availability calendar, stay updates and demo earnings
- Admin workspace: overview, verification review, user directory and reports/complaints
- How it works, safety, about, FAQ and become-a-sitter pages
- Shared typed seed data, INR formatting, responsive styling and reduced-motion support

## Demo boundaries

This is a frontend-only demo with seeded illustrative users, reviews, verification records and financial figures. Local interactions do not sync to a server. Authentication is simulated, messages are not delivered, verification is not performed, and checkout never charges money. Do not enter sensitive credentials or payment information. A production deployment needs a real backend, authentication, database, storage, notification provider, and payment provider.

## Project structure

- `app/` — App Router pages
- `components/` — reusable marketing, marketplace, auth, booking and dashboard UI
- `lib/data.ts` — shared seeded demo records and types
- `lib/utils.ts` — shared helpers
