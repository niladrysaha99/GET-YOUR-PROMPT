import React, { useState } from "react"

import {
  Sparkles,
  Copy,
  RotateCcw,
  Loader2
} from "lucide-react"

import {
  PROMPT_CATEGORIES,
  CAMERAS,
  LENSES,
  ASPECT_RATIOS,
  CAMERA_ANGLES
} from "./constants"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = "gemini-1.5-flash"

async function callGemini(prompt: string) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  )

  const data = await res.json()

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
}

export default function App() {

  const [subject, setSubject] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [camera, setCamera] = useState("")
  const [lens, setLens] = useState("")
  const [angle, setAngle] = useState("")
  const [ratio, setRatio] = useState("")

  const [options, setOptions] = useState<Record<string,string>>({})

  const toggleOption = (cat:string, option:string) => {
    setOptions(prev=>{
      const next={...prev}
      if(next[cat]===option) delete next[cat]
      else next[cat]=option
      return next
    })
  }

  const generatePrompt = async () => {

    if (!subject) return

    setLoading(true)

    let finalPrompt = subject

    if (camera) finalPrompt += `, shot on ${camera}`
    if (lens) finalPrompt += `, using ${lens}`
    if (angle) finalPrompt += `, ${angle} shot`

    Object.values(options).forEach(o=>{
      finalPrompt += `, ${o}`
    })

    if (ratio) finalPrompt += ` --ar ${ratio}`

    try {

      const text = await callGemini(
        `Create a professional cinematic AI image generation prompt: ${finalPrompt}`
      )

      setPrompt(text)

    } catch (err) {

      console.error(err)

    }

    setLoading(false)
  }

  const copyPrompt = () => {

    navigator.clipboard.writeText(prompt)
    setCopied(true)

    setTimeout(()=>setCopied(false),2000)
  }

  const reset = () => {

    setSubject("")
    setPrompt("")
    setCamera("")
    setLens("")
    setAngle("")
    setRatio("")
    setOptions({})
  }

  return (

    <div style={{
      minHeight:"100vh",
      background:"#09090b",
      color:"#e4e4e7",
      fontFamily:"Inter, sans-serif",
      padding:40
    }}>

      <h1 style={{fontSize:32,fontWeight:700}}>
        GET YOUR <span style={{color:"#10b981"}}>PROMPT</span>
      </h1>

      <div style={{maxWidth:700}}>

        <textarea
          value={subject}
          onChange={(e)=>setSubject(e.target.value)}
          placeholder="Describe your image idea..."
          style={{
            width:"100%",
            padding:16,
            borderRadius:10,
            border:"1px solid #27272a",
            background:"#18181b",
            color:"#fff",
            minHeight:120
          }}
        />

        {/* CAMERA OPTIONS */}

        <div style={{marginTop:20}}>

          <select value={camera} onChange={e=>setCamera(e.target.value)}>
            <option value="">Camera</option>
            {CAMERAS.map(c=><option key={c}>{c}</option>)}
          </select>

          <select value={lens} onChange={e=>setLens(e.target.value)}>
            <option value="">Lens</option>
            {LENSES.map(l=><option key={l}>{l}</option>)}
          </select>

          <select value={angle} onChange={e=>setAngle(e.target.value)}>
            <option value="">Angle</option>
            {CAMERA_ANGLES.map(a=><option key={a}>{a}</option>)}
          </select>

        </div>

        {/* ASPECT RATIO */}

        <div style={{marginTop:20}}>
          {ASPECT_RATIOS.map(r=>(
            <button
              key={r}
              onClick={()=>setRatio(r)}
              style={{
                marginRight:8,
                padding:"4px 10px",
                borderRadius:20,
                border:"1px solid #444",
                background: ratio===r ? "#10b981":"transparent",
                color:"#fff",
                cursor:"pointer"
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* PROMPT CATEGORIES */}

        {PROMPT_CATEGORIES.map(cat=>(
          <div key={cat.id} style={{marginTop:20}}>

            <h3>{cat.name}</h3>

            {cat.options.map(option=>(
              <button
                key={option}
                onClick={()=>toggleOption(cat.id,option)}
                style={{
                  margin:5,
                  padding:"6px 12px",
                  borderRadius:20,
                  border:"1px solid #444",
                  background: options[cat.id]===option ? "#10b981":"#18181b",
                  color:"#fff",
                  cursor:"pointer"
                }}
              >
                {option}
              </button>
            ))}

          </div>
        ))}

        {/* BUTTONS */}

        <div style={{display:"flex",gap:12,marginTop:20}}>

          <button onClick={generatePrompt}
          style={{
            background:"#059669",
            border:"none",
            padding:"10px 20px",
            borderRadius:10,
            color:"#fff",
            cursor:"pointer",
            display:"flex",
            gap:8,
            alignItems:"center"
          }}>

            {loading ? <Loader2 size={16}/> : <Sparkles size={16}/>}
            Generate

          </button>

          <button onClick={reset}
          style={{
            background:"#27272a",
            border:"none",
            padding:"10px 20px",
            borderRadius:10,
            color:"#fff",
            cursor:"pointer",
            display:"flex",
            gap:8,
            alignItems:"center"
          }}>
            <RotateCcw size={16}/>
            Reset
          </button>

        </div>

        {/* OUTPUT */}

        {prompt && (
          <div style={{
            marginTop:24,
            padding:16,
            borderRadius:12,
            background:"#18181b",
            border:"1px solid #27272a",
            position:"relative"
          }}>

            <pre style={{whiteSpace:"pre-wrap"}}>{prompt}</pre>

            <button
            onClick={copyPrompt}
            style={{
              position:"absolute",
              top:10,
              right:10,
              background:"#27272a",
              border:"none",
              padding:6,
              borderRadius:6,
              cursor:"pointer"
            }}>
              <Copy size={16}/>
            </button>

            {copied && (
              <div style={{marginTop:10,color:"#10b981",fontSize:12}}>
                Prompt copied!
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  )
}
