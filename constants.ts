export interface PromptCategory {
  id: string;
  name: string;
  options: string[];
  type: 'select' | 'chips';
}
export const CAMERAS = [
  'ARRI ALEXA 35', 'ARRI ALEXA Mini LF', 'RED V-RAPTOR 8K', 'Sony VENICE 2',
  'Blackmagic URSA Mini Pro', 'Canon EOS C700', 'Panavision Millennium DXL2',
  'GoPro Hero 12', 'iPhone 15 Pro Max', 'Vintage Super 8', 'Hasselblad H6D'
];
export const LENSES = [
  'Zeiss Master Prime', 'Cooke S4/i', 'Arri Signature Prime', 'Angenieux Optimo',
  'Leica Summilux-C', 'Canon K35', 'Sigma Cine Prime', 'Laowa Probe Lens',
  '85mm f/1.2', '35mm f/1.4', '50mm f/1.8', '24mm Wide Angle', '100mm Macro'
];
export const ASPECT_RATIOS = [
  '1:1', '4:5', '2:3', '3:2', '16:9', '9:16', '21:9'
];
export const CAMERA_ANGLES = [
  'Eye Level', 'Low Angle', 'High Angle', "Bird's Eye View", "Worm's Eye View",
  'Dutch Angle', 'Over the Shoulder', 'Point of View (POV)', 'Close-up', 'Wide Shot',
  'Extreme Close-up', 'Extreme Wide Shot', 'Macro'
];
export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'medium',
    name: 'Medium',
    options: [
      'Digital Art', 'Oil Painting', 'Cinematic Film Still', '3D Render',
      'Photography', 'Watercolor', 'Pencil Sketch', 'Vector Art', 'Cyberpunk'
    ],
    type: 'chips'
  },
  {
    id: 'lighting',
    name: 'Lighting',
    options: [
      'Golden Hour', 'Cinematic Lighting', 'Volumetric Fog', 'Neon Glow',
      'Soft Studio Light', 'Dramatic Shadows', 'Bioluminescent', 'Natural Sunlight',
      'Rembrandt Lighting', 'High Key', 'Low Key', 'Cyberpunk Neon'
    ],
    type: 'select'
  },
  {
    id: 'mood',
    name: 'Mood',
    options: [
      'Ethereal', 'Melancholic', 'Epic', 'Whimsical', 'Dark & Gritty',
      'Serene', 'Nostalgic', 'Vibrant', 'Mysterious', 'Hopeful', 'Aggressive'
    ],
    type: 'select'
  },
  {
    id: 'artist',
    name: 'Art Style',
    options: [
      'Studio Ghibli', 'Salvador Dali', 'Wes Anderson', 'Greg Rutkowski',
      'Cyberpunk 2077', 'ArtStation Trending', 'Unreal Engine 5', 'National Geographic',
      'Van Gogh', 'Pixar Style', 'Anime'
    ],
    type: 'select'
  },
  {
    id: 'position',
    name: 'Position & Pose',
    options: [
      'Standing', 'Sitting', 'Lying Down', 'Kneeling', 'Crouching',
      'Leaning', 'Floating', 'Running', 'Walking', 'Jumping',
      'Dancing', 'Action Pose', 'Yoga Pose', 'Meditating'
    ],
    type: 'select'
  },
  {
    id: 'gaze',
    name: 'Gaze Direction',
    options: [
      'Looking at Camera', 'Looking Away', 'Looking Up', 'Looking Down',
      'Looking Sideways', 'Closed Eyes', 'Intense Stare', 'Dreamy Look',
      'Profile View', 'Back to Camera'
    ],
    type: 'select'
  },
  {
    id: 'activity',
    name: 'Activity',
    options: [
      'Reading a Book', 'Holding a Sword', 'Using a Phone', 'Drinking Coffee',
      'Crying', 'Laughing', 'Fighting', 'Thinking', 'Singing', 'Painting',
      'Exploring', 'Sleeping', 'Working on Laptop', 'Playing Instrument'
    ],
    type: 'select'
  },
  {
    id: 'expression',
    name: 'Facial Expression',
    options: [
      'Neutral', 'Happy', 'Sad', 'Angry', 'Surprised', 'Fearful',
      'Disgusted', 'Contemptuous', 'Smirking', 'Laughing', 'Crying',
      'Determined', 'Pensive', 'Dreamy', 'Seductive', 'Confused'
    ],
    type: 'select'
  }
];
