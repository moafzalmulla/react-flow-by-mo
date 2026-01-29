# React Flow Manager

A React application for creating and managing flow diagrams with an Express backend for data persistence.

## Getting Started

This application requires **both** the frontend (Vite) and backend (Express) servers to be running.

### Installation

```bash
npm install
```

### Running the Application

#### Option 1: Run both servers with one command (Recommended)

```bash
npm start
```
This will start both the Express backend server and Vite dev server simultaneously.

#### Option 2: Run servers separately

You need to run both servers in separate terminals:

**Terminal 1 - Backend Server:**
```bash
npm run server
```
This starts the Express server on http://localhost:3001

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```
This starts the Vite dev server on http://localhost:5173

Then open http://localhost:5173 in your browser.

### Available Scripts

- `npm start` - Start both backend and frontend servers concurrently (recommended)
- `npm run dev` - Start the Vite development server (frontend only)
- `npm run server` - Start the Express backend server (backend only)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- Create and manage flow diagram projects
- Add, edit, and connect nodes
- Export diagrams as PDF
- Persistent storage with file-based backend

## Tech Stack

- **Frontend:** React, React Flow, Vite
- **Backend:** Express.js
- **Routing:** React Router
- **Styling:** CSS
