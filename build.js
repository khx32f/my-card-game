const fs = require('fs');
const path = require('path');

// 환경 변수에서 Supabase 설정 가져오기
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// config.js 내용 생성
const configContent = `// Supabase 설정 (빌드 시 자동 생성)
const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';

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
`;

// config.js 파일 생성
const configPath = path.join(__dirname, 'js', 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ config.js 생성 완료!');
console.log(`   SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);
