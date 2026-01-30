// ============================================
// 보안 유틸리티 함수
// ============================================

// Debounce 함수 (Rate Limiting)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 플레이어 이름 검증
function validatePlayerName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: '이름을 입력해주세요.' };
    }

    const trimmed = name.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, error: '이름을 입력해주세요.' };
    }
    
    if (trimmed.length > 20) {
        return { valid: false, error: '이름은 20자 이내로 입력해주세요.' };
    }

    // 허용 문자: 한글, 영문, 숫자, 공백, 일부 특수문자(_-)
    const allowedPattern = /^[가-힣a-zA-Z0-9\s_-]+$/;
    if (!allowedPattern.test(trimmed)) {
        return { valid: false, error: '이름에 허용되지 않는 문자가 포함되어 있습니다.' };
    }

    // 금지 패턴 (SQL 인젝션, 스크립트 등)
    const dangerousPatterns = [
        /[<>]/,
        /javascript:/i,
        /on\w+=/i,
        /['";]/
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(trimmed)) {
            return { valid: false, error: '이름에 허용되지 않는 문자가 포함되어 있습니다.' };
        }
    }

    return { valid: true, sanitized: trimmed };
}

// 게임 점수 검증
function validateGameScore(moves, time, difficulty) {
    // moves 검증: 양수, 최소 난이도별 쌍 수 이상
    const minMoves = DIFFICULTY_PAIRS[difficulty] || 4;
    if (!Number.isInteger(moves) || moves < minMoves || moves > 9999) {
        return { valid: false, error: '유효하지 않은 게임 데이터입니다.' };
    }

    // time 검증: 양수, 합리적인 범위 (1초 ~ 1시간)
    if (!Number.isInteger(time) || time < 1 || time > 3600) {
        return { valid: false, error: '유효하지 않은 게임 데이터입니다.' };
    }

    // difficulty 검증
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return { valid: false, error: '유효하지 않은 난이도입니다.' };
    }

    return { valid: true };
}

// ============================================
// 게임 상태
// ============================================

// 게임 상태
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    isLocked: false,
    difficulty: 'easy',
    totalPairs: 4,
    gameStarted: false
};

// DOM 요소
const cardGrid = document.getElementById('cardGrid');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restartBtn');
const completeModal = document.getElementById('completeModal');
const resultMoves = document.getElementById('resultMoves');
const resultTime = document.getElementById('resultTime');
const playerNameInput = document.getElementById('playerName');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const leaderboardBody = document.getElementById('leaderboardBody');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const tabBtns = document.querySelectorAll('.tab-btn');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    loadLeaderboard('easy');
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    restartBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', () => {
        hideModal();
        initGame();
    });
    saveScoreBtn.addEventListener('click', saveScore);
    
    // 난이도 선택
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
            initGame();
        });
    });

    // 리더보드 탭
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadLeaderboard(btn.dataset.tab);
        });
    });

    // 엔터 키로 점수 저장
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveScore();
        }
    });
}

// 게임 초기화
function initGame() {
    // 타이머 초기화
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // 상태 초기화
    gameState.totalPairs = DIFFICULTY_PAIRS[gameState.difficulty];
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.timerInterval = null;
    gameState.isLocked = false;
    gameState.gameStarted = false;

    // 표시 업데이트
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '00:00';

    // 카드 생성
    createCards();
}

// 카드 생성
function createCards() {
    // 난이도에 맞는 이모지 선택
    const selectedEmojis = CARD_EMOJIS.slice(0, gameState.totalPairs);
    
    // 쌍으로 만들기
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    // 셔플
    gameState.cards = shuffle(cardPairs);

    // 그리드 렌더링
    renderCards();
}

// 셔플 알고리즘 (Fisher-Yates)
function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 카드 렌더링
function renderCards() {
    cardGrid.innerHTML = '';
    cardGrid.className = `card-grid ${gameState.difficulty}`;

    gameState.cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${emoji}</div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        cardGrid.appendChild(card);
    });
}

// 카드 뒤집기
function flipCard(card) {
    // 클릭 무시 조건
    if (gameState.isLocked) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (gameState.flippedCards.length >= 2) return;

    // 첫 클릭 시 타이머 시작
    if (!gameState.gameStarted) {
        gameState.gameStarted = true;
        startTimer();
    }

    // 카드 뒤집기
    card.classList.add('flipped');
    gameState.flippedCards.push(card);

    // 두 장 뒤집었을 때 확인
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        movesDisplay.textContent = gameState.moves;
        checkMatch();
    }
}

// 매칭 확인
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;

    if (isMatch) {
        // 매칭 성공
        card1.classList.add('matched');
        card2.classList.add('matched');
        gameState.matchedPairs++;
        gameState.flippedCards = [];

        // 게임 완료 확인
        if (gameState.matchedPairs === gameState.totalPairs) {
            setTimeout(gameComplete, 500);
        }
    } else {
        // 매칭 실패
        gameState.isLocked = true;
        card1.classList.add('wrong');
        card2.classList.add('wrong');

        setTimeout(() => {
            card1.classList.remove('flipped', 'wrong');
            card2.classList.remove('flipped', 'wrong');
            gameState.flippedCards = [];
            gameState.isLocked = false;
        }, 1000);
    }
}

// 타이머 시작
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        timerDisplay.textContent = formatTime(gameState.timer);
    }, 1000);
}

// 시간 포맷
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// 게임 완료
function gameComplete() {
    clearInterval(gameState.timerInterval);
    resultMoves.textContent = gameState.moves;
    resultTime.textContent = formatTime(gameState.timer);
    playerNameInput.value = '';
    saveScoreBtn.disabled = false;
    showModal();
}

// 모달 표시
function showModal() {
    completeModal.classList.add('show');
}

// 모달 숨기기
function hideModal() {
    completeModal.classList.remove('show');
}

// 점수 저장 (Rate Limiting 적용)
let isSaving = false;

async function saveScore() {
    // 중복 저장 방지
    if (isSaving) {
        return;
    }

    // 게임 완료 상태 확인
    if (gameState.matchedPairs !== gameState.totalPairs) {
        alert('게임을 먼저 완료해주세요.');
        return;
    }

    // 플레이어 이름 검증
    const nameValidation = validatePlayerName(playerNameInput.value || 'NoName');
    if (!nameValidation.valid) {
        alert(nameValidation.error);
        return;
    }
    const playerName = nameValidation.sanitized;

    // 게임 점수 검증
    const scoreValidation = validateGameScore(
        gameState.moves,
        gameState.timer,
        gameState.difficulty
    );
    if (!scoreValidation.valid) {
        alert(scoreValidation.error);
        return;
    }

    isSaving = true;
    saveScoreBtn.disabled = true;
    saveScoreBtn.textContent = '저장 중...';

    try {
        const { error } = await supabaseClient
            .from('game_scores')
            .insert({
                player_name: playerName,
                moves: gameState.moves,
                time_seconds: gameState.timer,
                difficulty: gameState.difficulty
            });

        if (error) throw error;

        saveScoreBtn.textContent = '저장 완료!';
        
        // 리더보드 새로고침
        loadLeaderboard(gameState.difficulty);
        
        // 리더보드 탭 활성화
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === gameState.difficulty);
        });

    } catch (error) {
        // 프로덕션에서는 상세 에러 숨김
        if (process?.env?.NODE_ENV === 'development') {
            console.error('점수 저장 실패:', error);
        }
        alert('점수 저장에 실패했습니다. 다시 시도해주세요.');
        saveScoreBtn.disabled = false;
        saveScoreBtn.textContent = '점수 저장';
    } finally {
        // 3초 후 저장 가능
        setTimeout(() => {
            isSaving = false;
        }, 3000);
    }
}

// 리더보드 로드 (실제 구현)
async function loadLeaderboardImpl(difficulty) {
    // 난이도 검증
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        leaderboardBody.innerHTML = '<tr><td colspan="4" class="empty">잘못된 난이도</td></tr>';
        return;
    }

    leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading">로딩 중...</td></tr>';

    try {
        const { data, error } = await supabaseClient
            .from('game_scores')
            .select('player_name, moves, time_seconds')  // 필요한 컬럼만 선택
            .eq('difficulty', difficulty)
            .order('moves', { ascending: true })
            .order('time_seconds', { ascending: true })
            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" class="empty">아직 기록이 없습니다.</td></tr>';
            return;
        }

        leaderboardBody.innerHTML = data.map((score, index) => `
            <tr>
                <td>${getRankEmoji(index + 1)}</td>
                <td>${escapeHtml(score.player_name || 'Unknown')}</td>
                <td>${Number.isInteger(score.moves) ? score.moves : 0}회</td>
                <td>${formatTime(Number.isInteger(score.time_seconds) ? score.time_seconds : 0)}</td>
            </tr>
        `).join('');

    } catch (error) {
        // 프로덕션에서는 상세 에러 숨김
        if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
            console.error('리더보드 로드 실패:', error);
        }
        leaderboardBody.innerHTML = '<tr><td colspan="4" class="empty">로드 실패</td></tr>';
    }
}

// 리더보드 로드 (Debounce 적용 - 1초)
const loadLeaderboard = debounce(loadLeaderboardImpl, 1000);

// 순위 이모지
function getRankEmoji(rank) {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return rank;
    }
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
