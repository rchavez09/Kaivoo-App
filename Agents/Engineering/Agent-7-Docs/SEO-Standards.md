# SEO Standards

**Source:** Extracted from Agent 7 Code Reviewer spec, Section 11
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

## 11.1 Required Meta Tags

```html
<!-- MINIMUM (non-negotiable for any public page) -->
<title>{Page Title} — Kaivoo</title>
<meta name="description" content="{Page-specific description}" />
<link rel="canonical" href="https://kaivoo.app{path}" />

<!-- Open Graph (required for social sharing) -->
<meta property="og:title" content="{Title}" />
<meta property="og:description" content="{Description}" />
<meta property="og:image" content="/kaivoo-og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://kaivoo.app{path}" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@Kaivoo" />
<meta name="twitter:title" content="{Title}" />
<meta name="twitter:description" content="{Description}" />
<meta name="twitter:image" content="/kaivoo-og.png" />
```

## 11.2 Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kaivoo",
  "description": "Your command center for deep work.",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web"
}
</script>
```
