import React, { useState } from "react"

import {
  Sparkles,
  Copy,
  RotateCcw,
  Loader2
} from "lucide-react"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = "gemini-1.5-flash"

async function callGemini(prompt: string) {
  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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

  const generatePrompt = async () => {
    if (!subject) return

    setLoading(true)

    try {
      const text = await callGemini(
        `Create a professional AI image generation prompt for: ${subject}`
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

    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setSubject("")
    setPrompt("")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#e4e4e7",
        fontFamily: "Inter, sans-serif",
        padding: 40
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 20
        }}
      >
        GET YOUR <span style={{ color: "#10b981" }}>PROMPT</span>
      </h1>

      <div style={{ maxWidth: 600 }}>
        <textarea
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Describe your image idea..."
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 10,
            border: "1px solid #27272a",
            background: "#18181b",
            color: "#fff",
            minHeight: 120
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 12
          }}
        >
          <button
            onClick={generatePrompt}
            style={{
              background: "#059669",
              border: "none",
              padding: "10px 20px",
              borderRadius: 10,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}
          >
            {loading ? <Loader2 size={16} /> : <Sparkles size={16} />}
            Generate
          </button>

          <button
            onClick={reset}
            style={{
              background: "#27272a",
              border: "none",
              padding: "10px 20px",
              borderRadius: 10,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {prompt && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 12,
              background: "#18181b",
              border: "1px solid #27272a",
              position: "relative"
            }}
          >
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 14,
                lineHeight: 1.5
              }}
            >
              {prompt}
            </pre>

            <button
              onClick={copyPrompt}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#27272a",
                border: "none",
                padding: 6,
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              <Copy size={16} />
            </button>

            {copied && (
              <div
                style={{
                  marginTop: 10,
                  color: "#10b981",
                  fontSize: 12
                }}
              >
                Prompt copied!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
