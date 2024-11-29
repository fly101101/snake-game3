const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let snake = [
    { x: 10, y: 10 }
];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};
let dx = 0;
let dy = 0;
let gameSpeed = 100;
let lives = 3;
let isGameActive = true;

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    if (!isGameActive) return;

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function drawGame() {
    if (!isGameActive) {
        return;
    }

    moveSnake();

    if (gameOver()) {
        if (lives <= 0) {
            isGameActive = false;
            return;
        }
        return;
    }

    clearCanvas();
    checkFoodCollision();
    drawFood();
    drawSnake();

    setTimeout(drawGame, gameSpeed);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (!eatFood()) {
        snake.pop();
    }
}

function gameOver() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || collisionWithSelf()) {
        lives--;
        livesElement.textContent = '生命：' + lives;
        
        if (lives <= 0) {
            alert('游戏结束！最终得分：' + score);
            document.getElementById('game-over').style.display = 'block';
            
            document.getElementById('purchase-life-btn').addEventListener('click', purchaseLife);
            return true;
        } else {
            snake = [{ x: 10, y: 10 }];
            dx = 0;
            dy = 0;
            return false;
        }
    }
    return false;
}

function collisionWithSelf() {
    const head = snake[0];
    return snake.slice(1).some(segment => 
        segment.x === head.x && segment.y === head.y
    );
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function checkFoodCollision() {
    if (eatFood()) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        score += 10;
        scoreElement.textContent = '分数：' + score;
        gameSpeed = Math.max(50, gameSpeed - 2);
    }
}

function eatFood() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

function purchaseLife() {
    document.getElementById('payment-modal').style.display = 'block';
    updatePrice();
}

function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

function updatePrice() {
    const quantity = document.getElementById('life-quantity').value;
    const price = (quantity * 0.01).toFixed(2);
    document.getElementById('total-price').textContent = price;
}

function confirmPurchase() {
    const quantity = parseInt(document.getElementById('life-quantity').value);
    
    if (quantity < 1 || quantity > 100) {
        alert('请选择1-100之间的数量！');
        return;
    }
    
    const totalPrice = (quantity * 0.01).toFixed(2);
    
    if (confirm(`确认支付${totalPrice}元购买${quantity}条生命？`)) {
        lives += quantity;
        alert(`购买成功！已增加${quantity}条生命，当前剩余生命：${lives}`);
        document.getElementById('payment-modal').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        livesElement.textContent = '生命：' + lives;
        continueGame();
    }
}

function continueGame() {
    snake = [{ x: 10, y: 10 }];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 100;
    isGameActive = true;
    scoreElement.textContent = '分数：0';
    livesElement.textContent = '生命：' + lives;
    drawGame();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('life-quantity').addEventListener('input', updatePrice);
});

drawGame();

// 在游戏中发起支付
function startPayment(amount) {
    // 构建支付表单数据
    const data = {
        pid: '1033',  // 你的商户ID
        type: 'alipay',  // 支付方式
        out_trade_no: new Date().getTime() + Math.random().toString(36).substr(2, 6),
        name: '游戏充值',
        money: amount,
        notify_url: 'https://9401.cn/notify_url.php', // 使用易支付提供的默认回调地址
        return_url: 'https://fly101101.github.io/snake-game3/' // 你的游戏地址
    };
    
    // 生成支付链接
    const payUrl = 'https://9401.cn/submit.php?' + new URLSearchParams(data).toString();
    
    // 跳转到支付页面
    window.location.href = payUrl;
}

// 添加支付成功的处理函数
function handlePaymentSuccess() {
    // 检查URL参数是否包含支付成功的标识
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('trade_status') === 'TRADE_SUCCESS') {
        lives++; // 增加一条生命
        livesElement.textContent = '生命：' + lives;
        // 清除URL参数
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// 在页面加载时检查支付状态
window.onload = function() {
    handlePaymentSuccess();
}; 