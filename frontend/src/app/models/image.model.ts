export interface Image {
  id?: string;
  file_path: string;
  original_filename?: string;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  ai_tags?: any;
  created_at?: string;
}

export interface ImageUploadResponse {
  id: string;
  file_path: string;
  ai_tags?: any;
} 