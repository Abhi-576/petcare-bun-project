# PetCare Web

A web-based platform for managing pet care services.

## Prerequisites

Ensure you have **Node.js** installed on your system.

## Setup & Running Instructions

Run the following commands in your terminal to set up and start the application:

```bash
# 1. Install dependencies
npm install

# 2. Configure Environment Variables
# Create a .env file in the root directory and add your Prisma connection string:
# DATABASE_URL="your_prisma_database_url_here"

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Start the development server
npm run dev
```
