# ai-card-generator

A spaced-repetition app: type a topic, get an AI-generated deck and review it in one of three modes, while the review schedule is computed with the FSRS algorithm. Light and dark themes, responsive layout and animated transitions.

The repository is a monolith with two independent packages: a React web app in `frontend/` and a NestJS REST API in `backend/`.

<div align="center">

![React](https://img.shields.io/badge/-React_19-61DAFB?logo=react&logoColor=black&style=for-the-badge)
![React Compiler](https://img.shields.io/badge/-React_Compiler-1E1E24?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)
![Zustand](https://img.shields.io/badge/-Zustand-2D2A26?style=for-the-badge)

![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white&style=for-the-badge)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white&style=for-the-badge)
![Mongoose](https://img.shields.io/badge/-Mongoose-880000?logo=mongoose&logoColor=white&style=for-the-badge)
![Zod](https://img.shields.io/badge/-Zod-3E67B1?logo=zod&logoColor=white&style=for-the-badge)
![Gemini](https://img.shields.io/badge/-Gemini-8E75B2?logo=googlegemini&logoColor=white&style=for-the-badge)

</div>

## Features

- Three review modes: card flip, question-and-answer graded with FSRS, and true/false with instant feedback
- Deck generation from a topic in Ukrainian or English
- Decks stored in MongoDB through a REST API with full CRUD
- FSRS-style review scheduling: Again / Hard / Good / Easy
- Light and dark themes with saved preference
- Responsive layout for desktop and mobile
- 3D card flip and entrance animations that respect `prefers-reduced-motion`

## Structure

```
frontend/   React 19 + Vite web app, Feature-Sliced Design
backend/    NestJS REST API, MongoDB, deck generation
.github/    GitHub Pages deploy of the frontend
```

The two packages share no code and have their own `package.json`. They meet only over HTTP: the frontend calls `http://localhost:3000/api` in development.

### Frontend

Feature-Sliced Design — imports only flow "down": `app → pages → widgets → features → entities → shared`.

```
frontend/src/
  app/        theme provider, global styles and tokens, entry point
  pages/      landing
  widgets/    site-header, hero, feature-list, review-demo
  features/   generate-deck, rate-card (FSRS)
  entities/   card, deck
  shared/     ui (Button, Chips, Backdrop, GlassPanel, icons), lib (cn)
```

### Backend

NestJS modules with SOLID layering and the repository pattern: controllers call services, services reach MongoDB only through repository interfaces. Architecture, folder rules and the API are in [`backend/README.md`](backend/README.md).

## Getting started

Frontend — generation needs the backend running; the API address comes from `VITE_API_URL` and defaults to `http://localhost:3000/api`:

```bash
cd frontend
npm install && npm run dev
```

Backend — requires a MongoDB connection string (for example a free MongoDB Atlas cluster):

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Build and type-check either package with `npm run build` from its folder.
