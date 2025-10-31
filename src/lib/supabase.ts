import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  plan: 'Free' | 'Pro' | 'Studio';
  uploaded_this_month: number;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  original_filename: string;
  original_format: string;
  file_size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  glb_url: string | null;
  poster_url: string | null;
  triangle_count: number;
  vertex_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ViewerConfig = {
  id: string;
  project_id: string;
  user_id: string;
  config: {
    scene?: {
      background?: string;
      environmentImage?: string;
      shadowIntensity?: number;
      exposure?: number;
    };
    camera?: {
      initialYaw?: number;
      initialPitch?: number;
      initialZoom?: number;
      minZoom?: number;
      maxZoom?: number;
      autoRotate?: boolean;
      autoRotateSpeed?: number;
    };
    ar?: {
      quickLook?: boolean;
      sceneViewer?: boolean;
      webXR?: boolean;
      scale?: number;
      placement?: 'floor' | 'wall' | 'free';
    };
    theme?: {
      mode?: 'light' | 'dark';
      primaryColor?: string;
      showControls?: boolean;
      showLogo?: boolean;
    };
  };
  version: number;
  is_active: boolean;
  created_at: string;
};

export type Material = {
  id: string;
  user_id: string | null;
  name: string;
  type: 'library' | 'custom';
  base_color_url: string | null;
  normal_url: string | null;
  roughness_url: string | null;
  metallic_url: string | null;
  ao_url: string | null;
  parameters: {
    roughness?: number;
    metalness?: number;
    color?: string;
    tiling?: { u: number; v: number };
  };
  created_at: string;
};

export type Hotspot = {
  id: string;
  project_id: string;
  position: { x: number; y: number; z: number };
  title: string;
  description: string | null;
  icon_url: string | null;
  link_url: string | null;
  style: {
    color?: string;
    size?: number;
    animation?: string;
  };
  created_at: string;
};
