// ===== 烟花效果 - 2026 新年主题 =====

// Canvas 设置
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// 窗口大小调整
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// ===== 全局变量 =====
const particles = [];
const fireworks = [];
let autoMode = true; // 默认开启自动模式
let textOpacity = 0; // 文字透明度
let textScale = 0.5; // 文字缩放
let animationStartTime = Date.now() + 1000; // 延迟1秒开始文字动画
let customText = '2026'; // 默认文字

// 按钮点击事件处理
document.getElementById('startButton').addEventListener('click', () => {
    const input = document.getElementById('customTextInput').value.trim();
    if (input) {
        customText = input;
    }
    // 隐藏输入框弹窗
    document.getElementById('inputModal').style.display = 'none';
});

// 颜色方案（更绚烂的配色）
const colors = {
    warm: ['#FF6B6B', '#FFA500', '#FFD700', '#FF4500', '#FF69B4', '#FF1493', '#FFB347'], // 红、橙、黄、粉
    cool: ['#00CED1', '#32CD32', '#1E90FF', '#00FF7F', '#FF00FF', '#00BFFF'], // 蓝、绿、紫
    sparkle: ['#FFFFFF', '#FFFACD', '#FFD700', '#FF69B4'] // 闪烁色（白、柠檬、金、粉）
};

// ===== 粒子类 =====
class Particle {
    constructor(x, y, color, velocity, life = 1) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.life = life;
        this.maxLife = life;
        this.gravity = 0.08; // 增加重力，让粒子下落更快
        this.friction = 0.995; // 减小阻力，让粒子保持更长时间
        this.size = Math.random() * 2 + 1.5;
        this.trail = [];
        this.trailLength = 5;
    }

    update() {
        // 保存轨迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // 物理模拟
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        // 生命衰减（减慢衰减速度，让粒子存活更久）
        this.life -= 0.008;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;

        // 绘制轨迹（简化版）
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size * 0.5;
            ctx.globalAlpha = alpha * 0.3;
            ctx.stroke();
        }

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// ===== 烟花类 =====
class Firework {
    constructor(x, targetY, type = 'sphere') {
        this.x = x;
        this.y = height;
        this.targetY = targetY;
        this.type = type; // sphere, star, column
        this.speed = 18; // 增加速度，确保能到达顶部100px
        this.angle = -Math.PI / 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.exploded = false;
        this.color = this.pickColor();
        this.trail = [];
    }

    pickColor() {
        // 70% 暖色，20% 冷色，10% 闪烁色
        const rand = Math.random();
        let palette;
        if (rand < 0.7) {
            palette = colors.warm;
        } else if (rand < 0.9) {
            palette = colors.cool;
        } else {
            palette = colors.sparkle;
        }
        return palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
        // 保存轨迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;

        // 减速上升
        this.vy += 0.1;

        // 到达目标高度爆炸（只检查位置）
        if (!this.exploded && this.y <= this.targetY) {
            this.explode();
        }
    }

    draw(ctx) {
        // 绘制上升轨迹（更明显）
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.lineTo(this.x, this.y);

            // 使用更亮、更粗的轨迹
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4; // 增加轨迹粗细
            ctx.globalAlpha = 0.8; // 增加不透明度
            ctx.stroke();

            // 添加发光效果
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 8;
            ctx.globalAlpha = 0.3;
            ctx.stroke();

            ctx.globalAlpha = 1;
        }

        // 绘制火箭头（更大、更亮）
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2); // 增加火箭头大小
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color; // 添加发光
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // 重置shadow
    }

    explode() {
        this.exploded = true;
        const particleCount = 100; // 减少粒子数量

        // 判断是否在上方区域爆炸（需要粒子向下扩散覆盖屏幕）
        const isTopArea = this.targetY < height * 0.45;
        const speedMultiplier = isTopArea ? 1.5 : 1; // 上方区域的烟花速度提升1.5倍

        switch (this.type) {
            case 'sphere':
                this.createSphereExplosion(particleCount, speedMultiplier);
                break;
            case 'star':
                this.createStarExplosion(particleCount, speedMultiplier);
                break;
            case 'column':
                this.createColumnExplosion(particleCount, speedMultiplier);
                break;
            case 'heart':
                this.createHeartExplosion(particleCount, speedMultiplier);
                break;
            case 'spiral':
                this.createSpiralExplosion(particleCount, speedMultiplier);
                break;
        }
    }

    createSphereExplosion(count, speedMultiplier = 1) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = (Math.random() * 6 + 3) * speedMultiplier; // 增加初始速度
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            particles.push(new Particle(this.x, this.y, this.color, velocity, 1.2)); // 增加生命值
        }
    }

    createStarExplosion(count, speedMultiplier = 1) {
        const points = 5;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const isPoint = i % (count / points) < 2;
            const speed = (isPoint ? Math.random() * 7 + 4 : Math.random() * 4 + 2) * speedMultiplier; // 增加初始速度
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            const color = isPoint ? colors.sparkle[Math.floor(Math.random() * colors.sparkle.length)] : this.color;
            particles.push(new Particle(this.x, this.y, color, velocity, 1.2)); // 增加生命值
        }
    }

    createColumnExplosion(count, speedMultiplier = 1) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spread = Math.random() * 0.5;
            const speed = (Math.random() * 6 + 3) * speedMultiplier; // 增加初始速度
            const velocity = {
                x: Math.cos(angle) * speed * spread,
                y: -Math.abs(Math.random() * 8 + 4) * speedMultiplier // 增加向上速度
            };
            particles.push(new Particle(this.x, this.y, this.color, velocity, 1.2)); // 增加生命值
        }
    }

    createHeartExplosion(count, speedMultiplier = 1) {
        // 心形参数方程
        for (let i = 0; i < count; i++) {
            const t = (Math.PI * 2 / count) * i;
            const scale = 0.15 * speedMultiplier; // 增加扩散范围
            const heartX = 16 * Math.pow(Math.sin(t), 3);
            const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

            const velocity = {
                x: heartX * scale * (Math.random() * 0.3 + 0.7),
                y: heartY * scale * (Math.random() * 0.3 + 0.7)
            };
            const color = Math.random() < 0.5 ? '#FF1493' : '#FF69B4';
            particles.push(new Particle(this.x, this.y, color, velocity, 1.3)); // 增加生命值
        }
    }

    createSpiralExplosion(count, speedMultiplier = 1) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 6 / count) * i;
            const radius = (i / count) * 7 * speedMultiplier; // 增加扩散范围
            const velocity = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            };
            const hue = (i / count) * 360;
            const color = `hsl(${hue}, 100%, 60%)`;
            particles.push(new Particle(this.x, this.y, color, velocity, 1.2)); // 增加生命值
        }
    }

    isDead() {
        return this.exploded;
    }
}

// ===== 自定义文字渲染 =====
function draw2026Text() {
    ctx.save();

    // 更新文字动画状态
    const elapsed = Math.max(0, Date.now() - animationStartTime); // 确保不会出现负数
    const animationDuration = 1500; // 1.5秒完成动画（1-2.5秒）

    // 平滑缓动函数（easeOutCubic）
    const progress = Math.min(elapsed / animationDuration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    textOpacity = easedProgress;
    textScale = 0.2 + easedProgress * 0.8; // 从 0.2 缩放到 1.0，更明显的"从小到大"效果

    // 移动到中心并缩放
    ctx.translate(width / 2, height / 2);

    // 2.5秒后添加抖动效果
    if (elapsed > 2500) {
        const shakeIntensity = 3; // 抖动强度
        const offsetX = (Math.random() - 0.5) * shakeIntensity;
        const offsetY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(offsetX, offsetY);
    }

    ctx.scale(textScale, textScale);
    ctx.translate(-width / 2, -height / 2);

    // 创建渐变（模拟图片中的橙红渐变）
    const gradientSize = Math.min(width, height) * 0.25;
    const gradient = ctx.createLinearGradient(
        width / 2 - gradientSize,
        height / 2,
        width / 2 + gradientSize,
        height / 2
    );
    gradient.addColorStop(0, '#FFD700'); // 金黄色
    gradient.addColorStop(0.3, '#FFA500'); // 橙色
    gradient.addColorStop(0.6, '#FF6B35'); // 橙红色
    gradient.addColorStop(1, '#FF1493'); // 深粉色

    // 使用手写风格字体（按优先级尝试）
    const fontSize = Math.min(width, height) * 0.15; // 适中的字体大小
    ctx.font = `${fontSize}px "Brush Script MT", "Comic Sans MS", "Chalkboard SE", "Lucida Handwriting", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 2.5秒后添加发光效果
    if (elapsed > 2500) {
        const glowIntensity = (Math.sin(elapsed / 200) + 1) * 0.5; // 0到1之间的脉动
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 3 + glowIntensity * 5; // 3-8之间的精细发光
    }

    // 绘制文字主体（纯渐变填充，无背景效果）
    ctx.globalAlpha = textOpacity;
    ctx.fillStyle = gradient;

    // 支持多行文字
    const lines = customText.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = height / 2 - totalHeight / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    ctx.restore();
}

// ===== 动画循环 =====
function animate() {
    // 使用半透明黑色实现拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // 启用发光模式（关键技巧）
    ctx.globalCompositeOperation = 'lighter';

    // 更新和绘制烟花
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw(ctx);
        if (fireworks[i].isDead()) {
            fireworks.splice(i, 1);
        }
    }

    // 更新和绘制粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }

    // 恢复正常混合模式
    ctx.globalCompositeOperation = 'source-over';

    // 绘制自定义文字
    draw2026Text();

    // 自动模式
    if (autoMode && Math.random() < 0.05) { // 增加触发频率
        const x = Math.random() * width * 0.8 + width * 0.1;
        // 烟花在不同高度均匀分布爆炸：5%-15%, 15%-30%, 30%-45%, 45%-60%, 60%-75%
        const range = Math.floor(Math.random() * 5);
        let y;
        if (range === 0) {
            y = Math.random() * height * 0.10 + height * 0.05; // 5%-15%
        } else if (range === 1) {
            y = Math.random() * height * 0.15 + height * 0.15; // 15%-30%
        } else if (range === 2) {
            y = Math.random() * height * 0.15 + height * 0.30; // 30%-45%
        } else if (range === 3) {
            y = Math.random() * height * 0.15 + height * 0.45; // 45%-60%
        } else {
            y = Math.random() * height * 0.15 + height * 0.60; // 60%-75%
        }
        const types = ['sphere', 'star', 'column', 'heart', 'spiral'];
        const type = types[Math.floor(Math.random() * types.length)];
        fireworks.push(new Firework(x, y, type));
    }

    requestAnimationFrame(animate);
}

// ===== 交互事件 =====
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 从底部发射到点击位置爆炸
    const types = ['sphere', 'star', 'column', 'heart', 'spiral'];
    const type = types[Math.floor(Math.random() * types.length)];
    fireworks.push(new Firework(x, y, type));
});

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        autoMode = !autoMode;
    }
});

// ===== 启动动画 =====
animate();

// 初始烟花（在不同高度均匀分布爆炸）
setTimeout(() => {
    fireworks.push(new Firework(width * 0.2, height * 0.08, 'sphere')); // 5%-15%
    fireworks.push(new Firework(width * 0.8, height * 0.12, 'sphere')); // 5%-15%
    fireworks.push(new Firework(width * 0.5, height * 0.20, 'star')); // 15%-30%
}, 500);

setTimeout(() => {
    fireworks.push(new Firework(width * 0.3, height * 0.10, 'star')); // 5%-15%
    fireworks.push(new Firework(width * 0.7, height * 0.25, 'star')); // 15%-30%
    fireworks.push(new Firework(width * 0.15, height * 0.35, 'sphere')); // 30%-45%
    fireworks.push(new Firework(width * 0.85, height * 0.18, 'sphere')); // 15%-30%
}, 800);

setTimeout(() => {
    fireworks.push(new Firework(width * 0.5, height * 0.40, 'column')); // 30%-45%
    fireworks.push(new Firework(width * 0.25, height * 0.14, 'heart')); // 5%-15%
    fireworks.push(new Firework(width * 0.75, height * 0.28, 'heart')); // 15%-30%
    fireworks.push(new Firework(width * 0.4, height * 0.52, 'sphere')); // 45%-60%
    fireworks.push(new Firework(width * 0.6, height * 0.68, 'sphere')); // 60%-75%
}, 1000);

setTimeout(() => {
    fireworks.push(new Firework(width * 0.1, height * 0.38, 'spiral')); // 30%-45%
    fireworks.push(new Firework(width * 0.9, height * 0.22, 'spiral')); // 15%-30%
    fireworks.push(new Firework(width * 0.4, height * 0.11, 'sphere')); // 5%-15%
    fireworks.push(new Firework(width * 0.6, height * 0.32, 'sphere')); // 30%-45%
    fireworks.push(new Firework(width * 0.25, height * 0.55, 'heart')); // 45%-60%
    fireworks.push(new Firework(width * 0.75, height * 0.65, 'heart')); // 60%-75%
}, 1200);
