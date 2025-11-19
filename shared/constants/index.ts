// Question Types
export const QUESTION_TYPES = [
  'multiple_choice',
  'short_answer',
  'image_puzzle',
  'drag_drop',
  'sequence',
  'hotspot',
  'password',
  'story_choice',
  'mini_game',
] as const;

// Play Modes
export const PLAY_MODES = ['online', 'onsite', 'printout'] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;

// Team Roles
export const TEAM_ROLES = [
  'admin',
  'creator',
  'story',
  'design',
  'code',
  'advisor',
  'music',
  'video',
  'guest',
] as const;

// Permissions
export const PERMISSIONS = [
  'view',
  'edit_content',
  'edit_questions',
  'upload_media',
  'manage_team',
  'publish',
] as const;

// Default Similarity Threshold
export const DEFAULT_SIMILARITY_THRESHOLD = 0.6;

// Max File Sizes
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Supported Image Formats
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

// OAuth Providers
export const OAUTH_PROVIDERS = ['google', 'kakao', 'naver'] as const;

// Badge Condition Types
export const BADGE_CONDITION_TYPES = [
  'complete_room',
  'perfect_score',
  'speed_run',
  'custom',
] as const;

// Donation Methods
export const DONATION_METHODS = ['toss', 'kakaopay', 'bank'] as const;

// Categories
export const CATEGORIES = [
  '역사',
  '과학',
  '수학',
  '문학',
  '사회',
  '예술',
  '기타',
] as const;

// Target Grades
export const TARGET_GRADES = [
  '초등 1-2학년',
  '초등 3-4학년',
  '초등 5-6학년',
  '중학생',
  '고등학생',
  '일반',
] as const;

