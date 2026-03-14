
// App.tsx - Gemini Only Version (Framer Compatible)
import React, { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import * as Icons from "https://esm.sh/lucide-react"
const Sparkles = Icons.Sparkles, Copy = Icons.Copy, RotateCcw = Icons.RotateCcw, Sun = Icons.Sun, Wind = Icons.Wind, User = Icons.User, Check = Icons.Check, Loader2 = Icons.Loader2, Trash2 = Icons.Trash2, ImageIcon = Icons.Image, Upload = Icons.Upload, Zap = Icons.Zap, X = Icons.X, FileJson = Icons.FileJson, Wand2 = Icons.Wand2, ImagePlus = Icons.ImagePlus, Edit3 = Icons.Edit3, Download = Icons.Download
import { PROMPT_CATEGORIES, CAMERAS, LENSES, ASPECT_RATIOS, CAMERA_ANGLES } from "./constants"
import { MaskCanvas } from "./MaskCanvas"

const GEMINI_API_KEY = "AIzaSyAjKOo6GUdYR-mwaFpBM5jWOwXoc0fO6AA"
const GEMINI_MODEL = "gemini-1.5-flash"

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const body: any = { contents: [{ parts: [{ text: prompt }] }] }
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  )
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
}

async function callGeminiWithImage(prompt: string, base64Image: string, mimeType: string): Promise<string> {
  const body = { contents: [{ parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }] }] }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  )
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
}

export default function App() {
  const [subject, setSubject] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [synthesizedPrompt, setSynthesizedPrompt] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [isLiveAI, setIsLiveAI] = useState(true)
  const [isHiggsfield, setIsHiggsfield] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)
  const [jsonCopied, setJsonCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"builder" | "editor">("builder")
  const [refImage, setRefImage] = useState<string | null>(null)
  const [refImageFile, setRefImageFile] = useState<File | null>(null)
  const [editPrompt, setEditPrompt] = useState("")
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [maskLines, setMaskLines] = useState<any[]>([])
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false)
  const [imageAspectRatio, setImageAspectRatio] = useState(1)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const modalCanvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [modalCanvasSize, setModalCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (refImage) {
      const img = new Image()
      img.onload = () => setImageAspectRatio(img.width / img.height)
      img.src = refImage
    }
  }, [refImage])

  useEffect(() => {
    if (editorContainerRef.current && refImage) {
      const { width } = editorContainerRef.current.getBoundingClientRect()
      setCanvasSize({ width, height: width / imageAspectRatio })
    }
  }, [refImage, activeTab, imageAspectRatio])

  useEffect(() => {
    if (isMarkingModalOpen && modalCanvasRef.current) {
      const update = () => {
        if (!modalCanvasRef.current) return
        const { width: cw, height: ch } = modalCanvasRef.current.getBoundingClientRect()
        let w = cw, h = cw / imageAspectRatio
        if (h > ch) { h = ch; w = ch * imageAspectRatio }
        setModalCanvasSize({ width: w, height: h })
      }
      update()
      window.addEventListener("resize", update)
      return () => window.removeEventListener("resize", update)
    }
  }, [isMarkingModalOpen, imageAspectRatio])

  const templatePrompt = React.useMemo(() => {
    let prompt = subject || ""
    const modifiers = []
    if (selectedOptions.activity)   modifiers.push(selectedOptions.activity)
    if (selectedOptions.position)   modifiers.push(selectedOptions.position)
    if (selectedOptions.expression) modifiers.push(`with a ${selectedOptions.expression.toLowerCase()} expression`)
    if (selectedOptions.gaze)       modifiers.push(selectedOptions.gaze.toLowerCase())
    if (selectedOptions.medium)     modifiers.push(selectedOptions.medium)
    if (selectedOptions.artist)     modifiers.push(`in the style of ${selectedOptions.artist}`)
    if (selectedOptions.lighting)   modifiers.push(`with ${selectedOptions.lighting.toLowerCase()}`)
    if (selectedOptions.mood)       modifiers.push(`${selectedOptions.mood.toLowerCase()} mood`)
    if (modifiers.length > 0) prompt += (prompt ? ", " : "") + modifiers.join(", ")
    if (selectedOptions.camera || selectedOptions.lens || selectedOptions.cameraAngle) {
      const tech = []
      if (selectedOptions.cameraAngle) tech.push(`${selectedOptions.cameraAngle} shot`)
      if (selectedOptions.camera)      tech.push(`shot on ${selectedOptions.camera}`)
      if (selectedOptions.lens)        tech.push(`using ${selectedOptions.lens}`)
      prompt += (prompt ? ". " : "") + tech.join(", ")
    }
    if (selectedOptions.aspectRatio) prompt += ` --ar ${selectedOptions.aspectRatio}`
    return prompt
  }, [subject, selectedOptions])

  const currentPrompt = enhancedPrompt || synthesizedPrompt || templatePrompt

  useEffect(() => {
    if (!isLiveAI) { setSynthesizedPrompt(""); return }
    const timer = setTimeout(async () => {
      if (!subject && Object.keys(selectedOptions).length === 0) { setSynthesizedPrompt(""); return }
      setIsSynthesizing(true)
      try {
        const text = await callGemini(
          `Create a single, cohesive, highly descriptive natural language prompt based on these inputs:
          Subject: ${subject}
          Settings: ${JSON.stringify(selectedOptions)}
          ${isHiggsfield ? "Optimization: Higgsfield AI (Video Generation)" : "Optimization: General High-End Image Generation"}
          Guidelines:
          - Integrate all settings naturally into a single descriptive sentence or short paragraph.
          ${isHiggsfield ? "- Emphasize motion, dynamics, and cinematic camera movements." : ""}
          - If an 'aspectRatio' is provided, append it as '--ar [value]' at the end.
          - Do NOT just list keywords. Make it sound professional and artistic.
          - Return ONLY the prompt text.`,
          `You are a world-class AI prompt engineer specializing in ${isHiggsfield ? "Higgsfield AI and video generation" : "image generation"}.`
        )
        if (text) setSynthesizedPrompt(text.trim())
      } catch (e) { console.error("Synthesis failed:", e) }
      finally { setIsSynthesizing(false) }
    }, 1000)
    return () => clearTimeout(timer)
  }, [subject, selectedOptions, isLiveAI, isHiggsfield])

  useEffect(() => { if (enhancedPrompt) setEnhancedPrompt(null) }, [subject, selectedOptions])

  const ANALYSIS_PROMPT = `Analyze this image and provide details for an AI image generation prompt. Return ONLY valid JSON with no extra text, using this exact format: {"camera":"camera type, lens, angle","subject":"main subject description","action":"what is happening","environment":"setting, background","lighting":"lighting style, time of day","texture":"surface details, materials","combined":"Camera → Subject → Action → Environment → Lighting → Texture"}. The combined field must use the → separator.`

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setRefImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setRefImage(result)
        handleAnalyzeWithGemini(result, file)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => { setRefImage(null); setRefImageFile(null); setImageAnalysis(null) }

  const handleAnalyzeWithGemini = async (imageData?: string, file?: File) => {
    const img = imageData || refImage
    const f = file || refImageFile
    if (!img || !f) return
    setIsAnalyzing(true); setImageAnalysis(null)
    try {
      const base64 = img.split(",")[1]
      const text = await callGeminiWithImage(ANALYSIS_PROMPT, base64, f.type)
      if (text) {
        const clean = text.replace(/```json|```/g, "").trim()
        const analysis = JSON.parse(clean)
        setImageAnalysis(analysis)
        setSubject(prev => prev === "" ? (analysis.combined || analysis.subject || "") : prev)
      }
    } catch (e) { console.error("Gemini analysis failed:", e) }
    finally { setIsAnalyzing(false) }
  }

  const handleEditImage = async () => {
    if (!refImage || !editPrompt) return
    setIsEditing(true); setEditedImage(null)
    try {
      const base64 = refImage.split(",")[1]
      const finalPrompt = maskLines.length > 0 ? `${editPrompt} (Focus on the areas marked in the image)` : editPrompt
      const body = { contents: [{ parts: [{ inlineData: { mimeType: refImageFile?.type || "image/jpeg", data: base64 } }, { text: finalPrompt }] }] }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      )
      const data = await res.json()
      for (const part of data?.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) { setEditedImage(`data:image/png;base64,${part.inlineData.data}`); break }
      }
    } catch (e) { console.error("Image editing failed:", e) }
    finally { setIsEditing(false) }
  }

  const toggleOption = (categoryId: string, option: string) => {
    setSelectedOptions(prev => {
      const next = { ...prev }
      if (next[categoryId] === option) delete next[categoryId]
      else next[categoryId] = option
      return next
    })
  }

  const handleEnhance = async () => {
    if (!currentPrompt) return
    setIsEnhancing(true)
    try {
      const text = await callGemini(
        `Enhance this image prompt for high-quality AI generation. Keep it descriptive but concise. Original: "${currentPrompt}"`,
        "You are an expert AI image prompt engineer. Return ONLY the enhanced prompt text."
      )
      if (text) setEnhancedPrompt(text.trim())
    } catch (e) { console.error("Enhancement failed:", e) }
    finally { setIsEnhancing(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(currentPrompt); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ subject, camera: selectedOptions.camera, lens: selectedOptions.lens, options: selectedOptions, fullPrompt: currentPrompt.slice(0, 1000) }, null, 2))
    setJsonCopied(true); setTimeout(() => setJsonCopied(false), 2000)
  }
  const reset = () => { setSubject(""); setSelectedOptions({}); setEnhancedPrompt(null) }

  const s = {
    app:          { minHeight: "100vh", display: "flex", flexDirection: "column" as const, background: "#09090b", color: "#e4e4e7", fontFamily: "Inter, sans-serif" },
    header:       { borderBottom: "1px solid #27272a", background: "rgba(9,9,11,0.8)", backdropFilter: "blur(12px)", position: "sticky" as const, top: 0, zIndex: 50 },
    headerInner:  { maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo:         { display: "flex", alignItems: "center", gap: 8 },
    logoIcon:     { width: 32, height: 32, background: "#059669", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
    logoText:     { fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em" as const },
    nav:          { display: "flex", alignItems: "center", background: "#18181b", borderRadius: 12, padding: 4, border: "1px solid #27272a", gap: 4 },
    tabActive:    { display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "#059669", color: "#fff", border: "none", cursor: "pointer" },
    tabInactive:  { display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "transparent", color: "#a1a1aa", border: "none", cursor: "pointer" },
    main:         { flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "24px 16px" },
    panel:        { background: "#18181b", border: "1px solid #27272a", borderRadius: 16, padding: 24 },
    sectionTitle: { fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
    input:        { width: "100%", background: "#09090b", border: "1px solid #27272a", borderRadius: 12, padding: "12px 16px", color: "#e4e4e7", fontSize: 14, outline: "none", boxSizing: "border-box" as const },
    textarea:     { width: "100%", background: "#09090b", border: "1px solid #27272a", borderRadius: 12, padding: "12px 16px", color: "#e4e4e7", fontSize: 14, outline: "none", resize: "none" as const, boxSizing: "border-box" as const },
    btnPrimary:   { background: "#059669", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
    btnSecondary: { background: "#27272a", color: "#e4e4e7", border: "1px solid #3f3f46", borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
    chip: (active: boolean) => ({ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: active ? "1px solid #10b981" : "1px solid #3f3f46", background: active ? "rgba(16,185,129,0.1)" : "rgba(39,39,42,0.5)", color: active ? "#10b981" : "#a1a1aa", cursor: "pointer" }),
    footer:       { borderTop: "1px solid #27272a", padding: "24px 0", background: "rgba(9,9,11,0.5)" },
  }

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}><Sparkles size={20} color="#fff" /></div>
            <h1 style={s.logoText}>GET YOUR <span style={{ color: "#10b981" }}>PROMPT</span></h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <nav style={s.nav}>
              <button style={activeTab === "builder" ? s.tabActive : s.tabInactive} onClick={() => setActiveTab("builder")}><Wand2 size={16} /> Prompt Builder</button>
              <button style={activeTab === "editor" ? s.tabActive : s.tabInactive} onClick={() => setActiveTab("editor")}><ImagePlus size={16} /> Image Editor</button>
            </nav>
            <button onClick={reset} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}><RotateCcw size={20} /></button>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {activeTab === "builder" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              <section style={s.panel}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={s.sectionTitle}><ImageIcon size={16} /> Image Reference</div>
                  {refImage && <button onClick={removeImage} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><X size={12} /> Remove</button>}
                </div>
                {!refImage ? (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 128, border: "2px dashed #27272a", borderRadius: 12, cursor: "pointer" }}>
                    <Upload size={32} color="#a1a1aa" />
                    <p style={{ fontSize: 14, color: "#a1a1aa", marginTop: 8 }}>Click to upload reference image</p>
                    <input type="file" style={{ display: "none" }} onChange={handleImageUpload} accept="image/*" />
                  </label>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <img src={refImage} alt="Reference" style={{ width: "100%", borderRadius: 12, border: "1px solid #27272a" }} />
                    <button onClick={() => handleAnalyzeWithGemini()} disabled={isAnalyzing} style={{ ...s.btnSecondary, justifyContent: "center" }}>
                      {isAnalyzing ? <Loader2 size={16} /> : <Zap size={16} color="#eab308" />}
                      {isAnalyzing ? "Analyzing..." : "Analyze with Gemini"}
                    </button>
                  </div>
                )}
              </section>

              {imageAnalysis && !isAnalyzing && (
                <section style={{ ...s.panel, borderColor: "rgba(234,179,8,0.2)" }}>
                  <div style={{ ...s.sectionTitle, color: "#eab308" }}><Zap size={16} /> Gemini Analysis</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
                    {["camera", "subject", "action", "environment", "lighting", "texture"].map(k => (
                      <div key={k}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, color: "#71717a", marginBottom: 4 }}>{k}</div>
                        <p style={{ fontSize: 12, color: "#d4d4d8" }}>{imageAnalysis[k] || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid #27272a", paddingTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: "#71717a", fontWeight: 700, textTransform: "uppercase" as const }}>Suggested Prompt</span>
                      <button onClick={() => { setSubject(imageAnalysis.combined || ""); navigator.clipboard.writeText(imageAnalysis.combined || "") }} style={{ ...s.btnSecondary, fontSize: 11, padding: "4px 10px" }}><Copy size={12} /> Use this</button>
                    </div>
                    <p style={{ fontSize: 14, color: "#eab308", fontStyle: "italic", background: "rgba(234,179,8,0.05)", padding: 12, borderRadius: 8, border: "1px solid rgba(234,179,8,0.2)" }}>{imageAnalysis.combined}</p>
                  </div>
                </section>
              )}

              <section style={s.panel}>
                <div style={s.sectionTitle}><User size={16} /> The Subject</div>
                <textarea value={subject} onChange={e => setSubject(e.target.value)} placeholder="What do you want to see? (e.g., A futuristic samurai in a neon forest)" style={{ ...s.textarea, minHeight: 100 }} />
              </section>

              <section style={s.panel}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[{ id: "camera", label: "Camera Body", opts: CAMERAS }, { id: "lens", label: "Lens", opts: LENSES }].map(({ id, label, opts }) => (
                    <div key={id}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, color: "#a1a1aa", marginBottom: 8 }}>{label}</div>
                      <select value={selectedOptions[id] || ""} onChange={e => toggleOption(id, e.target.value)} style={s.input}>
                        <option value="">Select...</option>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, color: "#a1a1aa", marginBottom: 8 }}>Camera Angle</div>
                  <select value={selectedOptions.cameraAngle || ""} onChange={e => toggleOption("cameraAngle", e.target.value)} style={s.input}>
                    <option value="">Select Angle...</option>
                    {CAMERA_ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, color: "#a1a1aa", marginBottom: 8 }}>Aspect Ratio</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ASPECT_RATIOS.map(r => <button key={r} onClick={() => toggleOption("aspectRatio", r)} style={s.chip(selectedOptions.aspectRatio === r)}>{r}</button>)}
                  </div>
                </div>
              </section>

              {PROMPT_CATEGORIES.map(cat => (
                <section key={cat.id} style={s.panel}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, color: "#a1a1aa", marginBottom: 12 }}>{cat.name}</div>
                  {cat.type === "select" ? (
                    <select value={selectedOptions[cat.id] || ""} onChange={e => toggleOption(cat.id, e.target.value)} style={s.input}>
                      <option value="">Select {cat.name}...</option>
                      {cat.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {cat.options.map(o => <button key={o} onClick={() => toggleOption(cat.id, o)} style={s.chip(selectedOptions[cat.id] === o)}>{o}</button>)}
                    </div>
                  )}
                </section>
              ))}
            </div>

            <div>
              <div style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 24 }}>
                <section style={{ ...s.panel, borderColor: "rgba(16,185,129,0.3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...s.sectionTitle, marginBottom: 0 }}>Generated Prompt</span>
                      {isSynthesizing && <span style={{ fontSize: 11, color: "#10b981" }}>✦ Synthesizing...</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setIsLiveAI(!isLiveAI)} style={{ ...s.btnSecondary, fontSize: 11, padding: "4px 10px", background: isLiveAI ? "rgba(16,185,129,0.1)" : "#27272a", color: isLiveAI ? "#10b981" : "#a1a1aa" }}><Zap size={12} /> Live AI</button>
                      <button onClick={() => setIsHiggsfield(!isHiggsfield)} style={{ ...s.btnSecondary, fontSize: 11, padding: "4px 10px", background: isHiggsfield ? "rgba(249,115,22,0.1)" : "#27272a", color: isHiggsfield ? "#f97316" : "#a1a1aa" }}><Wind size={12} /> Higgsfield</button>
                      <button onClick={handleEnhance} disabled={isEnhancing || !currentPrompt} style={{ ...s.btnSecondary, fontSize: 11, padding: "4px 10px" }}>{isEnhancing ? <Loader2 size={12} /> : <Sparkles size={12} color="#10b981" />} Enhance</button>
                    </div>
                  </div>
                  <div style={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12, padding: 16, minHeight: 160, maxHeight: 300, overflow: "auto", fontSize: 14, color: "#d4d4d8", lineHeight: 1.6, fontFamily: "monospace", position: "relative" }}>
                    {currentPrompt.slice(0, 1000) || <span style={{ color: "#52525b", fontStyle: "italic" }}>Start building your prompt...</span>}
                    <button onClick={handleCopy} style={{ position: "absolute", bottom: 12, right: 12, ...s.btnSecondary, padding: "6px 10px" }}>{copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}</button>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                    <button onClick={handleCopy} style={{ ...s.btnSecondary, flex: 1, justifyContent: "center" }}><Copy size={16} /> Copy Text</button>
                    <button onClick={handleCopyJson} style={{ ...s.btnPrimary, flex: 1, justifyContent: "center" }}><FileJson size={16} /> Copy JSON</button>
                  </div>
                </section>

                <section style={{ ...s.panel, background: "rgba(24,24,27,0.5)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, color: "#71717a", marginBottom: 12 }}>Pro Tips</div>
                  {["Use 'Enhance' to add professional lighting and camera terms automatically.", "Specific lenses like '85mm' create shallow depth of field for portraits.", "Adding an art style like 'Studio Ghibli' drastically changes the aesthetic."].map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", marginTop: 5, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>{tip}</p>
                    </div>
                  ))}
                </section>
              </div>
            </div>
          </div>

        ) : (
          <div style={{ maxWidth: 896, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>AI <span style={{ color: "#10b981" }}>Image Editor</span></h2>
              <p style={{ color: "#71717a" }}>Upload an image and describe the changes you want to make.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <section style={s.panel}>
                  <div style={s.sectionTitle}>1. Upload Source Image</div>
                  <div ref={editorContainerRef} style={{ position: "relative", borderRadius: 16, border: "2px dashed #27272a", overflow: "hidden", minHeight: canvasSize.height || 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {refImage ? (
                      <>
                        <img src={refImage} alt="Source" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
                          <button onClick={() => setIsMarkingModalOpen(true)} style={{ ...s.btnSecondary, padding: "6px 10px" }}><Edit3 size={16} /></button>
                          {maskLines.length > 0 && <button onClick={() => setMaskLines([])} style={{ ...s.btnSecondary, padding: "6px 10px", color: "#f87171" }}><Trash2 size={16} /></button>}
                        </div>
                      </>
                    ) : (
                      <label style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Upload size={40} color="#10b981" />
                        <span style={{ color: "#d4d4d8", marginTop: 12 }}>Click to upload image</span>
                        <input type="file" style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </section>
                <section style={s.panel}>
                  <div style={s.sectionTitle}>2. Describe Changes</div>
                  <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="e.g., Change the background to a sunset beach..." style={{ ...s.textarea, minHeight: 120, marginBottom: 12 }} />
                  <button onClick={() => setIsMarkingModalOpen(true)} style={{ ...s.btnSecondary, width: "100%", justifyContent: "center", marginBottom: 12 }}>
                    <Edit3 size={16} /> {maskLines.length > 0 ? "Edit Markings" : "Mark Image for Precision Editing"}
                  </button>
                  <button onClick={handleEditImage} disabled={isEditing || !refImage || !editPrompt} style={{ ...s.btnPrimary, width: "100%", justifyContent: "center", padding: 16 }}>
                    {isEditing ? <><Loader2 size={20} /> Editing...</> : <><Edit3 size={20} /> Apply Changes</>}
                  </button>
                </section>
              </div>
              <section style={{ ...s.panel, display: "flex", flexDirection: "column" }}>
                <div style={s.sectionTitle}>Result</div>
                <div style={{ flex: 1, position: "relative", borderRadius: 12, border: "1px solid #27272a", background: "#09090b", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {editedImage ? (
                    <>
                      <img src={editedImage} alt="Result" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      <a href={editedImage} download="edited-image.png" style={{ position: "absolute", bottom: 16, right: 16, ...s.btnPrimary, textDecoration: "none" }}><Download size={16} /> Download</a>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#52525b" }}>
                      {isEditing ? <><Loader2 size={40} /><p style={{ marginTop: 12 }}>Processing...</p></> : <><ImageIcon size={40} /><p style={{ marginTop: 12, fontStyle: "italic" }}>Result will appear here</p></>}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <footer style={s.footer}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "#71717a" }}>© 2026 GET YOUR PROMPT. Powered by Gemini.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Documentation", "Privacy", "Terms"].map(t => <a key={t} href="#" style={{ fontSize: 12, color: "#71717a", textDecoration: "none" }}>{t}</a>)}
          </div>
        </div>
      </footer>

      {copied && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#059669", color: "#fff", padding: "12px 24px", borderRadius: 9999, display: "flex", alignItems: "center", gap: 8, zIndex: 100, fontSize: 14, fontWeight: 500 }}>
          <Check size={16} /> Prompt copied!
        </div>
      )}

      {isMarkingModalOpen && refImage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ width: "100%", maxWidth: 1152, height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Mark Areas to Edit</h2>
                <p style={{ fontSize: 12, color: "#71717a" }}>Draw over the parts you want the AI to change</p>
              </div>
              <button onClick={() => setIsMarkingModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}><X size={24} /></button>
            </div>
            <div style={{ flex: 1, display: "flex", gap: 32, minHeight: 0 }}>
              <div ref={modalCanvasRef} style={{ flex: 1, background: "#18181b", borderRadius: 24, border: "1px solid #27272a", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                {modalCanvasSize.width > 0 && <MaskCanvas imageUrl={refImage} width={modalCanvasSize.width} height={modalCanvasSize.height} lines={maskLines} setLines={setMaskLines} isDrawing={true} />}
              </div>
              <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 16 }}>
                <section style={s.panel}>
                  <div style={s.sectionTitle}>Prompt</div>
                  <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="Describe changes..." style={{ ...s.textarea, minHeight: 150 }} />
                </section>
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                  <button onClick={() => setMaskLines([])} style={{ ...s.btnSecondary, justifyContent: "center" }}><Trash2 size={16} /> Clear Markings</button>
                  <button onClick={() => setIsMarkingModalOpen(false)} style={{ ...s.btnPrimary, justifyContent: "center", padding: 16 }}><Check size={20} /> Apply & Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Framer Export ───────────────────────────────────────────────
App.defaultProps = {}
addPropertyControls(App, {})
