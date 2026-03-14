export const CAMERAS = [
  "Canon EOS R5",
  "Canon EOS 5D Mark IV",
  "Sony A7R IV",
  "Sony A7S III",
  "Nikon Z9",
  "Nikon D850",
  "Fujifilm X-T5",
  "Leica Q2",
  "Hasselblad X2D",
]

export const LENSES = [
  "24mm wide angle",
  "35mm cinematic lens",
  "50mm prime lens",
  "85mm portrait lens",
  "105mm macro lens",
  "200mm telephoto lens",
  "anamorphic cinema lens",
]

export const ASPECT_RATIOS = [
  "1:1",
  "3:2",
  "4:3",
  "16:9",
  "21:9",
  "9:16"
]

export const CAMERA_ANGLES = [
  "low angle",
  "high angle",
  "eye level",
  "bird's eye view",
  "worm's eye view",
  "over the shoulder",
  "close up",
  "wide shot",
  "extreme close up",
]

export const PROMPT_CATEGORIES = [
  {
    id: "lighting",
    name: "Lighting",
    type: "chips",
    options: [
      "soft studio lighting",
      "golden hour lighting",
      "cinematic lighting",
      "neon lighting",
      "dramatic shadows",
      "rim lighting",
      "volumetric lighting",
      "backlit glow",
      "sunset lighting"
    ]
  },

  {
    id: "mood",
    name: "Mood",
    type: "chips",
    options: [
      "dark mysterious",
      "epic cinematic",
      "dreamy fantasy",
      "vibrant energetic",
      "melancholic",
      "romantic atmosphere",
      "peaceful calm",
      "futuristic sci-fi"
    ]
  },

  {
    id: "environment",
    name: "Environment",
    type: "chips",
    options: [
      "cyberpunk city",
      "fantasy forest",
      "space station",
      "ancient temple",
      "post-apocalyptic ruins",
      "snowy mountains",
      "tropical beach",
      "neon metropolis",
      "medieval village"
    ]
  },

  {
    id: "style",
    name: "Art Style",
    type: "chips",
    options: [
      "photorealistic",
      "hyperrealistic",
      "studio ghibli style",
      "anime style",
      "concept art",
      "oil painting",
      "watercolor painting",
      "3D render",
      "digital illustration"
    ]
  },

  {
    id: "activity",
    name: "Action",
    type: "chips",
    options: [
      "standing heroically",
      "running through rain",
      "flying through sky",
      "walking in city",
      "meditating peacefully",
      "battling enemies",
      "exploring ruins"
    ]
  },

  {
    id: "expression",
    name: "Expression",
    type: "chips",
    options: [
      "smiling",
      "serious",
      "determined",
      "angry",
      "sad",
      "curious",
      "surprised"
    ]
  }
]
