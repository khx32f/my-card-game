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
