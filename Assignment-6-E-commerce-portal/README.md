# Resellr Premium

An upgraded OLX-inspired resale marketplace with a modern React frontend, Express + MongoDB backend, JWT auth, image uploads, wishlist support, real-time chat, dark mode, masonry listings, and richer seller flows.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO
- Uploads: Multer with optional Cloudinary storage fallback

## Key Upgrades

- Premium glassmorphic UI with rounded cards, soft depth, gradients, and dark mode
- Sticky search navigation with live suggestions
- Masonry marketplace feed with real-time filtering, debounce, lazy images, and load-more pagination
- Product detail page with gallery, seller panel, recommendations, and review display
- Auth flow for buyers and sellers
- Seller listing creation, edit support, delete support, and dashboard management
- Wishlist and chat system between buyer and seller
- Recommendations and trending sections
- Production-ready SPA build served by Express after `npm run build`

## Folder Structure

```text
client/
  src/
    components/
    context/
    lib/
    pages/
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  views/
public/
scripts/
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Create your env file

```bash
copy .env.example .env
```

3. Update `.env`

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/resellr
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
APP_NAME=Resellr Premium
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. Seed demo data if you want starter listings

```bash
npm run seed
```

## Run Locally

Development mode runs both the Express API and the React frontend:

```bash
npm run dev
```

- React app: [http://localhost:5173](http://localhost:5173)
- API/server: [http://localhost:3000](http://localhost:3000)

Production-style preview:

```bash
npm run build
npm start
```

After the build, Express serves the frontend from `client/dist`.

## Main User Flows

- Browse marketplace: `/marketplace`
- View listing details: `/listing/:slug`
- Login / signup: `/auth`
- Post product: `/sell`
- Seller dashboard: `/dashboard`
- Wishlist: `/wishlist`
- Chat inbox: `/messages`

## Important API Endpoints

- `GET /api/home`
- `GET /api/listings`
- `GET /api/listings/:slug`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`
- `POST /api/listings/:id/wishlist`
- `GET /api/chat/inbox`
- `GET /api/chat/room/:listingId`
- `POST /api/chat/message`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/auth/me`

## UI Improvements

- Converted the app from assignment-style server rendering into a premium SPA experience
- Added stronger visual hierarchy with Poppins + Inter, roomy spacing, and cleaner product surfaces
- Introduced startup-style micro-interactions using Framer Motion
- Added masonry browsing, sticky filters, skeleton loading, floating CTA, and glassmorphic navigation

## Future Enhancements

- Add advanced recommendation ranking using interaction history
- Add map-based location discovery
- Add unread message counters and delivery states
- Add image optimization transforms through Cloudinary
- Add admin moderation UI inside the React dashboard
