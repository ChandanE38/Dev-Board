# DevBoard 🚀

A full-stack developer productivity dashboard that tracks your GitHub activity, 
LeetCode progress, and daily coding goals — with an AI Career Coach powered by Gemini.

Built as a portfolio project by Chandan Kumar.

## Live Demo
> Coming soon

## Features

- 🔐 Auth via GitHub username + password (JWT)
- 📊 GitHub profile stats, top repos, activity streak
- 💻 LeetCode problem breakdown with donut chart
- 🎯 Daily goals tracker stored in MongoDB
- 🤖 AI Career Coach — personalized tips via Gemini AI
- 📦 Export full profile as JSON (use with ChatGPT etc.)
- ⚙️ Settings page to manage GitHub + LeetCode usernames
- 🎉 Onboarding flow for new users
- 🌙 Dark glassmorphism UI, fully responsive

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Tailwind CSS, Recharts, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Google Gemini API (gemini-3.1-flash-lite) |

## Project Structure

```text
devboard/
	client/        → React frontend (Vite)
	server/        → Express backend API
```

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/ChandanE38/devboard.git
cd devboard
```

### 2. Install dependencies
```bash
npm install
npm install -w client
npm install -w server
```

### 3. Set up environment variables

**server/.env**
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devboard
JWT_SECRET=your_random_secret_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**client/.env**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key at: https://aistudio.google.com
Get a free MongoDB cluster at: https://mongodb.com/atlas

### 4. Run locally
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Deployment

### Backend → Render
1. New Web Service → connect repo → root directory: `server`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all server env variables

### Frontend → Vercel
1. Import repo → root directory: `client`
2. Add env variables (point VITE_API_URL to your Render URL)
3. Deploy

## Notes
- GitHub stats use public API, no token needed
- LeetCode stats proxied through backend to avoid CORS
- Render free tier sleeps after inactivity — first load may take 30s
