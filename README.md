# SecureLink VPN

Simple, clean, ad-supported VPN mobile UI demo built with **Next.js 14 + React + Tailwind**.

Based on the Figma design: [SecureLink VPN - Mobile App UI](https://www.figma.com/design/Bs9j6oiEu7pnYqGlCruay6)

## Features

- One-tap Connect / Disconnect (simulated)
- Light & Dark theme
- English + فارسی (full RTL support)
- Server list with search + Recommended
- Onboarding flow (3 steps)
- Settings, Language switcher, Profile
- Ad banners (main revenue model)
- Mobile-first design (Android + iOS ready)
- Ready for TWA / PWA packaging

## Tech Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Simple client-side state (no heavy backend needed for demo)
- Mock server list (easy to replace with free public API)

## Getting Started

```bash
git clone https://github.com/MohamadHoseinMaleki/securelink-vpn.git
cd securelink-vpn
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  layout.tsx          # Root layout + metadata
  page.tsx            # Main app (all screens in one client component)
  globals.css         # Tailwind + CSS variables for light/dark
lib/
  i18n.ts             # English / Persian translations
  servers.ts          # Mock server list for demo
```

## Notes for Production

- This is a **UI demo**. No real VPN connection is performed.
- Server list is mocked in `lib/servers.ts`. You can replace it with a fetch to publicvpnlist.com or any free list.
- For real Android packaging as **Trusted Web Activity (TWA)**, deploy the web app and use Bubblewrap.
- Ads are static placeholders — integrate real ad networks later.

## License

MIT