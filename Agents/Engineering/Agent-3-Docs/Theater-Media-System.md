# The Theater (Media) — Detailed Design

**Source:** Extracted from Agent 3 System Architect spec, Section 7
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## 7.1 File Type Registry

| Category | Extensions | Viewer Technology |
|----------|------------|-------------------|
| **Video** | .mp4, .mov, .webm, .avi, .mkv | Video.js player |
| **Audio** | .mp3, .wav, .m4a, .flac | Waveform player (WaveSurfer.js) |
| **Document** | .pdf | PDF.js |
| **Presentation** | .pptx, .key | pptx-to-html conversion |
| **Spreadsheet** | .xlsx, .csv | SheetJS table viewer |
| **Image** | .png, .jpg, .svg, .gif, .webp | Lightbox gallery |
| **Markdown** | .md | Kaivoo rich renderer |
| **Code** | .js, .py, .ts, .sql, etc. | Monaco / syntax highlight |
| **Archive** | .zip, .tar.gz | Contents listing |
| **Other** | * | File info + download |

## 7.2 Theater Search & Filtering

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Search: "kaivoo"                                            │
│                                                                 │
│  Type: [All] [📹 Video] [📄 PDF] [🖼️ Image] [📊 PPT] [📝 MD]   │
│  Tags: [#kaivoo ×] [+ Add tag...]                               │
│  Folder: [All Folders ▼]                                        │
│  Date: [Any time ▼]        Sort: [Modified ▼]                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📹 Product Demo.mp4                  2.4 GB    Feb 18, 2026   │
│     Projects/Kaivoo/Videos/           #kaivoo #demo             │
│                                                                 │
│  📄 Brand Guidelines.pdf              1.2 MB    Feb 15, 2026   │
│     Brand Guidelines/Kaivoo/          #kaivoo #brand            │
│                                                                 │
│  📝 Architecture.md                   24 KB     Feb 20, 2026   │
│     Projects/Kaivoo/Engineering/      #kaivoo #architecture     │
│                                                                 │
│  🖼️ kaivoo-logo.png                   180 KB    Jan 10, 2026   │
│     Projects/Kaivoo/Branding/         #kaivoo #logo             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
