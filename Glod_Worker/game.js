class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.timeLeft = 60;
        this.hook = {
            x: this.canvas.width / 2,
            y: 100,
            angle: 0,
            length: 100,
            state: 'swing', // swing, extending, retracting
            speed: 0.5,
            direction: 1,
            caught: null
        };
        this.items = [];
        this.init();
    }

    init() {
        // 生成随机物品
        this.generateItems();
        // 添加事件监听
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.hook.state === 'swing') {
                this.hook.state = 'extending';
            }
        });
        // 开始游戏循环
        this.gameLoop();
        // 开始计时
        this.startTimer();
    }

    generateItems() {
        const items = [
            { type: 'gold', value: 500, radius: 20, color: '#FFD700' },
            { type: 'silver', value: 300, radius: 15, color: '#C0C0C0' },
            { type: 'stone', value: 100, radius: 25, color: '#808080' }
        ];

        for (let i = 0; i < 8; i++) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            this.items.push({
                ...randomItem,
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 200) + 200
            });
        }
    }

    startTimer() {
        const timerElement = document.getElementById('time');
        const timer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                clearInterval(timer);
                alert(`游戏结束！最终得分：${this.score}`);
                location.reload();
            }
        }, 1000);
    }

    updateHook() {
        if (this.hook.state === 'swing') {
            this.hook.angle += this.hook.speed * this.hook.direction;
            if (this.hook.angle >= 75 || this.hook.angle <= -75) {
                this.hook.direction *= -1;
            }
        } else if (this.hook.state === 'extending') {
            this.hook.length += 5;
            // 检查碰撞
            this.checkCollision();
            // 检查是否到达边界
            if (this.hook.length > 700) {
                this.hook.state = 'retracting';
            }
        } else if (this.hook.state === 'retracting') {
            this.hook.length -= 3;
            if (this.hook.length <= 100) {
                this.hook.state = 'swing';
                this.hook.length = 100;
                if (this.hook.caught) {
                    this.score += this.hook.caught.value;
                    document.getElementById('score').textContent = this.score;
                    this.items = this.items.filter(item => item !== this.hook.caught);
                    this.hook.caught = null;
                }
            }
        }
    }

    checkCollision() {
        if (this.hook.caught) return;

        const hookEndX = this.hook.x + Math.sin(this.hook.angle * Math.PI / 180) * this.hook.length;
        const hookEndY = this.hook.y + Math.cos(this.hook.angle * Math.PI / 180) * this.hook.length;

        for (const item of this.items) {
            const distance = Math.sqrt(
                Math.pow(hookEndX - item.x, 2) + 
                Math.pow(hookEndY - item.y, 2)
            );

            if (distance < item.radius) {
                this.hook.caught = item;
                this.hook.state = 'retracting';
                break;
            }
        }
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制矿工
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.hook.x - 20, 50, 40, 50);

        // 绘制钩子线
        this.ctx.beginPath();
        this.ctx.moveTo(this.hook.x, this.hook.y);
        const endX = this.hook.x + Math.sin(this.hook.angle * Math.PI / 180) * this.hook.length;
        const endY = this.hook.y + Math.cos(this.hook.angle * Math.PI / 180) * this.hook.length;
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 绘制钩子
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();

        // 绘制物品
        for (const item of this.items) {
            this.ctx.beginPath();
            this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = item.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // 如果钩子抓住了物品，更新物品位置
        if (this.hook.caught) {
            this.hook.caught.x = endX;
            this.hook.caught.y = endY;
        }
    }

    gameLoop() {
        this.updateHook();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 启动游戏
window.onload = () => {
    new Game();
};