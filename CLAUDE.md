# Top 1% Dating Profile Optimizer — CLAUDE.md

## What This Project Does

This is a **client-side web application** that uses Google Gemini Vision AI to analyze dating profile photos and bios (Tinder, Bumble, Hinge, etc.) and provides actionable, data-driven feedback to improve match rates.

Users upload their profile photo, optionally paste their bio/prompts, and receive:
- A **Match Score** (0–100)
- A candid **Profile Assessment**
- **Top 3 must-fix improvements**
- **10–15 color-coded feedback highlights** on bio text and photo chips

Everything runs in the browser. Photos and bios never leave the user's device (they go directly from the browser to the Gemini API).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion (`motion/react`) |
| Icons | Lucide React |
| AI | Google Gemini 2.5 Pro (Vision API) via `@google/genai` |

---

## Project Structure

```
src/
  App.tsx                   # Root component — state machine & overall layout
  main.tsx                  # React entry point
  index.css                 # Tailwind + Google Fonts (Inter, Playfair Display)
  services/
    gemini.ts               # Gemini Vision API call + types (ProfileAnalysis)
    pdf.ts                  # Legacy PDF parser (unused — was for resume version)
  components/
    FileUpload.tsx           # Image upload + bio textarea + submit button
    Dashboard.tsx            # Match Score card + Profile Assessment + Top 3 items
    ResumeViewer.tsx         # Photo display + highlighted bio text + hover tooltip
```

---

## How It Works — Step by Step

### 1. User Input (`FileUpload.tsx`)

The `FileUpload` component handles two inputs:

- **Profile photo**: Drag-and-drop or click to pick an image (JPG, PNG, WebP). A live preview is shown immediately using `FileReader.readAsDataURL`.
- **Bio/Prompts textarea**: Optional free-text input for bios, Hinge prompts, interests, etc.

Once a photo is selected, the "Analyze My Profile" button becomes active.

### 2. Image Encoding (`App.tsx` — `readFileAsBase64`)

When the user clicks "Analyze", `App.tsx` runs `readFileAsBase64(file)` which:
- Uses `FileReader.readAsDataURL` to produce a base64 data URL
- Splits it into `base64` (raw data) and `mimeType` (e.g., `image/jpeg`)
- Creates an `imageUrl` using `URL.createObjectURL(file)` for local preview display

### 3. API Key Handling (`App.tsx`)

The app uses a **Bring Your Own Key (BYOK)** model:
- On first use, if no key is stored, the app enters `need_key` state and shows a modal
- The key is saved to `localStorage` under `gemini_api_key`
- Subsequent analyses use the cached key automatically
- Users can clear the key at any time via the header button

### 4. Gemini Vision Analysis (`services/gemini.ts`)

`analyzeProfile(imageBase64, mimeType, bioText, apiKey)` sends a **multimodal request** to Gemini 2.5 Pro:

```
Contents:
  Part 1: inlineData (the base64 image)
  Part 2: text prompt (analysis instructions + bio text)
```

The prompt instructs Gemini to return structured JSON (enforced via `responseSchema`) containing:

```typescript
interface ProfileAnalysis {
  matchScore: number;           // 0-100
  executiveConclusion: string;  // Overall candid assessment
  mustFixItems: string[];       // Exactly 3 priority improvements
  highlights: ProfileHighlight[]; // 10-15 feedback items
}

interface ProfileHighlight {
  textToHighlight: string;  // Exact bio substring OR "" for photo feedback
  category: 'photo' | 'bio';
  color: 'green' | 'yellow' | 'red';
  before: string;           // Current state / issue
  after: string;            // Suggested improvement
  explanation: string;      // Why it matters for matches
}
```

### 5. Results Display

#### Dashboard (`Dashboard.tsx`)
- **Match Score card**: Color-coded (green ≥80, amber 60–79, red <60)
- **Profile Assessment card**: The `executiveConclusion` paragraph
- **Top 3 Improvements**: Numbered cards for `mustFixItems`

#### Detailed Feedback (`ResumeViewer.tsx`)

The `ResumeViewer` component receives:
- `imageUrl` — the local object URL for the photo
- `bioText` — the raw bio string the user entered
- `highlights` — array of `ProfileHighlight` objects

**Photo feedback**: Highlights where `category === 'photo'` are rendered as color-coded chip buttons below the photo image. Hovering a chip shows the tooltip panel.

**Bio text highlighting** (`buildBioSegments` function):
1. Filters highlights where `category === 'bio'` and `textToHighlight` is non-empty
2. Finds the position of each phrase in the bio string using `String.indexOf`
3. Deduplicates overlapping matches
4. Splits the bio into an ordered array of `{ text, highlight | null }` segments
5. Renders plain segments as `<span>` and highlighted segments as colored `<span>` with hover events

**Tooltip panel**: A sticky right-side panel showing the `before`, `after`, and `explanation` for whichever highlight is currently hovered. Uses Framer Motion for smooth enter/exit transitions.

---

## Application State Machine

```
idle
  └─(user submits photo+bio)──► analyzing ──► done
                                     │
                          (no API key stored)
                                     ▼
                               need_key ──(key saved)──► analyzing ──► done
                                                                 │
                                                              error
```

States:
- `idle` — Upload form shown
- `analyzing` — Spinner + progress bar shown; Gemini API call in flight
- `need_key` — API key modal shown; data held in `pendingData` state
- `done` — Dashboard + Detailed Feedback shown
- `error` — Error message + "Try Again" button shown

---

## Environment & Configuration

```bash
# .env (optional — users can also enter key via UI)
GEMINI_API_KEY=your_key_here
```

The app reads `process.env.API_KEY` or `process.env.GEMINI_API_KEY` as fallback, but the primary path is the localStorage key entered via the UI modal.

### Running locally

```bash
npm install
npm run dev      # starts on http://localhost:3000
npm run build    # production build
```

---

## Key Design Decisions

- **No backend**: All processing is client-side. The only external call is to the Gemini API, made directly from the browser.
- **BYOK model**: Users provide their own Gemini API key, stored only in their browser's localStorage.
- **Structured output**: `responseSchema` is passed to Gemini to guarantee valid, parseable JSON — no regex or fragile parsing.
- **Multimodal input**: Both the image and the bio text are sent in a single Gemini request, allowing cross-referencing (e.g., "your bio says X but your photo suggests Y").
- **Highlight deduplication**: The `buildBioSegments` function prevents overlapping highlight spans, which would break the React render tree.
- **Pink color theme**: Updated from the original indigo/resume theme to pink to match the dating app context.
