// Supabase 설정
const SUPABASE_URL = 'https://vohneacdqfvxgyzqybcc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaG5lYWNkcWZ2eGd5enF5YmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjQxNjEsImV4cCI6MjA4NTI0MDE2MX0.NdffkspnhxDwIUOyus-_TdWesHWmRx28cFhShN-076s';

// Supabase 클라이언트 초기화 (전역 supabase 객체의 createClient 사용)
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
