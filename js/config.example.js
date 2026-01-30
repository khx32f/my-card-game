// ============================================
// ⚠️ 보안 경고 (SECURITY WARNING)
// ============================================
// 이 파일의 API 키는 클라이언트 브라우저에 노출됩니다.
// Supabase anon key는 공개되어도 안전하도록 설계되었으나,
// 반드시 다음 보안 조치를 적용해야 합니다:
//
// 1. Supabase 대시보드에서 Row Level Security (RLS) 활성화
// 2. game_scores 테이블 RLS 정책 설정:
//    - INSERT: 모두 허용 (authenticated 또는 anon)
//    - SELECT: 모두 허용
//    - UPDATE/DELETE: 차단 (또는 본인만 허용)
// 3. 테이블 컬럼 제약조건:
//    - player_name: VARCHAR(20), NOT NULL
//    - moves: INTEGER, CHECK (moves > 0)
//    - time_seconds: INTEGER, CHECK (time_seconds > 0)
// ============================================

// Supabase 설정 (예시 파일)
// 실제 키는 환경 변수로 관리됩니다.
// 로컬 개발 시 이 파일을 config.js로 복사하고 실제 값을 입력하세요.

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Supabase 클라이언트 초기화
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 카드 이모지 목록 (12쌍 = 24장)
const CARD_EMOJIS = [
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍒',
    '🌸', '🌺', '🌻', '🌹', '🍀', '⭐'
];

// 난이도별 카드 쌍 수
const DIFFICULTY_PAIRS = {
    easy: 4,
    medium: 8,
    hard: 12
};
