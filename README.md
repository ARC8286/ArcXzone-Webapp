# ArcXzone Webapp

ArcXzone Series is a full-stack web application for browsing, managing, and downloading movies, web series, and anime. It features a modern React frontend and a Node.js/Express backend with MongoDB.

## Project Structure

```
client1/      # React + Vite frontend
server/       # Node.js + Express backend
```

## Features

- Browse and search movies, web series, and anime
- Admin panel for content management
- Download options with availability management
- Responsive UI with dark mode
- Authentication for admin routes

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance

### Setup

#### 1. Clone the repository

```sh
git clone [https://github.com/ARC8286/ArcXzone-Webapp.git]_(https://github.com/ARC8286/ArcXzone-Webapp.git)
cd ArcXzoneSeries
```

#### 2. Install dependencies

**Client:**
```sh
cd client1
npm install
```

**Server:**
```sh
cd ../server
npm install
```

#### 3. Environment Variables

Create `.env` files in both `client1/` and `server/` directories.  
Refer to `.env.example` or set variables as needed (API URLs, DB connection, JWT secret, etc).

#### 4. Run the development servers

**Client:**
```sh
npm run dev
```

**Server:**
```sh
npm run dev
```

#### 5. Access the app

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Scripts

**Client:**
- `npm run dev` – Start Vite dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

**Server:**
- `npm run dev` – Start backend with nodemon
- `npm run start` – Start backend
- `npm run test` – Run backend tests
- `npm run seed` – Seed database with sample data

## Technologies Used

- React, React Router, Framer Motion, Tailwind CSS
- Node.js, Express, Mongoose, Joi
- MongoDB

## License

MIT

---

Feel free to expand this README with more details about features, API endpoints,
