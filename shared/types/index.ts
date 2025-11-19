// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'creator' | 'user';
  provider?: 'google' | 'kakao' | 'naver' | 'local';
  created_at: string;
}

// Room Types
export interface Room {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  creator_id?: string;
  creator_email?: string;
  edit_token?: string;
  play_modes: PlayMode[];
  play_time_min?: number;
  play_time_max?: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category?: string;
  target_grade?: string;
  credits?: Credits;
  donation_info?: DonationInfo;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type PlayMode = 'online' | 'onsite' | 'printout';

export interface Credits {
  story?: string;
  content?: string;
  design?: string;
  illustration?: string;
  developer?: string;
  music?: string;
  video?: string;
  supervisor?: string[];
}

export interface DonationInfo {
  enabled: boolean;
  methods: DonationMethod[];
  message?: string;
}

export interface DonationMethod {
  type: 'toss' | 'kakaopay' | 'bank';
  account?: string;
  qr_code?: string;
}

// Question Types
export type QuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'image_puzzle'
  | 'drag_drop'
  | 'sequence'
  | 'hotspot'
  | 'password'
  | 'story_choice'
  | 'mini_game';

export interface Question {
  id: string;
  room_id: string;
  type: QuestionType;
  order_index: number;
  title: string;
  description?: string;
  content: QuestionContent;
  answer: any;
  similarity_threshold?: number;
  youtube_id?: string;
  character_svg_url?: string;
  hint?: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionContent {
  // Varies by question type
  [key: string]: any;
}

// Game Session Types
export interface GameSession {
  id: string;
  room_id: string;
  user_id?: string;
  guest_token?: string;
  play_mode: PlayMode;
  started_at: string;
  completed_at?: string;
  total_score: number;
  total_time_seconds?: number;
}

export interface GameProgress {
  id: string;
  session_id: string;
  question_id: string;
  user_answer: any;
  is_correct: boolean;
  similarity_score?: number;
  attempts: number;
  time_spent_seconds?: number;
  answered_at: string;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  condition_type: 'complete_room' | 'perfect_score' | 'speed_run' | 'custom';
  condition_value?: any;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

// Team Member Types
export type TeamRole =
  | 'admin'
  | 'creator'
  | 'story'
  | 'design'
  | 'code'
  | 'advisor'
  | 'music'
  | 'video'
  | 'guest';

export interface TeamMember {
  id: string;
  room_id: string;
  user_id?: string;
  guest_token?: string;
  role: TeamRole;
  permissions: Permission[];
  added_at: string;
}

export type Permission =
  | 'view'
  | 'edit_content'
  | 'edit_questions'
  | 'upload_media'
  | 'manage_team'
  | 'publish';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

