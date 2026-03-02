# The Journal — Detailed Design

**Source:** Extracted from Agent 3 System Architect spec, Section 4
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## 4.1 Journal File Format

```markdown
<!-- ~/Kaivoo/Journal/2026/02 - February/2026-02-20.md -->
---
date: 2026-02-20
mood: good
tags: [kaivoo, productivity, design]
word_count: 847
---

# Thursday, February 20, 2026

## Morning Reflection
Woke up energized today. Been thinking about the Kaivoo architecture
shift — moving from cloud to self-hosted feels right. There's something
powerful about **owning your own data**.

## Work Log
- Finished the [[Kaivoo Design System]] color migration
- Had a great conversation about the Hub architecture
- Need to look into #tailscale for remote access

## Evening
Read another chapter of [[Atomic Habits]]. The idea of "environment design"
connects to what I'm building with Kaivoo.

## Captures
- [ ] Research Tailscale vs Cloudflare Tunnel
- [ ] Order Mac Mini for Hub setup
- [x] Update CSS tokens to Kaivoo palette
```

Files are organized: `Journal/YYYY/MM - MonthName/YYYY-MM-DD.md`

The app renders these as rich text (bold, italic, headers, checkboxes, links) while the underlying file is plain markdown you can open anywhere.

## 4.2 Journal Templates

Users can create templates in `Journal/Templates/`. When creating a new entry, they can choose a template or use the default. Templates are just .md files with placeholder tokens:

```markdown
---
date: {{date}}
mood:
tags: []
---

# {{day_name}}, {{full_date}}

## Morning Reflection


## What I'm Working On


## Gratitude
1.
2.
3.

## End of Day Review

```

## 4.3 Journal AI Superpowers

| Feature | What It Does | AI Provider |
|---------|-------------|-------------|
| **Pattern Analysis** | "What themes appeared most in Jan 2026?" Reads all entries in range, identifies recurring topics | User's default journal AI |
| **Mood Tracking** | Auto-detect mood from writing tone, or manual. Visualize over time. | Local LLM (cheap) |
| **Auto-tagging** | Suggest tags after writing based on content | Local LLM |
| **Weekly Digest** | Auto-generated summary: word count, top themes, mood trends | User's default journal AI |
| **Capture Extraction** | Pull out `- [ ]` items and surface as tasks on Dashboard | No AI needed (regex) |
| **Cross-referencing** | "What did I write about Kaivoo last week?" | Search index + AI summary |
