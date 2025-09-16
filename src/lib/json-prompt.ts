export interface JSONPrompt {
  prompt_text: string;
  subject: Subject;
  lighting: Lighting;
  composition: Composition;
  colour: Colour;
  colour_grade: ColourGrade;
  image_style: ImageStyle;
  effects: Effects;
  generation_parameters: GenerationParameters;
}

interface Subject {
  foreground: string;
  middleground: string;
  background: string;
}
interface Lighting {
  style: string;
  condition: string;
  lights: Lights;
  shadows: Shadows;
}
interface Lights {
  key: string;
  fill: string;
  back: string;
  background: string;
  spot: string;
}
interface Shadows {
  type: string;
  quality: string;
  style: string;
}
interface Composition {
  primary_subject: PrimarySubject;
  secondary_subject: SecondarySubject;
  foreground: Foreground;
  background: Background;
  negative_space: NegativeSpace;
}
interface PrimarySubject {
  shot_size: string;
  camera_angle: string;
  techniques: string;
  framing: string;
  balance: string;
}
interface SecondarySubject {
  techniques: string;
  balance: string;
}
interface Foreground {
  techniques: string;
}
interface Background {
  techniques: string;
  lens: string;
}
interface NegativeSpace {
  techniques: string;
}

interface Colour {
  palette_input: string;
  dominant_colours: string;
  accent_colours: string;
}
interface ColourGrade {
  style: string;
  contrast: string;
  saturation: string;
  temperature: string;
}
interface ImageStyle {
  genre: string;
  aesthetic: string;
  medium: string;
}
interface Effects {
  light_effects: string;
  post_effects: string;
}
interface GenerationParameters {
  resolution: string;
  aspect_ratio: string;
  sharpness: string;
  seed: string;
  guidance_scale: string;
  iterations: string;
}
