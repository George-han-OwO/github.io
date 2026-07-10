// 联系表单功能已移除

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initLoader();
    initNavigation();
    initScrollEffects();
    initSkillAnimations();
    initGameCardHover();

    initParticles();
    initHorizontalLayout();
    optimizePerformance();
    initAdminLogin();
    initGameBindings();
});

// 加载动画功能
function initLoader() {
    const loader = document.querySelector('.loader');
    
    // 模拟加载过程
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 2000);
}

// 导航功能
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // 移动端菜单切换
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // 点击链接后关闭移动端菜单
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // 滚动时导航栏样式变化
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.padding = '0.5rem 0';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.padding = '1rem 0';
        }
    });
}

// 滚动效果
function initScrollEffects() {
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 滚动箭头点击事件 - 滚动到关于我区域
    const scrollArrow = document.querySelector('.scroll-indicator');
    if (scrollArrow) {
        scrollArrow.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // 滚动时显示元素动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // 如果是技能条，启动进度动画
                if (entry.target.classList.contains('skill-item')) {
                    animateSkillBar(entry.target);
                }
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    document.querySelectorAll('.about-content, .skill-category, .project-card, .contact-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// 横向滚动卡片组件 - 滚动触发翻面动画
function initSkillAnimations() {
    // 页面加载时重置所有卡片状态（即使有缓存也会重置）
    resetCardStates();
    
    // 初始化卡片观察器
    initCardObserver();
    
    // 增强滚动体验
    // 注意：enhanceScrolling()函数已被initInfiniteScroll()函数替代
}

/**
 * 重置所有卡片状态
 */
function resetCardStates() {
    // 获取所有卡片元素
    const cards = document.querySelectorAll('.flip-card');
    
    // 移除所有卡片的翻转状态和已观察标记
    cards.forEach(card => {
        card.classList.remove('flipped');
        card.removeAttribute('data-observed');
    });
    
    console.log('卡片状态已重置');
}

/**
 * 初始化卡片观察器
 * 使用Intersection Observer API检测卡片是否进入视图
 */
function initCardObserver() {
    // 配置观察器选项
    const options = {
        root: null, // 使用视口作为根元素
        rootMargin: '0px', // 没有边距扩展
        threshold: 0.3 // 当卡片的30%进入视图时触发回调
    };
    
    // 创建Intersection Observer实例
    const observer = new IntersectionObserver(handleCardIntersection, options);
    
    // 获取所有卡片元素并开始观察
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
        observer.observe(card);
    });
    
    console.log('卡片观察器已初始化');
}

/**
 * 处理卡片交叉观察事件
 * @param {IntersectionObserverEntry[]} entries - 观察到的元素集合
 * @param {IntersectionObserver} observer - 观察器实例
 */
function handleCardIntersection(entries, observer) {
    entries.forEach(entry => {
        // 如果元素进入视图
        if (entry.isIntersecting) {
            const card = entry.target;
            
            // 检查卡片是否已经被观察过
            if (!card.hasAttribute('data-observed')) {
                // 标记卡片为已观察
                card.setAttribute('data-observed', 'true');
                
                // 添加微小延迟，使动画效果更自然
                const cardIndex = parseInt(card.getAttribute('data-card-index') || 0);
                const delay = cardIndex * 100; // 每张卡片延迟100ms，创造层次感
                
                setTimeout(() => {
                    // 触发翻转动画
                    card.classList.add('flipped');
                    
                    console.log(`卡片 ${cardIndex} 已触发翻转动画`);
                }, delay);
                
                // 停止观察该卡片，确保只触发一次
                observer.unobserve(card);
            }
        }
    });
}



// 游戏卡片悬停效果
function initGameCardHover() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
    });
}



// 水平布局初始化（简化版）
function initHorizontalLayout() {
    // 无需额外JavaScript交互，所有样式由CSS控制
    // 用户头像保持静止状态，白子酱图片默认向左倾斜
}

// 粒子背景效果
function initParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const particlesContainer = document.querySelector('.particles');
    
    if (!particlesContainer) return;
    
    canvas.width = particlesContainer.offsetWidth;
    canvas.height = particlesContainer.offsetHeight;
    particlesContainer.appendChild(canvas);
    
    const particles = [];
    const particleCount = 50;
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            // 更新位置
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // 边界检查
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            // 绘制粒子
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(78, 205, 196, ' + particle.opacity + ')';
            ctx.fill();
        });
        
        // 绘制连接线
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    var opacity = 0.2 * (1 - distance / 100);
                    ctx.strokeStyle = 'rgba(78, 205, 196, ' + opacity + ')';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // 窗口大小改变时重置画布
    window.addEventListener('resize', () => {
        canvas.width = particlesContainer.offsetWidth;
        canvas.height = particlesContainer.offsetHeight;
    });
}

// 打字机效果（可选功能）
function initTypewriter() {
    const elements = document.querySelectorAll('[data-typewriter]');
    
    elements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // 延迟开始打字效果
        setTimeout(typeWriter, 1000);
    });
}

// 添加CSS动画关键帧
const style = document.createElement('style');
style.textContent = '\n    @keyframes slideInRight {\n        from {\n            transform: translateX(100%);\n            opacity: 0;\n        }\n        to {\n            transform: translateX(0);\n            opacity: 1;\n        }\n    }\n    \n    @keyframes slideOutRight {\n        from {\n            transform: translateX(0);\n            opacity: 1;\n        }\n        to {\n            transform: translateX(100%);\n            opacity: 0;\n        }\n    }\n    \n    .nav-toggle.active .bar:nth-child(1) {\n        transform: rotate(-45deg) translate(-5px, 6px);\n    }\n    \n    .nav-toggle.active .bar:nth-child(2) {\n        opacity: 0;\n    }\n    \n    .nav-toggle.active .bar:nth-child(3) {\n        transform: rotate(45deg) translate(-5px, -6px);\n    }\n';
document.head.appendChild(style);

// 页面性能优化：延迟加载非关键资源
function optimizePerformance() {
    // 延迟加载图片
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 初始化所有功能
optimizePerformance();

// ==================== 管理员登录 & 游戏账号绑定 ====================

const ADMIN_PASSWORD = 'Georgegh164999';
const STORAGE_KEY_ADMIN = 'georgehan_isAdmin';
const STORAGE_KEY_BINDINGS = 'georgehan_bindings';

let gameBindings = JSON.parse(localStorage.getItem(STORAGE_KEY_BINDINGS) || '{}');
let isAdmin = localStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
let editingGames = new Set();

const GAMES_CONFIG = [
    {
        id: 'yihuan',
        name: '异环',
        icon: 'fa-ring',
        color: '#9b59b6',
        fields: [
            { key: 'account', label: '游戏账号/角色名', type: 'text', placeholder: '如:xxxx' },
            { key: 'uid', label: 'UID', type: 'text', placeholder: '如:100000001' },
            { key: 'server', label: '区服', type: 'text', placeholder: '如:官服' },
            { key: 'level', label: '等级', type: 'text', placeholder: '如:Lv.50' },
            { key: 'progress', label: '进度', type: 'text', placeholder: '如:主线 3-5' },
            { key: 'note', label: '备注', type: 'textarea', placeholder: '可选' }
        ]
    },

    {
        id: 'endfield',
        name: '明日方舟：终末地',
        icon: 'fa-mountain',
        color: '#e67e22',
        fields: [
            { key: 'account', label: '游戏账号/角色名', type: 'text' },
            { key: 'uid', label: 'UID', type: 'text' },
            { key: 'server', label: '区服', type: 'text' },
            { key: 'level', label: '等级', type: 'text' },
            { key: 'progress', label: '练度/进度', type: 'text' },
            { key: 'note', label: '备注', type: 'textarea' }
        ]
    },

    {
        id: 'deltaforce',
        name: '三角洲行动',
        icon: 'fa-crosshairs',
        color: '#16a085',
        fields: [
            { key: 'account', label: '游戏账号/角色名', type: 'text' },
            { key: 'uid', label: 'UID', type: 'text' },
            { key: 'server', label: '区服', type: 'text' },
            { key: 'rank', label: '段位', type: 'text' },
            { key: 'gearScore', label: '战备等级', type: 'text' },
            { key: 'note', label: '备注', type: 'textarea' }
        ]
    },
    {
        id: 'csgo',
        name: 'CS:GO 时长',
        icon: 'fa-crosshairs',
        color: '#f39c12',
        fields: [
            { key: 'steamId', label: 'Steam ID / 关联Steam', type: 'text', placeholder: 'SteamID64' },
            { key: 'csgoHours', label: '游戏时长 (小时)', type: 'number', placeholder: '如:1500' },
            { key: 'rank', label: '段位/排名', type: 'text' },
            { key: 'primaryWeapon', label: '主要武器', type: 'text' },
            { key: 'note', label: '备注', type: 'textarea' }
        ]
    },
    {
        id: 'steam',
        name: 'Steam 账号',
        icon: 'fa-steam',
        color: '#1b2838',
        fields: [
            { key: 'steamId', label: 'SteamID64', type: 'text', placeholder: '17位数字ID' },
            { key: 'steamName', label: 'Steam 昵称', type: 'text' },
            { key: 'profileUrl', label: '资料链接', type: 'text', placeholder: 'https://steamcommunity.com/...' },
            { key: 'avatarUrl', label: '头像 URL', type: 'text' },
            { key: 'totalGames', label: '游戏库数量', type: 'number' },
            { key: 'note', label: '备注', type: 'textarea' }
        ],
        hasSync: true
    }
];

function initAdminLogin() {
    const avatar = document.querySelector('.user-avatar');
    if (avatar) {
        avatar.addEventListener('dblclick', function(e) {
            e.preventDefault();
            handleAdminToggle();
        });
    }

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('确定要退出管理员登录吗？')) {
                logoutAdmin();
            }
        });
    }
}

function handleAdminToggle() {
    if (isAdmin) {
        if (confirm('您已是管理员。是否退出登录？')) {
            logoutAdmin();
        }
        return;
    }
    const pwd = prompt('请输入管理员密码：');
    if (pwd === null) return;
    if (pwd === ADMIN_PASSWORD) {
        loginAdmin();
    } else {
        showToast('密码错误', 'error');
    }
}

function loginAdmin() {
    isAdmin = true;
    localStorage.setItem(STORAGE_KEY_ADMIN, 'true');
    document.body.classList.add('admin-mode');
    showToast('管理员登录成功', 'success');
    renderBindings();
    updateHintText();
}

function logoutAdmin() {
    isAdmin = false;
    localStorage.removeItem(STORAGE_KEY_ADMIN);
    document.body.classList.remove('admin-mode');
    editingGames.clear();
    showToast('已退出管理员', 'info');
    renderBindings();
    updateHintText();
}

function updateHintText() {
    const hint = document.getElementById('bindingsHint');
    if (!hint) return;
    if (isAdmin) {
        hint.innerHTML = '当前为管理员模式 — 您可以编辑/保存/删除任意游戏账号绑定 <button class="btn-export" id="exportBtn"><i class="fas fa-download"></i> 导出JSON</button>';
        hint.classList.add('admin-active');
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', exportBindings);
    } else {
        hint.textContent = '双击首页头像可登录管理员进行账号绑定';
        hint.classList.remove('admin-active');
    }
}

async function initGameBindings() {
    if (isAdmin) {
        document.body.classList.add('admin-mode');
    }
    await loadBindingsFromRepo();
    renderBindings();
    updateHintText();
}

async function loadBindingsFromRepo() {
    try {
        const response = await fetch('bindings.json');
        if (response.ok) {
            const repoData = await response.json();
            for (const gameId in repoData) {
                if (repoData[gameId] && Object.keys(repoData[gameId]).length > 0) {
                    if (!gameBindings[gameId] || !gameBindings[gameId].lastSync) {
                        gameBindings[gameId] = repoData[gameId];
                    }
                }
            }
        }
    } catch (e) {
        console.log('bindings.json not available, using localStorage only');
    }
}

function exportBindings() {
    const data = {};
    for (const gameId in gameBindings) {
        const d = { ...gameBindings[gameId] };
        delete d._editing;
        if (Object.keys(d).length > 0) {
            data[gameId] = d;
        }
    }
    const json = JSON.stringify(data, null, 4);

    if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(() => {
            showToast('JSON 已复制到剪贴板！请粘贴到 bindings.json 并推送到 GitHub', 'success', 5000);
        }).catch(() => {
            showExportModal(json);
        });
    } else {
        showExportModal(json);
    }
}

function showExportModal(json) {
    const existing = document.querySelector('.export-modal-overlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'export-modal-overlay';
    modal.innerHTML = '<div class="export-modal">'
        + '<h3><i class="fas fa-download"></i> 导出绑定数据</h3>'
        + '<p>复制以下内容，粘贴到项目根目录的 <code>bindings.json</code> 文件中，然后推送到 GitHub：</p>'
        + '<textarea class="export-textarea" readonly>' + escapeHtml(json) + '</textarea>'
        + '<div class="export-modal-actions">'
        + '<button class="btn-save" id="exportCopyBtn"><i class="fas fa-copy"></i> 复制</button>'
        + '<button class="btn-cancel" id="exportCloseBtn"><i class="fas fa-times"></i> 关闭</button>'
        + '</div></div>';
    document.body.appendChild(modal);

    document.getElementById('exportCopyBtn').addEventListener('click', function() {
        const ta = modal.querySelector('.export-textarea');
        ta.select();
        navigator.clipboard.writeText(ta.value).then(() => {
            this.innerHTML = '<i class="fas fa-check"></i> 已复制！';
            setTimeout(() => modal.remove(), 1200);
        });
    });
    document.getElementById('exportCloseBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function renderBindings() {
    const grid = document.getElementById('bindingsGrid');
    if (!grid) return;

    grid.innerHTML = GAMES_CONFIG.map(game => renderBindingCard(game)).join('');

    GAMES_CONFIG.forEach(game => {
        const card = document.querySelector(`[data-game-id="${game.id}"]`);
        if (!card) return;
        card.style.setProperty('--game-color', game.color);

        const saveBtn = card.querySelector('.btn-save');
        const cancelBtn = card.querySelector('.btn-cancel');
        const deleteBtn = card.querySelector('.btn-delete');
        const editBtn = card.querySelector('.btn-edit');
        const syncBtn = card.querySelector('.btn-sync');

        if (saveBtn) saveBtn.addEventListener('click', () => saveBinding(game.id));
        if (cancelBtn) cancelBtn.addEventListener('click', () => {
            editingGames.delete(game.id);
            renderBindings();
        });
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteBinding(game.id));
        if (editBtn) editBtn.addEventListener('click', () => enterEditMode(game.id));
        if (syncBtn) syncBtn.addEventListener('click', () => syncSteamData(game.id));
    });
}

function renderBindingCard(game) {
    const data = gameBindings[game.id] || {};
    const isBound = !!data.lastSync;
    const isEditing = isAdmin && (editingGames.has(game.id) || !isBound);

    let bodyContent;
    if (isEditing && isAdmin) {
        bodyContent = renderBindingForm(game, data);
    } else {
        bodyContent = renderBindingDisplay(game, data);
    }

    const lastSyncHtml = isBound
        ? `<div class="binding-last-sync"><i class="fas fa-clock"></i> 最后更新: ${formatDate(data.lastSync)}</div>`
        : '';

    return `
        <div class="binding-card" data-game-id="${game.id}">
            <div class="binding-card-header">
                <div class="binding-card-title">
                    <i class="fas ${game.icon}" style="color: ${game.color}"></i>
                    <h3>${escapeHtml(game.name)}</h3>
                </div>
                <span class="binding-status ${isBound ? 'bound' : 'unbound'}">
                    ${isBound ? '已绑定' : '未绑定'}
                </span>
            </div>
            ${bodyContent}
            ${lastSyncHtml}
        </div>
    `;
}

function renderBindingDisplay(game, data) {
    const presentFields = game.fields.filter(f => data[f.key] && data[f.key].toString().trim() !== '');
    
    if (presentFields.length === 0) {
        const msg = isAdmin 
            ? '未绑定 — 点击下方"开始绑定"按钮填写信息' 
            : '暂无绑定信息';
        const startBtn = isAdmin 
            ? `<div class="binding-actions"><button class="btn-edit" onclick="window.__georgehanBindStart && window.__georgehanBindStart('${game.id}')"><i class="fas fa-plus"></i> 开始绑定</button></div>`
            : '';
        return `<div class="binding-empty">${escapeHtml(msg)}</div>${startBtn}`;
    }

    const fieldsHtml = presentFields.map(f => {
        const value = String(data[f.key]);
        if (f.key === 'avatarUrl') {
            return `<div class="field">
                <span class="field-label">${escapeHtml(f.label)}</span>
                <div class="field-value">
                    <img src="${escapeHtml(value)}" alt="Steam头像" class="steam-avatar" onerror="this.outerHTML='<span class=&quot;field-value empty&quot;>头像加载失败</span>'">
                </div>
            </div>`;
        }
        if (f.key === 'profileUrl') {
            return `<div class="field">
                <span class="field-label">${escapeHtml(f.label)}</span>
                <div class="field-value">
                    <a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)} <i class="fas fa-external-link-alt" style="font-size:0.7em"></i></a>
                </div>
            </div>`;
        }
        return `<div class="field">
            <span class="field-label">${escapeHtml(f.label)}</span>
            <span class="field-value">${escapeHtml(value)}</span>
        </div>`;
    }).join('');

    const actions = isAdmin
        ? `<div class="binding-actions">
            <button class="btn-edit"><i class="fas fa-edit"></i> 编辑</button>
            <button class="btn-delete"><i class="fas fa-trash"></i> 删除</button>
            ${game.hasSync ? '<button class="btn-sync"><i class="fas fa-sync"></i> 同步Steam</button>' : ''}
        </div>`
        : '';

    return `<div class="binding-display">${fieldsHtml}</div>${actions}`;
}

function renderBindingForm(game, data) {
    const fieldsHtml = game.fields.map(f => {
        const value = data[f.key] || '';
        const placeholder = f.placeholder || '';
        if (f.type === 'textarea') {
            return `<div class="form-field">
                <label>${escapeHtml(f.label)}</label>
                <textarea name="${f.key}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>
            </div>`;
        }
        return `<div class="form-field">
            <label>${escapeHtml(f.label)}</label>
            <input type="${f.type}" name="${f.key}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
        </div>`;
    }).join('');

    const hasData = !!data.lastSync;
    return `<div class="binding-form">${fieldsHtml}
        <div class="binding-actions">
            <button class="btn-save"><i class="fas fa-save"></i> 保存</button>
            ${hasData ? '<button class="btn-cancel"><i class="fas fa-times"></i> 取消</button>' : ''}
        </div>
    </div>`;
}

window.__georgehanBindStart = function(gameId) {
    enterEditMode(gameId);
};

function enterEditMode(gameId) {
    if (!gameBindings[gameId]) gameBindings[gameId] = {};
    editingGames.add(gameId);
    renderBindings();
}

function saveBinding(gameId) {
    const card = document.querySelector(`[data-game-id="${gameId}"]`);
    if (!card) return;

    if (!gameBindings[gameId]) gameBindings[gameId] = {};
    const data = gameBindings[gameId];

    card.querySelectorAll('input, textarea').forEach(input => {
        const key = input.name;
        const value = input.value.trim();
        if (value) {
            data[key] = value;
        } else {
            delete data[key];
        }
    });

    const gameConfig = GAMES_CONFIG.find(g => g.id === gameId);
    const hasData = gameConfig.fields.some(f => data[f.key]);
    
    if (!hasData) {
        delete gameBindings[gameId];
    } else {
        data.lastSync = new Date().toISOString();
        gameBindings[gameId] = data;
    }

    editingGames.delete(gameId);
    localStorage.setItem(STORAGE_KEY_BINDINGS, JSON.stringify(gameBindings));
    showToast(hasData ? '保存成功' : '已清空', 'success');
    renderBindings();
}

function deleteBinding(gameId) {
    if (!confirm('确定要删除此游戏的绑定信息吗？此操作无法撤销。')) return;
    delete gameBindings[gameId];
    localStorage.setItem(STORAGE_KEY_BINDINGS, JSON.stringify(gameBindings));
    editingGames.delete(gameId);
    showToast('已删除绑定', 'info');
    renderBindings();
}

async function syncSteamData(gameId) {
    const data = gameBindings[gameId];
    if (!data || !data.steamId) {
        showToast('请先填写 SteamID64', 'error');
        return;
    }

    const card = document.querySelector(`[data-game-id="${gameId}"]`);
    const syncBtn = card ? card.querySelector('.btn-sync') : null;
    if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 同步中...';
    }

    showToast('正在从 Steam 公开资料同步...', 'info');

    const steamXmlUrl = `https://steamcommunity.com/profiles/${encodeURIComponent(data.steamId)}/?xml=1`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(steamXmlUrl)}`;

    let text = null;
    for (const url of [steamXmlUrl, proxyUrl]) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                text = await response.text();
                break;
            }
        } catch (e) {
            continue;
        }
    }

    if (!text) {
        showToast('Steam 同步失败（CORS限制），请手动填写 Steam 资料', 'error', 4000);
        if (syncBtn) {
            syncBtn.disabled = false;
            syncBtn.innerHTML = '<i class="fas fa-sync"></i> 同步Steam';
        }
        return;
    }

    try {
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const parseError = xml.querySelector('parsererror');
        if (parseError) throw new Error('解析失败');

        const steamName = getXmlText(xml, 'steamID');
        const avatarFull = getXmlText(xml, 'avatarFull');
        const profileUrl = getXmlText(xml, 'profileURL');
        const summary = getXmlText(xml, 'summary');

        if (steamName) data.steamName = steamName;
        if (avatarFull) data.avatarUrl = avatarFull;
        if (profileUrl) data.profileUrl = profileUrl;
        if (summary && !data.note) data.note = summary;
        data.lastSync = new Date().toISOString();

        localStorage.setItem(STORAGE_KEY_BINDINGS, JSON.stringify(gameBindings));
        showToast('Steam 同步成功', 'success');
        renderBindings();
    } catch (e) {
        console.error('Steam sync error:', e);
        showToast('Steam 数据解析失败，请手动填写', 'error');
        if (syncBtn) {
            syncBtn.disabled = false;
            syncBtn.innerHTML = '<i class="fas fa-sync"></i> 同步Steam';
        }
    }
}

function getXmlText(xml, tag) {
    const el = xml.querySelector(tag);
    return el ? el.textContent.trim() : '';
}

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    } catch (e) {
        return iso;
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showToast(message, type = 'info', duration = 2800) {
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());

    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i> <span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}