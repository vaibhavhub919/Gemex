# GemeX

Full MERN tournament application scaffold with backend and frontend completed, while MongoDB connection is intentionally left for the final setup step.

## Included

- JWT auth with user/admin roles
- Tournament creation, listing, joining, winner declaration
- Wallet overview, deposit requests, withdrawal requests
- Admin dashboard for stats and wallet approvals
- React + Vite + Tailwind frontend with protected routes

## Project Structure

- `backend/` Express API with MVC structure
- `frontend/` React client with pages, components, and API service layer

## Backend Setup

1. Go to `backend/`
2. Install packages: `npm install`
3. Copy `.env.example` to `.env`
4. Add your own `MONGODB_URI`
5. Start server: `npm run dev`

## Frontend Setup

1. Go to `frontend/`
2. Install packages: `npm install`
3. Copy `.env.example` to `.env`
4. Start app: `npm run dev`

## Important

Database connection logic already exists in `backend/config/db.js`, but the actual MongoDB URI is intentionally left for you to add later.
