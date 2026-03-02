# Agent 3: System Architect — Kaivoo Hub Master Blueprint
## Self-Hosted Personal AI Operating System · Architecture Specification v1.1

**Role:** System Architect
**Department:** Engineering
**Model:** Opus
**Mission:** Define the complete architecture for Kaivoo Hub — a self-hosted personal AI operating system that runs on a dedicated Mac Mini, stores all data as local files, orchestrates AI agents across multiple providers, and is accessible from any device via web browser.

**Date:** February 2026
**Status:** APPROVED — Ready for implementation
**Hardware Target:** Mac Mini, 16GB RAM, 512GB SSD, macOS

---

# Table of Contents

**Core Spec (this file):**
1. [Vision & Core Concepts](#1-vision--core-concepts)
2. [System Overview](#2-system-overview)
3. [The Dashboard](#3-the-dashboard)
4. [Technology Stack](#4-technology-stack)
5. [Real-Time Sync](#5-real-time-sync)
6. [Remote Access](#6-remote-access)
7. [Reference Pointers](#7-reference-pointers)

**Detailed Design Documents (Agent-3-Docs/):**
- [Vault-System-Design.md](Agent-3-Docs/Vault-System-Design.md) — File system, folder structure, metadata, tags, linking
- [Journal-System-Design.md](Agent-3-Docs/Journal-System-Design.md) — Journal file format, templates, AI superpowers
- [Concierge-Orchestration-Design.md](Agent-3-Docs/Concierge-Orchestration-Design.md) — AI orchestration, agent/skill formats, provider config
- [Theater-Media-System.md](Agent-3-Docs/Theater-Media-System.md) — Media file types, search & filtering UI
- [Workshop-Self-Extension.md](Agent-3-Docs/Workshop-Self-Extension.md) — Developer mode, plugins, approval gates, APIs, external agents
- [Soul-User-Memory.md](Agent-3-Docs/Soul-User-Memory.md) — Persistent user memory file
- [Hub-Server-API-Reference.md](Agent-3-Docs/Hub-Server-API-Reference.md) — All REST endpoints, WebSocket events, file watcher
- [Data-Model-Architecture.md](Agent-3-Docs/Data-Model-Architecture.md) — Files vs database decisions, SQLite schema

**Existing Documents:**
- [Architecture-Migration-Plan.md](Agent-3-Docs/Architecture-Migration-Plan.md) — Supabase → Local migration plan
- [Operations-Mac-Mini-Setup.md](Agent-3-Docs/Operations-Mac-Mini-Setup.md) — Deployment checklist

---

# 1. Vision & Core Concepts

## 1.1 What Is Kaivoo Hub?

Kaivoo Hub is a **self-hosted personal AI operating system**. It runs continuously on a dedicated Mac Mini and is accessed from any device (phone, laptop, desktop) via a web browser. All data — journal entries, notes, files, media, tasks, routines — lives on the Hub machine as real files in a user-chosen folder. AI agents operate on these files using the user's own API keys.

## 1.2 Core Philosophy

```
1. YOU OWN YOUR DATA
   Every file is a real file on your disk. Open it in Finder,
   Obsidian, VS Code, or any other tool. No vendor lock-in.
   No cloud dependency. No subscription required for your own data.

2. AI SERVES YOU, NOT THE OTHER WAY AROUND
   You choose which AI to use. You provide your own keys.
   AI agents are defined as simple markdown files you can
   read, edit, and understand. No black boxes.

3. ONE HUB, EVERY DEVICE
   Your phone, laptop, and desktop are all thin clients.
   The Hub is the single source of truth. Changes are instant
   and synchronized via WebSocket.

4. FILES FIRST, DATABASE SECOND
   If data can be a file, it's a file. Database is reserved
   for structured metadata (tags, tasks, routines, search index)
   that doesn't make sense as individual files.
```

## 1.3 The Six Subsystems

| # | System | Purpose |
|---|--------|---------|
| 1 | **The Vault** | File system. Folders, files, media. Obsidian-compatible markdown. Any file type. Tags, search, filters. |
| 2 | **The Journal** | Daily entries as .md files. Rich text. AI-powered pattern analysis across time. |
| 3 | **The Dashboard** | Command center. Widgets, routines, tasks, calendar. The "Today" view. |
| 4 | **The Concierge** | AI orchestrator. Routes requests to agents, manages skills, relays results. |
| 5 | **The Theater** | Media playback and previews. Plex-like filtering for video, PDF, presentations. |
| 6 | **The Workshop** | Developer mode. Self-extending platform. Build widgets, MCPs, skills, agents, and integrations — via UI or AI. |

Plus one cross-cutting concern:

| System | Purpose |
|--------|---------|
| **The Soul** | Persistent user memory file. Communication style, goals, struggles, preferences. Referenced by AI for personalized interaction. |

---

# 2. System Overview

## 2.1 High-Level Architecture

```
YOUR DEVICES (thin clients)                  KAIVOO HUB (Mac Mini)
┌──────────────┐                            ┌────────────────────────────────────┐
│   Phone      │                            │                                    │
│   (Safari)   │─── HTTPS (Tailscale) ────► │  ┌────────────────────────────┐    │
├──────────────┤                            │  │   Node.js Server (Express)  │    │
│   Laptop     │─── HTTPS (Tailscale) ────► │  │   • Serves React SPA        │    │
│   (Chrome)   │                            │  │   • REST API (/api/*)        │    │
├──────────────┤                            │  │   • WebSocket (real-time)    │    │
│   Desktop    │─── HTTPS (Tailscale) ────► │  │   • File watcher (chokidar) │    │
│   (Firefox)  │                            │  └──────────┬─────────────────┘    │
└──────────────┘                            │             │                      │
                                            │  ┌──────────▼─────────────────┐    │
All devices see the SAME app.               │  │   LOCAL FILE SYSTEM         │    │
All changes happen on THIS machine.         │  │   ~/Kaivoo/ (user-chosen)   │    │
                                            │  └──────────┬─────────────────┘    │
                                            │             │                      │
                                            │  ┌──────────▼─────────────────┐    │
                                            │  │   SQLite + AI Layer         │    │
                                            │  │   .kaivoo/kaivoo.db         │    │
                                            │  │   Ollama / Claude / OpenAI  │    │
                                            │  └────────────────────────────┘    │
                                            └────────────────────────────────────┘
```

---

# 3. The Dashboard

The Dashboard (Today page) keeps its existing widget-based architecture:
- Customizable widget grid with drag-to-reorder
- Daily Brief, Journal, Tasks, Calendar, Tracking widgets
- Routines with streak tracking
- Settings page

### What Changes in Hub Migration

| Component | Current (Supabase) | New (Hub) |
|-----------|-------------------|-----------|
| Data source | Supabase PostgreSQL | Hub API → SQLite + files |
| Tasks | Supabase table | SQLite table |
| Routines | Supabase table | SQLite table |
| Journal widget | Supabase table | Reads from Journal/ folder |
| Calendar | Supabase table | SQLite table (with optional Google Calendar sync) |
| Widget config | Supabase table | SQLite table |

### New Dashboard Widgets

| Widget | Data Source |
|--------|-------------|
| **Recent Files** | File watcher → last 10 modified files |
| **Starred Items** | SQLite bookmarks |
| **AI Concierge Chat** | Inline chat with the Concierge |
| **Storage Usage** | Disk space indicator |
| **Routine Reports** | SQLite → streak charts, completion rates |
| **Vault Stats** | Total files, total size, files by type breakdown |

---

# 4. Technology Stack

## 4.1 Hub Server (Backend)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js 20 LTS | Same language as frontend. Excellent fs APIs. |
| **Framework** | Express.js (or Fastify) | Battle-tested, simple, huge ecosystem |
| **Database** | SQLite (better-sqlite3) | Single file, zero config, embedded, perfect for single-user |
| **File Watching** | chokidar | Cross-platform file system watcher for real-time indexing |
| **WebSocket** | ws (or Socket.IO) | Real-time sync across devices |
| **Text Extraction** | pdf-parse (PDF), mammoth (DOCX), pptx (PPTX) | Extract searchable text from binary files |
| **Search** | SQLite FTS5 | Full-text search, built into SQLite |
| **Process Manager** | PM2 | Keeps Hub running 24/7, auto-restarts, log management |
| **Git (optional)** | simple-git | File versioning via git commits |

## 4.2 Frontend (Client)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 18 + Vite | Keep current stack. Fast DX. |
| **Styling** | Tailwind CSS + shadcn/ui | Keep current. Re-themed to Kaivoo Design System. |
| **State** | Zustand (UI) + React Query (server) | UI-only state in Zustand. Server data via React Query → Hub API |
| **Markdown** | TipTap (editing) + marked/remark (rendering) | Rich text editing and rendering for journal/notes |
| **File Previews** | PDF.js, Video.js, SheetJS, Monaco | In-browser previews for all file types |
| **Real-time** | WebSocket client | Live updates when files change |
| **Routing** | React Router v6 | Keep current |

## 4.3 AI Layer

| Component | Technology | Why |
|-----------|-----------|-----|
| **Local LLM** | Ollama | Runs Llama 3, Mistral locally on Mac Mini (16GB RAM supports 8B models) |
| **Cloud APIs** | Direct HTTP calls to Claude, OpenAI, Gemini | No framework overhead. BYOK. |
| **RAG Pipeline** | LangChain.js or custom | Retrieve relevant file chunks → send to AI with context |
| **Embeddings** | Local via Ollama (nomic-embed-text) | Semantic search without cloud dependency |
| **Vector Store** | SQLite with vector extension (sqlite-vss) or ChromaDB | Stores embeddings for semantic search |

## 4.4 Infrastructure

| Component | Technology | Why |
|-----------|-----------|-----|
| **Remote Access** | Tailscale (primary) or Cloudflare Tunnel | Secure access from any device without port forwarding |
| **Auth** | Supabase Auth | Keep existing. Handles login/signup. |
| **HTTPS** | Tailscale auto-TLS or self-signed + Cloudflare | Encrypted connections |
| **Monitoring** | PM2 dashboard + optional Sentry | Process health, error tracking |

---

# 5. Real-Time Sync

```
DEVICE A (Phone)          HUB SERVER              DEVICE B (Laptop)
    │                         │                         │
    │  WS: connected          │          WS: connected  │
    │◄────────────────────────│────────────────────────►│
    │                         │                         │
    │  User edits journal     │                         │
    │  PUT /api/journal/...   │                         │
    │────────────────────────►│                         │
    │                         │  Write to disk          │
    │                         │  Update SQLite index    │
    │                         │                         │
    │  WS: file:modified      │  WS: file:modified     │
    │◄────────────────────────│────────────────────────►│
    │                         │                         │
    │  (already has latest)   │  React Query invalidate │
    │                         │  Re-fetch + re-render   │
```

All file operations go through the Hub API. The Hub writes to disk, updates indexes, and broadcasts changes to all connected WebSocket clients. Clients use React Query's cache invalidation to re-render.

---

# 6. Remote Access

## Tailscale (Recommended)

1. Install Tailscale on Mac Mini (Hub) + all devices
2. All devices join the same Tailnet
3. Mac Mini accessible at: `http://kaivoo-hub:3000`
4. Optional: Enable Tailscale HTTPS for auto-TLS certificate
5. **Cost:** Free for personal use (up to 3 users, 100 devices)

## Cloudflare Tunnel (Alternative)

1. Register domain (~$10/year), install cloudflared on Mac Mini
2. Route `kaivoo.yourdomain.com → localhost:3000`
3. Optional: Cloudflare Access for additional auth layer

> **Security & Authentication:** See Agent 4 (Security & Reliability Engineer) for all auth flows, network security, API key protection, and threat modeling.

---

# 7. Reference Pointers

> **Migration Plan:** See [Agent-3-Docs/Architecture-Migration-Plan.md](Agent-3-Docs/Architecture-Migration-Plan.md) for the Supabase → Local migration plan.

> **Development Roadmap:** See [Vision.md](../../Vision.md) for the phased roadmap. The Director manages sprint planning.

> **Future Extensions:** See [Vision.md](../../Vision.md) Phase 5 for growth and scaling plans.

> **Mac Mini Setup:** See [Agent-3-Docs/Operations-Mac-Mini-Setup.md](Agent-3-Docs/Operations-Mac-Mini-Setup.md) for the deployment checklist.

---

**Kaivoo Hub — System Architecture v1.1**
**February 2026**

*Your data. Your machine. Your AI. Your rules. Your platform.*
