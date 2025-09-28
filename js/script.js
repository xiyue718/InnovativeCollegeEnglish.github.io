// 全局变量存储数据
let unitsData = [];
let currentPage = 1;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 从外部JSON文件加载数据
    loadData();
});

// 从外部JSON文件加载数据
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        const data = await response.json();
        unitsData = data.units;
        
        // 隐藏加载消息
        document.getElementById('loadingMessage').style.display = 'none';
        
        // 生成单元导航
        generateUnitNavigation();
        
        // 生成单元卡片
        generateUnitCards();
        
        // 生成分页
        generatePagination();
        
        // 显示第一页
        showPage(1);
        
        // 检查URL参数并跳转到相应部分
        checkUrlParams();
        
        // 添加事件监听器
        setupEventListeners();
        
        // 更新跳转表单的最大值
        updateJumpFormMaxValues();
    } catch (error) {
        console.error('加载数据时出错:', error);
        document.getElementById('loadingMessage').innerHTML = 
            '<i class="fas fa-exclamation-triangle"></i> 加载数据失败，请刷新页面重试';
    }
}

// 生成分页
function generatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    unitsData.forEach((unit, index) => {
        const button = document.createElement('button');
        button.textContent = `单元 ${unit.id}`;
        button.dataset.page = index + 1;
        if (index === 0) {
            button.classList.add('active');
        }
        pagination.appendChild(button);
    });
}

// 显示指定页
function showPage(page) {
    currentPage = page;
    
    // 更新分页按钮状态
    document.querySelectorAll('#pagination button').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.page) === page) {
            btn.classList.add('active');
        }
    });
    
    // 显示/隐藏单元卡片
    document.querySelectorAll('.unit-card').forEach((card, index) => {
        if (index + 1 === page) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// 更新跳转表单的最大值
function updateJumpFormMaxValues() {
    const unitInput = document.getElementById('unitInput');
    const topicInput = document.getElementById('topicInput');
    const partInput = document.getElementById('partInput');
    
    if (unitsData.length > 0) {
        unitInput.max = unitsData.length;
        
        // 设置默认值为第一个单元
        unitInput.value = 1;
        
        // 更新主题和部分的最大值
        updateTopicAndPartMaxValues(1);
    }
}

// 更新主题和部分的最大值
function updateTopicAndPartMaxValues(unitId) {
    const topicInput = document.getElementById('topicInput');
    const partInput = document.getElementById('partInput');
    
    const unit = unitsData.find(u => u.id === unitId);
    if (unit && unit.themes.length > 0) {
        topicInput.max = unit.themes.length;
        topicInput.value = 1;
        
        const theme = unit.themes[0];
        if (theme && theme.parts.length > 0) {
            partInput.max = theme.parts.length;
            partInput.value = 1;
        }
    }
}

// 生成单元导航
function generateUnitNavigation() {
    const unitNav = document.getElementById('unitNav');
    unitNav.innerHTML = ''; // 清空现有内容
    
    unitsData.forEach(unit => {
        const button = document.createElement('button');
        button.className = 'unit-nav-btn';
        button.textContent = `单元 ${unit.id}: ${unit.title}`;
        button.dataset.unitId = unit.id;
        unitNav.appendChild(button);
    });
}

// 生成单元卡片
function generateUnitCards() {
    const unitsContainer = document.getElementById('unitsContainer');
    unitsContainer.innerHTML = ''; // 清空现有内容
    
    unitsData.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card';
        card.id = `unit-${unit.id}`;
        card.dataset.unitId = unit.id;
        
        // 生成主题内容
        let themesHTML = '';
        unit.themes.forEach(theme => {
            let partsHTML = '';
            theme.parts.forEach(part => {
                let contentHTML = '';
                
                // 根据part类型生成不同内容
                if (part.type === 'numbered') {
                    // 编号句子类型
                    let sentencesHTML = '';
                    part.sentences.forEach(sentence => {
                        sentencesHTML += `
                            <div class="sentence-item">
                                <p class="english-text">${sentence.id}. ${sentence.english}</p>
                                <p class="chinese-text">${sentence.chinese}</p>
                                ${sentence.audio ? `
                                <div class="audio-player">
                                    <audio controls>
                                        <source src="${sentence.audio}" type="audio/mpeg">
                                        您的浏览器不支持音频元素。
                                    </audio>
                                </div>
                                ` : ''}
                            </div>
                        `;
                    });
                    contentHTML = `<div class="sentences-container">${sentencesHTML}</div>`;
                    
                } else if (part.type === 'dialogue') {
                    // 对话类型
                    let dialogueHTML = '';
                    part.content.forEach(item => {
                        dialogueHTML += `
                            <div class="dialogue-item">
                                <div>
                                    <span class="speaker">${item.speaker}:</span>
                                    <span class="english-text">${item.text}</span>
                                </div>
                                <p class="chinese-text">${item.translation}</p>
                                ${item.audio ? `
                                <div class="audio-player">
                                    <audio controls>
                                        <source src="${item.audio}" type="audio/mpeg">
                                        您的浏览器不支持音频元素。
                                    </audio>
                                </div>
                                ` : ''}
                            </div>
                        `;
                    });
                    contentHTML = `<div class="dialogue-container">${dialogueHTML}</div>`;
                    
                } else if (part.type === 'article') {
                    // 文章类型
                    contentHTML = `
                        <div class="article-container">
                            <p class="article-english">${part.content.english}</p>
                            <p class="article-chinese">${part.content.chinese}</p>
                            ${part.content.audio ? `
                            <div class="audio-player">
                                <audio controls>
                                    <source src="${part.content.audio}" type="audio/mpeg">
                                    您的浏览器不支持音频元素。
                                </audio>
                            </div>
                            ` : ''}
                        </div>
                    `;
                } else if (part.type === 'vocabulary') {
                    // 单词列表类型
                    let vocabHTML = '';
                    if (part.vocabulary && part.vocabulary.length > 0) {
                        part.vocabulary.forEach(vocab => {
                            vocabHTML += `
                                <div class="vocab-item">
                                    <div class="vocab-english">
                                        ${vocab.english}
                                        ${vocab.audio ? `
                                        <button class="play-vocab-btn" data-audio="${vocab.audio}">
                                            <i class="fas fa-volume-up"></i>
                                        </button>
                                        ` : ''}
                                    </div>
                                    <div class="vocab-chinese">${vocab.chinese}</div>
                                </div>
                            `;
                        });
                    }
                    contentHTML = `
                        <div class="vocab-list-container">
                            <div class="vocab-list-title">
                                <i class="fas fa-book"></i> ${part.title}
                            </div>
                            <div class="vocab-list">
                                ${vocabHTML}
                            </div>
                        </div>
                    `;
                } else if (part.type === 'conversation-sections') {
                    // 对话分区类型
                    let conversationSectionsHTML = '';
                    if (part.sections && part.sections.length > 0) {
                        part.sections.forEach(section => {
                            let sectionContentHTML = '';
                            
                            if (section.type === 'dialogue') {
                                // 对话内容
                                let dialogueHTML = '';
                                section.content.forEach(item => {
                                    dialogueHTML += `
                                        <div class="dialogue-item">
                                            <div>
                                                <span class="speaker">${item.speaker}:</span>
                                                <span class="english-text">${item.text}</span>
                                            </div>
                                            <p class="chinese-text">${item.translation}</p>
                                            ${item.audio ? `
                                            <div class="audio-player">
                                                <audio controls>
                                                    <source src="${item.audio}" type="audio/mpeg">
                                                    您的浏览器不支持音频元素。
                                                </audio>
                                            </div>
                                            ` : ''}
                                        </div>
                                    `;
                                });
                                sectionContentHTML = `<div class="dialogue-container">${dialogueHTML}</div>`;
                            } else if (section.type === 'numbered') {
                                // 编号句子
                                let sentencesHTML = '';
                                section.sentences.forEach(sentence => {
                                    sentencesHTML += `
                                        <div class="sentence-item">
                                            <p class="english-text">${sentence.id}. ${sentence.english}</p>
                                            <p class="chinese-text">${sentence.chinese}</p>
                                            ${sentence.audio ? `
                                            <div class="audio-player">
                                                <audio controls>
                                                    <source src="${sentence.audio}" type="audio/mpeg">
                                                    您的浏览器不支持音频元素。
                                                </audio>
                                            </div>
                                            ` : ''}
                                        </div>
                                    `;
                                });
                                sectionContentHTML = `<div class="sentences-container">${sentencesHTML}</div>`;
                            }
                            
                            conversationSectionsHTML += `
                                <div class="conversation-section">
                                    <div class="conversation-section-header">
                                        <span class="conversation-section-title">${section.title}</span>
                                        <button class="conversation-section-toggle">
                                            <i class="fas fa-chevron-down"></i>
                                        </button>
                                    </div>
                                    <div class="conversation-section-content">
                                        ${sectionContentHTML}
                                    </div>
                                </div>
                            `;
                        });
                    }
                    contentHTML = `<div class="conversation-sections">${conversationSectionsHTML}</div>`;
                }
                
                // 生成词汇内容（如果有，且不是单词列表类型）
                let vocabHTML = '';
                if (part.vocabulary && part.vocabulary.length > 0 && part.type !== 'vocabulary') {
                    let vocabItemsHTML = '';
                    part.vocabulary.forEach(vocab => {
                        vocabItemsHTML += `
                            <div class="vocab-item">
                                <div class="vocab-english">
                                    ${vocab.english}
                                    ${vocab.audio ? `
                                    <button class="play-vocab-btn" data-audio="${vocab.audio}">
                                        <i class="fas fa-volume-up"></i>
                                    </button>
                                    ` : ''}
                                </div>
                                <div class="vocab-chinese">${vocab.chinese}</div>
                            </div>
                        `;
                    });
                    
                    vocabHTML = `
                        <div class="vocab-section">
                            <div class="vocab-title">
                                <i class="fas fa-book"></i> New Words and Expressions
                            </div>
                            <div class="vocab-list">
                                ${vocabItemsHTML}
                            </div>
                        </div>
                    `;
                }
                
                partsHTML += `
                    <div class="part-section" id="part-${unit.id}-${theme.id}-${part.id}" 
                         data-unit-id="${unit.id}" data-theme-id="${theme.id}" data-part-id="${part.id}">
                        <div class="part-header">
                            <span class="part-title">Part ${part.id} ${part.title}</span>
                            <button class="part-toggle">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="part-content">
                            ${contentHTML}
                            ${vocabHTML}
                        </div>
                    </div>
                `;
            });
            
            themesHTML += `
                <div class="theme-section" id="theme-${unit.id}-${theme.id}" 
                     data-unit-id="${unit.id}" data-theme-id="${theme.id}">
                    <div class="theme-header">
                        <span class="theme-title">Topic ${theme.id} ${theme.title}</span>
                        <button class="theme-toggle">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    <div class="theme-content">
                        ${partsHTML}
                    </div>
                </div>
            `;
        });
        
        // 计算总部分数
        let totalParts = 0;
        unit.themes.forEach(theme => {
            totalParts += theme.parts.length;
        });
        
        card.innerHTML = `
            <div class="unit-header">
                <h2 class="unit-title">单元 ${unit.id}: ${unit.title}</h2>
                ${unit.subtitle ? `<p class="unit-subtitle">${unit.subtitle}</p>` : ''}
            </div>
            <div class="unit-content">
                ${themesHTML}
            </div>
            <div class="unit-footer">
                本单元包含 ${unit.themes.length} 个主题，共 ${totalParts} 个学习部分
            </div>
        `;
        
        unitsContainer.appendChild(card);
    });
}

// 检查URL参数
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const unitParam = urlParams.get('unit');
    const topicParam = urlParams.get('topic');
    const partParam = urlParams.get('part');
    
    if (unitParam) {
        const unitId = parseInt(unitParam);
        const topicId = topicParam ? parseInt(topicParam) : null;
        const partId = partParam ? parseInt(partParam) : null;
        
        if (unitId >= 1 && unitId <= unitsData.length) {
            // 延迟执行以确保DOM已完全加载
            setTimeout(() => {
                // 先显示对应的单元页面
                const unitIndex = unitsData.findIndex(u => u.id === unitId);
                if (unitIndex !== -1) {
                    showPage(unitIndex + 1);
                }
                
                if (partId && topicId) {
                    jumpToPart(unitId, topicId, partId);
                } else if (topicId) {
                    jumpToTheme(unitId, topicId);
                } else {
                    jumpToUnit(unitId);
                }
            }, 100);
        }
    }
}

// 跳转到指定单元
function jumpToUnit(unitId) {
    // 移除所有高亮
    document.querySelectorAll('.unit-card').forEach(card => {
        card.classList.remove('highlighted');
    });
    
    // 移除所有导航按钮激活状态
    document.querySelectorAll('.unit-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 高亮目标单元
    const targetUnit = document.getElementById(`unit-${unitId}`);
    if (targetUnit) {
        targetUnit.classList.add('highlighted');
        
        // 滚动到目标单元
        targetUnit.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // 激活对应的导航按钮
        const targetNavBtn = document.querySelector(`.unit-nav-btn[data-unit-id="${unitId}"]`);
        if (targetNavBtn) {
            targetNavBtn.classList.add('active');
        }
        
        // 更新URL但不刷新页面
        const newUrl = `${window.location.pathname}?unit=${unitId}`;
        window.history.replaceState(null, '', newUrl);
        
        // 更新跳转表单
        document.getElementById('unitInput').value = unitId;
        updateTopicAndPartMaxValues(unitId);
    }
}

// 跳转到指定主题
function jumpToTheme(unitId, themeId) {
    jumpToUnit(unitId);
    
    // 确保主题是展开的
    const themeElement = document.getElementById(`theme-${unitId}-${themeId}`);
    if (themeElement) {
        themeElement.classList.remove('collapsed');
        const icon = themeElement.querySelector('.theme-toggle i');
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
        
        // 更新URL但不刷新页面
        const newUrl = `${window.location.pathname}?unit=${unitId}&topic=${themeId}`;
        window.history.replaceState(null, '', newUrl);
        
        // 更新跳转表单
        document.getElementById('topicInput').value = themeId;
        updatePartMaxValues(unitId, themeId);
    }
}

// 更新部分的最大值
function updatePartMaxValues(unitId, themeId) {
    const partInput = document.getElementById('partInput');
    
    const unit = unitsData.find(u => u.id === unitId);
    if (unit) {
        const theme = unit.themes.find(t => t.id === themeId);
        if (theme && theme.parts.length > 0) {
            partInput.max = theme.parts.length;
            partInput.value = 1;
        }
    }
}

// 跳转到指定部分
function jumpToPart(unitId, themeId, partId) {
    jumpToTheme(unitId, themeId);
    
    // 确保部分是展开的
    const partElement = document.getElementById(`part-${unitId}-${themeId}-${partId}`);
    if (partElement) {
        // 展开部分内容
        partElement.classList.add('expanded');
        const icon = partElement.querySelector('.part-toggle i');
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
        
        // 高亮部分
        partElement.classList.add('highlighted');
        
        // 滚动到部分
        setTimeout(() => {
            partElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300);
        
        // 更新URL但不刷新页面
        const newUrl = `${window.location.pathname}?unit=${unitId}&topic=${themeId}&part=${partId}`;
        window.history.replaceState(null, '', newUrl);
        
        // 更新跳转表单
        document.getElementById('partInput').value = partId;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    document.getElementById('searchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const units = document.querySelectorAll('.unit-card');
        
        units.forEach(unit => {
            const text = unit.querySelector('.unit-content').textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                unit.style.display = 'block';
            } else {
                unit.style.display = 'none';
            }
        });
    });
    
    // 分页按钮点击事件
    document.getElementById('pagination').addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const page = parseInt(e.target.dataset.page);
            showPage(page);
        }
    });
    
    // 单元输入变化时更新主题和部分的最大值
    document.getElementById('unitInput').addEventListener('change', function() {
        const unitId = parseInt(this.value);
        if (unitId >= 1 && unitId <= unitsData.length) {
            updateTopicAndPartMaxValues(unitId);
        }
    });
    
    // 主题输入变化时更新部分的最大值
    document.getElementById('topicInput').addEventListener('change', function() {
        const unitId = parseInt(document.getElementById('unitInput').value);
        const themeId = parseInt(this.value);
        if (unitId && themeId) {
            updatePartMaxValues(unitId, themeId);
        }
    });
    
    // 快速跳转功能
    document.getElementById('jumpBtn').addEventListener('click', function() {
        const unitId = parseInt(document.getElementById('unitInput').value);
        const topicId = parseInt(document.getElementById('topicInput').value);
        const partId = parseInt(document.getElementById('partInput').value);
        
        if (unitId >= 1 && unitId <= unitsData.length) {
            if (partId && topicId) {
                jumpToPart(unitId, topicId, partId);
            } else if (topicId) {
                jumpToTheme(unitId, topicId);
            } else {
                jumpToUnit(unitId);
            }
        } else {
            alert(`请输入有效的单元编号 (1-${unitsData.length})`);
        }
    });
    
    // 单元导航按钮
    document.querySelectorAll('.unit-nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const unitId = parseInt(this.dataset.unitId);
            const unitIndex = unitsData.findIndex(u => u.id === unitId);
            if (unitIndex !== -1) {
                showPage(unitIndex + 1);
                jumpToUnit(unitId);
            }
        });
    });
    
    // 主题折叠/展开功能
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('theme-toggle') || 
            e.target.parentElement.classList.contains('theme-toggle')) {
            
            const toggleBtn = e.target.classList.contains('theme-toggle') ? 
                             e.target : e.target.parentElement;
            const themeSection = toggleBtn.closest('.theme-section');
            
            themeSection.classList.toggle('collapsed');
            
            const icon = toggleBtn.querySelector('i');
            if (themeSection.classList.contains('collapsed')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
            } else {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
            }
        }
        
        // 部分折叠/展开功能
        if (e.target.classList.contains('part-toggle') || 
            e.target.parentElement.classList.contains('part-toggle')) {
            
            const toggleBtn = e.target.classList.contains('part-toggle') ? 
                             e.target : e.target.parentElement;
            const partSection = toggleBtn.closest('.part-section');
            
            partSection.classList.toggle('expanded');
            
            const icon = toggleBtn.querySelector('i');
            if (partSection.classList.contains('expanded')) {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
            }
        }
        
        // 对话分区折叠/展开功能
        if (e.target.classList.contains('conversation-section-toggle') || 
            e.target.parentElement.classList.contains('conversation-section-toggle')) {
            
            const toggleBtn = e.target.classList.contains('conversation-section-toggle') ? 
                             e.target : e.target.parentElement;
            const conversationSection = toggleBtn.closest('.conversation-section');
            
            conversationSection.classList.toggle('collapsed');
            
            const icon = toggleBtn.querySelector('i');
            if (conversationSection.classList.contains('collapsed')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
            } else {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
            }
        }
        
        // 词汇音频播放功能
        if (e.target.classList.contains('play-vocab-btn') || 
            e.target.parentElement.classList.contains('play-vocab-btn')) {
            
            const playBtn = e.target.classList.contains('play-vocab-btn') ? 
                           e.target : e.target.parentElement;
            const audioSrc = playBtn.getAttribute('data-audio');
            if (audioSrc) {
                const audioElement = new Audio(audioSrc);
                audioElement.play();
            }
        }
    });
}