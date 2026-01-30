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

// 점수 저장
async function saveScore() {
    const playerName = playerNameInput.value.trim() || 'NoName';

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
        console.error('점수 저장 실패:', error);
        alert('점수 저장에 실패했습니다. 다시 시도해주세요.');
        saveScoreBtn.disabled = false;
        saveScoreBtn.textContent = '점수 저장';
    }
}

// 리더보드 로드
async function loadLeaderboard(difficulty) {
    leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading">로딩 중...</td></tr>';

    try {
        const { data, error } = await supabaseClient
            .from('game_scores')
            .select('*')
            .eq('difficulty', difficulty)
            .order('moves', { ascending: true })
            .order('time_seconds', { ascending: true })
            .limit(10);

        if (error) throw error;

        if (data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" class="empty">아직 기록이 없습니다.</td></tr>';
            return;
        }

        leaderboardBody.innerHTML = data.map((score, index) => `
            <tr>
                <td>${getRankEmoji(index + 1)}</td>
                <td>${escapeHtml(score.player_name)}</td>
                <td>${score.moves}회</td>
                <td>${formatTime(score.time_seconds)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('리더보드 로드 실패:', error);
        leaderboardBody.innerHTML = '<tr><td colspan="4" class="empty">로드 실패</td></tr>';
    }
}

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
