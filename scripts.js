/**
 * 横向滚动卡片组件 - 滚动触发翻面动画
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 页面加载时重置所有卡片状态（即使有缓存也会重置）
    resetCardStates();
    
    // 初始化卡片观察器
    initCardObserver();
});

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



// 添加页面可见性变化监听，确保页面刷新或重新聚焦时状态正确
window.addEventListener('visibilitychange', function() {
    // 页面重新可见时，可以选择性地执行某些操作
    if (document.visibilityState === 'visible') {
        console.log('页面重新可见');
    }
});

// 页面卸载前清理（可选）
window.addEventListener('beforeunload', function() {
    // 这里可以做一些清理工作
});