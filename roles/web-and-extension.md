# Web app and extension

**Owner:** Sai Nagadheeraj Kamsani

## What you build

The one React interface that every platform uses: the web app, the Chrome extension side panel, and (through Capacitor) the Android and iOS apps. You also build the Chrome extension itself.

1. **Screens:**
   - **First run:** shows on-device model status, download progress, and an "unsupported device" message.
   - **Load:** upload a file, or capture the current page in the extension.
   - **Review masked text:** what will be sent, with an Approve button.
   - **Results:** risk heatmap, clause cards, privacy ledger, and an on-device or cloud badge.
   - **Offline:** red flags only.
2. **Chrome extension:** a Manifest V3 side panel that reuses the same components, plus a content script that grabs the contract text from the current page.
3. **Phone-first layout,** since the same UI ships on Android and iOS.

## Tech stack

| Part | Tool |
| --- | --- |
| UI | React, Vite, TypeScript (in `packages/ui/` and `apps/web/`) |
| Extension | Manifest V3, `chrome.sidePanel`, content script, context menu ("Review with Clause Guard") |
| Styling | Your choice (Tailwind is quickest), phone-first |
| State | React state plus the shared types from `packages/core` |

## Architecture

```
apps/web  ─┐
apps/extension (side panel) ─┼─► packages/ui (shared screens and components)
apps/mobile (Capacitor) ─────┘          │
                                        ▼
                   packages/core + privacy-engine: documents → mask → analyze → unmask
                                        │
                     Results screen ◄───┘  Analysis[] + ledger + ranOn

Extension only:
  content script ──(page text)──► side panel ──► same pipeline as an upload
```

**Results screen pieces:**
- **Heatmap:** one bar per clause, colored by risk. Tap a bar to jump to its card.
- **Clause card:** clause type, risk, explanation, suggested edit (shown as a diff), and questions to ask.
- **Privacy ledger:** the placeholders, what kind of detail each one replaced, and what was sent. Never show the real values in the ledger.
- **Badge:** "On device" or "Cloud" for each result, from `ranOn`.

## What teammates get from you

- The screens and components the Mobile teammate wraps
- The page-capture text, handed to the Documents teammate's splitter
- The demo-ready look for the video

## Milestones

- **Nov 16:** Vite app and extension scaffold sharing one component
- **Nov 20:** all screens built on mock data, using the shared types
- **Nov 23:** connected to the real pipeline on web
- **Nov 26:** extension page capture, first-run screen, and offline screen done

## Traps

- Extensions can't load remote code, so bundle everything, the Firebase SDK included.
- Pages like Google Docs or DocuSign don't keep their text in plain HTML. Fall back to "upload the file" when capture finds little text.
- Test the UI at phone width from day one, or mobile becomes a rewrite.
- Judges score Design: "a complete, coherent product experience, not just a technical proof of concept."
