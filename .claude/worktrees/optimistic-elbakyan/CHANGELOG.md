# Changelog - ClarStiri / thesite.ro

## 2024-12-25

### 🎄 Update Major de Crăciun

#### 📰 Surse de Știri
- **+7 surse noi:** Snoop.ro, Vice România, Spotmedia, Biziday, Pagina de Media, EuropaFM, Scena9
- **Total surse:** 35 publicații românești
- **Scor Factualitate:** Adăugat pentru toate sursele (high/mixed/low)

#### 🤖 Comparație Bias AI (Gemini)
- Integrare cu Google Gemini API pentru analiză automată de bias
- Se generează automat când userul deschide o știre
- Analizează cum surse de stânga/centru/dreapta prezintă aceeași știre
- **Fișiere noi:**
  - `src/services/geminiService.ts`
  - `src/hooks/useBiasComparison.ts`
  - `.env.local` (VITE_GEMINI_API_KEY)

#### 📖 Pagina Metodologie
- **Rută nouă:** `/metodologie`
- Explică cum funcționează clasificarea bias-ului în context românesc
- Include lista completă a surselor cu clasificări și factualitate
- Explică ce sunt "Punctele Orbite" și bara de bias

#### ⚡ Optimizări Performanță
- Timeout fetch redus: 5s → 3s
- Surse prioritare extinse: 4 → 10 publicații
- Lazy loading pentru imagini în FeaturedStory, NewsListItem, BlindspotCard

#### 🎨 Îmbunătățiri UI
- Bara de bias afișează ÎNTOTDEAUNA procentul (pentru segmente <18% doar numărul)
- Eliminată secțiunea "Pentru Tine" din header
- Footer actualizat cu link-uri către Metodologie
- Branding consistent "thesite.ro"

---

## 2023-12-23

### 🚀 Deployment Vercel

**Status:** În așteptare propagare DNS

#### Ce s-a configurat:

1. **ROTLD (registrar domeniu)**
   - Nameservere setate la:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`

2. **Vercel Dashboard**
   - `thesite.ro` → redirect 307 către www.thesite.ro
   - `www.thesite.ro` → Production
   - `clar-stiri.vercel.app` → Production ✅ (funcționează)

3. **Fișiere adăugate:**
   - `vercel.json` - configurare SPA routing + headers securitate

#### Timeline:
- **21:10** - Verificat configurație ROTLD - nameservere OK
- **21:11** - Creat `vercel.json` pentru SPA routing
- **21:11** - Push la GitHub (commit: `2823344`)
- **21:13** - Confirmat că trebuie doar așteptat DNS propagation (1-48h)

#### Link-uri utile:
- Live (temporar): https://clar-stiri.vercel.app
- Verificare DNS: https://dnschecker.org/#A/thesite.ro
- Domeniu final: https://thesite.ro (după propagare DNS)

---
