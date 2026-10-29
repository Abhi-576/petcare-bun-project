# PetCare — Premium Pet Boarding Marketplace

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
- Database-backed sitter profiles, booking requests and itemised checkout summary
- Password-hashed login and registration with secure session cookies; password reset requires email-provider setup
- Owner workspace: overview, pet management, bookings, messages, favourites and settings
- Sitter workspace: overview, database-backed profile editing, booking actions, availability calendar and stay updates
- Admin workspace: overview, verification review, user directory and reports/complaints backed by API records
- How it works, safety, about, FAQ and become-a-sitter pages
- Shared typed seed data, INR formatting, responsive styling and reduced-motion support

## Current integration boundaries

Account authentication, pet records, sitter discovery and profiles, favourites, booking requests/status changes, booking messages, stay updates, sitter availability, and admin user/verification/report workflows persist through PostgreSQL APIs. The existing visual design and styling have been retained. Online payment collection, password-reset emails, external email/SMS/push delivery, image uploads, and third-party identity/background checks are not enabled; the UI does not claim that those services have occurred. Before a public production launch, configure a managed database, HTTPS, rate limiting, monitoring/backups, email and payment providers, webhooks, and formal verification workflows.

## Project structure

- `app/` — App Router pages
- `components/` — reusable marketing, marketplace, auth, booking and dashboard UI
- `lib/data.ts` — shared UI types and visual fallbacks; live marketplace records are loaded from the API
- `lib/utils.ts` — shared helpers

## Backend: PostgreSQL + Prisma ORM

The project includes a REST API under `app/api`, Prisma models, a PostgreSQL development service, signed session authentication, password hashing, request validation, and an opt-in seed script. Account, pet, sitter, booking, message, stay-update, availability, favourite, notification, and admin moderation records persist in PostgreSQL. Payment processing, password-reset email delivery, external notification delivery, image uploads, and third-party identity/background checks are not enabled until providers are configured.

### Start the database and configure environment

```bash
cp .env.example .env
# Generate and paste a real secret into AUTH_SECRET:
openssl rand -base64 48
docker compose up -d db
bun install
bun run db:generate
bun run db:migrate --name init
bun run db:seed
bun run dev
```

API health check: `GET http://localhost:3000/api/health`.

### Accounts and first run

Create an owner or sitter account from `/auth/register`. Sitter profiles become visible after the sitter saves their profile and marks availability on. The seed script is disabled by default. To create example accounts in a disposable local database only, set `SEED_DEMO_DATA=true` in `.env` before running `bun run db:seed`; never do this in production.

### Main endpoints

| Method             | Endpoint                                                        | Purpose                                             |
| ------------------ | --------------------------------------------------------------- | --------------------------------------------------- |
| POST               | `/api/auth/register`                                            | Create owner/sitter account and session             |
| POST               | `/api/auth/login`                                               | Authenticate and set HttpOnly session cookie        |
| POST               | `/api/auth/logout`                                              | Clear session                                       |
| GET                | `/api/auth/me`                                                  | Current session                                     |
| GET, POST          | `/api/pets`                                                     | List/create current owner's pets                    |
| GET, PATCH, DELETE | `/api/pets/:id`                                                 | Read/update/delete own pet                          |
| GET                | `/api/sitters?q=&city=&species=&minRate=&maxRate=&page=&limit=` | Search/paginate available sitters                   |
| GET                | `/api/sitters/:id`                                              | Sitter profile and non-demo reviews                 |
| GET, PUT           | `/api/sitter/profile`                                           | Read/upsert current sitter profile                  |
| GET, POST          | `/api/bookings`                                                 | List current user's bookings / request a booking    |
| GET, PATCH         | `/api/bookings/:id`                                             | Read and transition an authorized booking           |
| GET, POST          | `/api/bookings/:id/updates`                                     | Read/post stay updates                              |
| GET, POST, DELETE  | `/api/favorites`                                                | List/add/remove sitter favorites                    |
| GET, PATCH         | `/api/notifications`                                            | List and mark notifications read                    |
| GET, POST          | `/api/messages?bookingId=`                                      | List conversations / send booking message           |
| GET                | `/api/admin/metrics`                                            | Admin-only aggregate metrics                        |
| GET, PATCH         | `/api/admin/users` and `/api/admin/users/:id`                   | Admin user search and status management             |
| GET, PATCH         | `/api/admin/verifications`                                      | Admin verification queue and review statuses        |
| GET, POST          | `/api/admin/reports`                                            | List reports / submit a report                      |
| PATCH              | `/api/admin/reports/:id`                                        | Update report resolution                            |
| GET, PUT           | `/api/sitter/availability`                                      | Read/update the sitter’s 90-day availability window |
| GET, PATCH         | `/api/account`                                                  | Read/update current account details                 |

### Booking rules and pricing

- Billable nights are calculated as the ceiling of the check-out minus check-in duration in 24-hour periods.
- Platform fee is currently configured as 8% of sitter subtotal; adjust this policy before production.
- Booking requests begin in `PENDING`; endpoints enforce basic participant permissions and status transitions.
- Payment records use a provider placeholder. No real payment is collected or processed.

### Security and production checklist

- Session cookies are HttpOnly, SameSite=Lax and Secure in production; tokens are signed with `AUTH_SECRET`.
- Passwords are hashed with bcrypt. API requests are validated with Zod.
- Use HTTPS, a managed database, backups, rate limiting, audit logs, email verification, password reset tokens, CSRF/origin protections for your deployment topology, and monitoring before production.
- Add object storage for pet/stay photos; current image fields store URLs only.
- Integrate a real payment provider and webhook verification before accepting payments.
- Admin moderation endpoints are available, but operational policies, audit logging, appeal handling, and independent verification integrations must be reviewed before a public launch.
- Never commit `.env`, credentials, real ID documents, or payment details.

## Recent project enhancements

- The global header reads the current session from `/api/auth/me` and shows the signed-in user's first name, role-specific dashboard and messages links, and a logout action. Logging out clears the session cookie through `/api/auth/logout`.
- Owners and sitters have message links. Booking conversations are stored in the database and messages are restricted to the booking participants (administrators retain the existing support visibility).
- A lightweight rule-based help widget is available throughout the site. It matches common keywords to built-in FAQ responses and links; it does not call an LLM or external AI service.

The help widget is informational only. Payment processing, password-reset email, and external identity/background-check providers remain unconfigured and are not represented as active features.
