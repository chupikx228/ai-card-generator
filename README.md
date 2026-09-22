# ai-card-generator

A web app for spaced repetition: pick a deck type, get a set of cards and review them in one of three modes, while the review schedule is computed with the FSRS algorithm. Light and dark themes, responsive layout and animated transitions.

<div align="center">

![React](https://img.shields.io/badge/-React_19-61DAFB?logo=react&logoColor=black&style=for-the-badge)
![React Compiler](https://img.shields.io/badge/-React_Compiler-1E1E24?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)
![Zustand](https://img.shields.io/badge/-Zustand-2D2A26?style=for-the-badge)

</div>

## Features

- Three review modes: card flip, question-and-answer graded with FSRS, and true/false with instant feedback
- Deck generation by the selected type (local demo data, no keys or network)
- FSRS-style review scheduling: Again / Hard / Good / Easy
- Light and dark themes with saved preference
- Responsive layout for desktop and mobile
- 3D card flip and entrance animations that respect `prefers-reduced-motion`

## Structure

Feature-Sliced Design — imports only flow "down": `app → pages → widgets → features → entities → shared`.

```
src/
  app/        theme provider, global styles and tokens, entry point
  pages/      landing
  widgets/    site-header, hero, feature-list, review-demo
  features/   generate-deck, rate-card (FSRS)
  entities/   card, deck
  shared/     ui (Button, Chips, Backdrop, GlassPanel, icons), lib (cn)
```

## Getting started

```bash
npm install && npm run dev
```

Build and type-check:

```bash
npm run build
```
