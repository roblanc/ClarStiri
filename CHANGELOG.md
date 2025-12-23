# Changelog - ClarStiri / thesite.ro

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
