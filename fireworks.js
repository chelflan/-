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
const pathFireworks = []; // 路径烟花数组
const stars = []; // 星星数组
let autoMode = true; // 默认开启自动模式
let textOpacity = 0; // 文字透明度
let textScale = 0.5; // 文字缩放
let animationStartTime = Date.now() + 1000; // 延迟1秒开始文字动画
let customText = '2026'; // 默认文字
let flashIntensity = 0; // 屏幕闪光强度
let pathDrawingPhase = true; // 路径绘制阶段
let pathDrawingStartTime = Date.now() + 1000; // 路径绘制开始时间
let lastLaunchedCharIndex = -1; // 最后发射的字符索引

// ===== 音效系统 =====
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.bgmGain = null;
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.bgmElement = null; // 新增：用于存储音频元素
        this.bgmSource = null; // 新增：用于存储音频源节点
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支持');
            this.enabled = false;
        }
    }

    playExplosion() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const t = ctx.currentTime;

        // 创建噪声节点（爆炸声）
        const bufferSize = ctx.sampleRate * 0.5; // 0.5秒
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // 生成白噪声
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // 滤波器（低通，让声音更沉闷）
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);

        // 音量包络
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        // 连接节点
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // 播放
        noise.start(t);
        noise.stop(t + 0.3);
    }

    playLaunch() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const t = ctx.currentTime;

        // 创建振荡器（发射声）
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);

        // 音量包络
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);

        // 连接节点
        osc.connect(gain);
        gain.connect(ctx.destination);

        // 播放
        osc.start(t);
        osc.stop(t + 0.2);
    }

    // 播放背景音乐（使用音频文件）
    async startBGM() {
        if (!this.enabled || !this.audioContext || this.bgmPlaying) return;

        try {
            const ctx = this.audioContext;

            // 如果音频上下文处于挂起状态，恢复它
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            // 创建 HTML audio 元素（更兼容本地文件）
            this.bgmElement = new Audio('bgm.mp3');
            this.bgmElement.loop = true; // 循环播放
            this.bgmElement.volume = 0.4; // 音量

            // 创建音频源并连接到 Web Audio API
            this.bgmSource = ctx.createMediaElementSource(this.bgmElement);
            this.bgmGain = ctx.createGain();
            this.bgmGain.gain.value = 0.4;

            // 连接节点
            this.bgmSource.connect(this.bgmGain);
            this.bgmGain.connect(ctx.destination);

            // 播放音频
            await this.bgmElement.play();
            this.bgmPlaying = true;

            console.log('背景音乐播放成功');

        } catch (error) {
            console.warn('背景音乐加载失败:', error);
            console.log('将使用代码生成的音乐作为备选方案');
            // 如果音频文件加载失败，回退到代码生成的音乐
            this.bgmElement = null;
            this.startFallbackBGM();
        }
    }

    // 备用方案：代码生成的音乐
    startFallbackBGM() {
        if (!this.enabled || !this.audioContext || this.bgmPlaying) return;

        this.bgmPlaying = true;
        const ctx = this.audioContext;

        // 欢快的旋律：C大调简单欢快曲调
        const melody = [
            { note: 523.25, duration: 0.15 },  // C5
            { note: 587.33, duration: 0.15 },  // D5
            { note: 659.25, duration: 0.15 },  // E5
            { note: 783.99, duration: 0.3 },   // G5
            { note: 659.25, duration: 0.15 },  // E5
            { note: 587.33, duration: 0.15 },  // D5
            { note: 523.25, duration: 0.3 },   // C5
            { note: 392.00, duration: 0.2 },   // G4
            { note: 440.00, duration: 0.2 },   // A4
            { note: 493.88, duration: 0.4 },   // B4
            { note: 523.25, duration: 0.15 },  // C5
            { note: 659.25, duration: 0.15 },  // E5
            { note: 783.99, duration: 0.4 },   // G5
        ];

        let noteIndex = 0;
        let startTime = ctx.currentTime;

        const playNote = () => {
            if (!this.bgmPlaying) return;

            const noteData = melody[noteIndex];
            const t = startTime;

            // 主旋律
            this.playNoteWithInstrument(noteData.note, t, noteData.duration, 'sine', 0.3);

            // 伴奏（低八度）
            this.playNoteWithInstrument(noteData.note / 2, t, noteData.duration, 'triangle', 0.15);

            // 装饰音（偶尔添加）
            if (Math.random() < 0.3) {
                const decorationNote = noteData.note * 1.5; // 五度音
                this.playNoteWithInstrument(decorationNote, t + noteData.duration * 0.5, noteData.duration * 0.3, 'sine', 0.1);
            }

            startTime += noteData.duration;
            noteIndex = (noteIndex + 1) % melody.length;

            // 循环播放
            this.bgmInterval = setTimeout(playNote, noteData.duration * 1000 - 50);
        };

        playNote();
    }

    playNoteWithInstrument(frequency, startTime, duration, type, volume) {
        const ctx = this.audioContext;

        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    stopBGM() {
        this.bgmPlaying = false;

        // 停止 audio 元素
        if (this.bgmElement) {
            this.bgmElement.pause();
            this.bgmElement.currentTime = 0;
            this.bgmElement = null;
        }

        // 停止音频源（用于 buffer 模式）
        if (this.bgmSource) {
            try {
                // 对于 MediaElementSource，不需要 stop()
                // 对于 BufferSource，需要 stop()
                if (this.bgmSource.stop) {
                    this.bgmSource.stop();
                }
            } catch (e) {
                // 忽略已经停止的错误
            }
            this.bgmSource = null;
        }

        // 清除定时器
        if (this.bgmInterval) {
            clearTimeout(this.bgmInterval);
            this.bgmInterval = null;
        }

        // 淡出音量
        if (this.bgmGain && this.audioContext) {
            this.bgmGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        }
    }
}

const soundManager = new SoundManager();

// 按钮点击事件处理
document.getElementById('startButton').addEventListener('click', () => {
    const input = document.getElementById('customTextInput').value.trim();
    if (input) {
        customText = input;
    }
    // 隐藏输入框弹窗
    document.getElementById('inputModal').style.display = 'none';

    // 初始化音效系统
    soundManager.init();

    // 启动背景音乐
    soundManager.startBGM();
});

// 颜色方案（参考视频：橙红渐变 + 蓝色点缀）
const colors = {
    warm: ['#FFD700', '#FFA500', '#FF6B35', '#FF4500', '#FF1493', '#FF69B4', '#FFB347'], // 金黄→橙→橙红→粉（主色调）
    cool: ['#1E90FF', '#00BFFF', '#00CED1', '#87CEEB'], // 蓝色点缀（更亮的蓝色）
    sparkle: ['#FFFFFF', '#FFFACD', '#FFD700'] // 闪烁色
};

// ===== 星星类 =====
class Star {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.7; // 只在上方70%区域显示星星
        this.size = Math.random() * 1.5 + 0.5;
        this.baseAlpha = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    draw(ctx, time) {
        // 闪烁效果
        const alpha = this.baseAlpha + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // 偶尔添加十字星光
        if (Math.random() < 0.01) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 2, this.y);
            ctx.lineTo(this.x + this.size * 2, this.y);
            ctx.moveTo(this.x, this.y - this.size * 2);
            ctx.lineTo(this.x, this.y + this.size * 2);
            ctx.stroke();
        }
    }
}

// 初始化星星背景
function initStars() {
    const starCount = Math.floor((width * height) / 8000); // 根据屏幕面积决定星星数量
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }
}
initStars();

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

// ===== 路径数据定义 =====
// 为"2026"创建路径点（基于屏幕相对坐标 0-1）
function getTextPaths(text, centerX, centerY, fontSize) {
    const paths = [];
    const scale = fontSize * 0.8; // 字符大小

    // 每个字符的相对偏移
    const charSpacing = scale * 0.7;
    const startX = centerX - (text.length * charSpacing) / 2 + charSpacing / 2;

    for (let charIndex = 0; charIndex < text.length; charIndex++) {
        const char = text[charIndex];
        const offsetX = startX + charIndex * charSpacing - centerX;
        const charPaths = getCharPaths(char, centerX + offsetX, centerY, scale);
        paths.push(...charPaths);
    }

    return paths;
}

// 单个字符的路径定义
function getCharPaths(char, offsetX, offsetY, scale) {
    const paths = [];

    switch (char) {
        case '2':
            // 数字"2"：上半圆弧 + 下半横线 + 斜线
            paths.push([
                { x: offsetX - 0.25 * scale, y: offsetY - 0.25 * scale },
                { x: offsetX - 0.2 * scale, y: offsetY - 0.35 * scale },
                { x: offsetX, y: offsetY - 0.4 * scale },
                { x: offsetX + 0.2 * scale, y: offsetY - 0.35 * scale },
                { x: offsetX + 0.25 * scale, y: offsetY - 0.25 * scale },
                { x: offsetX + 0.25 * scale, y: offsetY - 0.15 * scale },
                { x: offsetX + 0.2 * scale, y: offsetY - 0.1 * scale },
                { x: offsetX, y: offsetY },
                { x: offsetX - 0.2 * scale, y: offsetY + 0.1 * scale },
                { x: offsetX - 0.25 * scale, y: offsetY + 0.2 * scale },
                { x: offsetX - 0.25 * scale, y: offsetY + 0.3 * scale },
                { x: offsetX, y: offsetY + 0.4 * scale },
                { x: offsetX + 0.25 * scale, y: offsetY + 0.35 * scale }
            ]);
            break;

        case '0':
            // 数字"0"：椭圆形
            paths.push([
                { x: offsetX + 0.25 * scale, y: offsetY },
                { x: offsetX + 0.2 * scale, y: offsetY - 0.25 * scale },
                { x: offsetX, y: offsetY - 0.4 * scale },
                { x: offsetX - 0.2 * scale, y: offsetY - 0.25 * scale },
                { x: offsetX - 0.25 * scale, y: offsetY },
                { x: offsetX - 0.2 * scale, y: offsetY + 0.25 * scale },
                { x: offsetX, y: offsetY + 0.4 * scale },
                { x: offsetX + 0.2 * scale, y: offsetY + 0.25 * scale },
                { x: offsetX + 0.25 * scale, y: offsetY }
            ]);
            break;

        case '6':
            // 数字"6"：上半圆 + 下半弧
            paths.push([
                { x: offsetX + 0.1 * scale, y: offsetY - 0.1 * scale },
                { x: offsetX + 0.15 * scale, y: offsetY - 0.25 * scale },
                { x: offsetX, y: offsetY - 0.4 * scale },
                { x: offsetX - 0.15 * scale, y: offsetY - 0.25 * scale },
                { x: offsetX - 0.2 * scale, y: offsetY },
                { x: offsetX - 0.15 * scale, y: offsetY + 0.15 * scale },
                { x: offsetX, y: offsetY + 0.3 * scale },
                { x: offsetX + 0.15 * scale, y: offsetY + 0.35 * scale },
                { x: offsetX + 0.25 * scale, y: offsetY + 0.2 * scale },
                { x: offsetX + 0.25 * scale, y: offsetY + 0.1 * scale }
            ]);
            break;

        default:
            // 默认：简单圆形
            paths.push([
                { x: offsetX + 0.2 * scale, y: offsetY },
                { x: offsetX, y: offsetY + 0.2 * scale },
                { x: offsetX - 0.2 * scale, y: offsetY },
                { x: offsetX, y: offsetY - 0.2 * scale }
            ]);
            break;
    }

    return paths;
}

// ===== 路径烟花类 =====
class PathFirework {
    constructor(path, color) {
        this.path = path; // 路径点数组 [{x, y}, ...]
        this.pathIndex = 0; // 当前路径点索引
        this.x = path[0].x;
        this.y = path[0].y;
        this.targetX = path[path.length - 1].x;
        this.targetY = path[path.length - 1].y;
        this.color = color;
        this.exploded = false;
        this.trail = [];
        this.speed = 0.15; // 沿路径移动速度（每帧移动路径的百分比）

        // 播放发射音效
        soundManager.playLaunch();
    }

    update() {
        if (this.exploded) return;

        // 保存轨迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 25) {
            this.trail.shift();
        }

        // 沿路径移动
        this.pathIndex += this.speed;

        if (this.pathIndex >= this.path.length - 1) {
            // 到达路径终点，爆炸
            this.explode();
        } else {
            // 线性插值计算当前位置
            const index = Math.floor(this.pathIndex);
            const nextIndex = Math.min(index + 1, this.path.length - 1);
            const t = this.pathIndex - index;

            const currentPoint = this.path[index];
            const nextPoint = this.path[nextIndex];

            this.x = currentPoint.x + (nextPoint.x - currentPoint.x) * t;
            this.y = currentPoint.y + (nextPoint.y - currentPoint.y) * t;
        }
    }

    draw(ctx) {
        // 绘制路径轨迹（增强版）
        if (this.trail.length > 1) {
            // 渐变尾迹
            for (let i = 0; i < this.trail.length - 1; i++) {
                const point = this.trail[i];
                const nextPoint = this.trail[i + 1];
                const progress = i / this.trail.length;

                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(nextPoint.x, nextPoint.y);

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3 + progress * 5;
                ctx.globalAlpha = progress * 0.9;
                ctx.stroke();
            }

            // 整体发光效果
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.lineTo(this.x, this.y);

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 15;
            ctx.globalAlpha = 0.3;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 25;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // 绘制烟花头
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.fill();

        // 白色核心
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    explode() {
        this.exploded = true;
        soundManager.playExplosion();
        flashIntensity = 0.2;

        // 在终点创建球形爆炸（粒子数较少，因为路径烟花已经很绚丽）
        const particleCount = 80;
        const speed = 4;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            particles.push(new Particle(this.x, this.y, this.color, velocity, 1.0));
        }
    }

    isDead() {
        return this.exploded;
    }
}

// 发射指定字符的路径烟花
function launchPathFireworksForChar(charIndex) {
    if (charIndex >= customText.length) return;

    const fontSize = Math.min(width, height) * 0.15;
    const paths = getTextPaths(customText[charIndex], width / 2, height / 2, fontSize);

    // 为每个路径发射一个烟花
    paths.forEach((path) => {
        const color = colors.warm[Math.floor(Math.random() * colors.warm.length)];
        pathFireworks.push(new PathFirework(path, color));
    });
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

        // 播放发射音效
        soundManager.playLaunch();
    }

    pickColor() {
        // 60% 暖色（橙红），30% 冷色（蓝色点缀），10% 闪烁色
        const rand = Math.random();
        let palette;
        if (rand < 0.6) {
            palette = colors.warm;
        } else if (rand < 0.9) {
            palette = colors.cool;
        } else {
            palette = colors.sparkle;
        }
        return palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
        // 保存轨迹（增加轨迹长度）
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) { // 增加到20个点
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
        // 绘制上升轨迹（增强版）
        if (this.trail.length > 1) {
            // 绘制渐变尾迹
            for (let i = 0; i < this.trail.length - 1; i++) {
                const point = this.trail[i];
                const nextPoint = this.trail[i + 1];
                const progress = i / this.trail.length; // 0到1

                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(nextPoint.x, nextPoint.y);

                // 渐变效果：尾部细且淡，头部粗且亮
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2 + progress * 4; // 2-6px渐变
                ctx.globalAlpha = progress * 0.8; // 渐变透明度
                ctx.stroke();
            }

            // 添加整体发光效果
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.lineTo(this.x, this.y);

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 12;
            ctx.globalAlpha = 0.2;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // 绘制火箭头（更大、更亮、多重发光）
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);

        // 多重发光效果
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fill();

        // 添加白色核心
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    explode() {
        this.exploded = true;

        // 播放爆炸音效
        soundManager.playExplosion();

        // 添加屏幕闪光效果
        flashIntensity = 0.15; // 瞬间闪亮

        const particleCount = 150; // 增加粒子数量，更密集

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
    const animationDuration = 1500; // 1.5秒完成动画

    // 平滑缓动函数（easeOutCubic）
    const progress = Math.min(elapsed / animationDuration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    textOpacity = easedProgress;
    textScale = 0.2 + easedProgress * 0.8; // 从 0.2 缩放到 1.0

    // 移动到中心并缩放
    ctx.translate(width / 2, height / 2);

    // 2.5秒后添加抖动效果
    if (elapsed > 2500) {
        const shakeIntensity = 3;
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
    const fontSize = Math.min(width, height) * 0.15;
    ctx.font = `${fontSize}px "Brush Script MT", "Comic Sans MS", "Chalkboard SE", "Lucida Handwriting", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 增强的脉动发光效果
    if (elapsed > 2500) {
        const glowIntensity = (Math.sin(elapsed / 300) + 1) * 0.5;

        // 多层发光效果
        ctx.shadowColor = '#FF6B35';
        ctx.shadowBlur = 10 + glowIntensity * 15;

        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 5 + glowIntensity * 10;
    }

    // 绘制文字主体
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
let animationStartTimeGlobal = Date.now(); // 全局动画开始时间

function animate() {
    const currentTime = Date.now();

    // 使用半透明黑色实现拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // 绘制星星背景
    ctx.globalCompositeOperation = 'source-over';
    stars.forEach(star => star.draw(ctx, currentTime));

    // 添加屏幕闪光效果
    if (flashIntensity > 0.01) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
        ctx.fillRect(0, 0, width, height);
        flashIntensity *= 0.85; // 快速衰减
    } else {
        flashIntensity = 0;
    }

    // 启用发光模式（关键技巧）
    ctx.globalCompositeOperation = 'lighter';

    // 更新和绘制路径烟花
    for (let i = pathFireworks.length - 1; i >= 0; i--) {
        pathFireworks[i].update();
        pathFireworks[i].draw(ctx);
        if (pathFireworks[i].isDead()) {
            pathFireworks.splice(i, 1);
        }
    }

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

    // 自动模式：直接开始随机烟花（不使用路径绘制）
    if (autoMode) {
        const elapsed = (Date.now() - animationStartTimeGlobal) / 1000; // 秒

        // 触发频率随时间增加：从 0.02 逐渐增加到 0.15
        let triggerChance = 0.02;
        if (elapsed > 5) {
            triggerChance = Math.min(0.02 + (elapsed - 5) * 0.01, 0.15);
        }

        if (Math.random() < triggerChance) {
            const x = Math.random() * width * 0.8 + width * 0.1;
            // 烟花在不同高度均匀分布爆炸
            const range = Math.floor(Math.random() * 5);
            let y;
            if (range === 0) {
                y = Math.random() * height * 0.10 + height * 0.05;
            } else if (range === 1) {
                y = Math.random() * height * 0.15 + height * 0.15;
            } else if (range === 2) {
                y = Math.random() * height * 0.15 + height * 0.30;
            } else if (range === 3) {
                y = Math.random() * height * 0.15 + height * 0.45;
            } else {
                y = Math.random() * height * 0.15 + height * 0.60;
            }
            const types = ['sphere', 'star', 'column', 'heart', 'spiral'];
            const type = types[Math.floor(Math.random() * types.length)];
            fireworks.push(new Firework(x, y, type));
        }
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

// 初始烟花已替换为路径烟花系统，自动在 animate() 中发射
