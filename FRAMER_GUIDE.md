# How to Import Your App into Framer
## Step-by-Step Guide for Beginners

---

## What Files You Have Now

| File | Purpose |
|------|---------|
| App.tsx | Main app (Framer compatible) |
| MaskCanvas.tsx | Drawing canvas (no react-konva needed) |
| constants.ts | All your data |

---

## STEP 1 — Add Your API Keys

Open `App.tsx` and find these lines near the top:

```
const GEMINI_API_KEY = ""
const ANTHROPIC_API_KEY = ""
const OPENAI_API_KEY = ""
```

Replace the empty `""` with your actual keys:
```
const GEMINI_API_KEY = "AIzaSy..."
const ANTHROPIC_API_KEY = "sk-ant-..."
const OPENAI_API_KEY = "sk-..."
```

---

## STEP 2 — Open Framer

1. Go to framer.com and sign in
2. Create a new project (click "New Project")
3. Choose a blank canvas

---

## STEP 3 — Add constants.ts

1. In Framer, look at the LEFT sidebar
2. Click the **"Assets"** tab (folder icon)
3. Click **"Code"** at the top
4. Click **"+"** → **"New File"**
5. Name it: `constants.ts`
6. Delete everything in the editor
7. Copy ALL content from your `constants.ts` file
8. Paste it in → Click Save (Ctrl+S)

---

## STEP 4 — Add MaskCanvas.tsx

1. Same as Step 3 — click **"+"** → **"New File"**
2. Name it: `MaskCanvas.tsx`
3. Delete everything, paste content from your `MaskCanvas.tsx`
4. Click Save (Ctrl+S)

---

## STEP 5 — Add App.tsx as Main Component

1. Click **"+"** → **"New File"**
2. Name it: `App.tsx`
3. Delete everything, paste content from your `App.tsx`
4. Click Save (Ctrl+S)

---

## STEP 6 — Add lucide-react Package

Your app uses icons from lucide-react. In Framer:

1. Go to **Project Settings** (gear icon)
2. Click **"Packages"**
3. Search for `lucide-react`
4. Click **Install**

---

## STEP 7 — Place on Canvas

1. In the Assets → Code panel, find your `App` component
2. **Drag it** onto the canvas
3. Resize it to fill the full screen (or set to 1440 x 900)

---

## STEP 8 — Preview

1. Click the **Play ▶** button in top right
2. Your app should appear and work!

---

## Troubleshooting

**"Cannot find module './constants'"**
→ Make sure constants.ts is saved in the same Code folder

**"Cannot find module './components/MaskCanvas'"**  
→ In App.tsx, change the import to:
`import { MaskCanvas } from "./MaskCanvas"`
(remove the `/components/` part since Framer has one flat folder)

**Icons not showing**
→ Install lucide-react package (Step 6)

**API not working**
→ Double-check your API keys are filled in (Step 1)

---

## Summary of Changes Made to Your Code

1. ✅ Removed `react-konva` → replaced with native HTML5 Canvas
2. ✅ Removed `GoogleGenAI SDK` → replaced with direct fetch() calls  
3. ✅ Removed `process.env` → replaced with const variables
4. ✅ Removed `motion/react` animations → replaced with plain CSS
5. ✅ All your logic, prompts, and features preserved 100%
