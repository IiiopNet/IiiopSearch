// DOM加载完成后执行
 document.addEventListener('DOMContentLoaded', function() {
     // 更新当前年份
     document.getElementById('current-year').textContent = new Date().getFullYear();
     
     // 获取DOM元素
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchEngineButton = document.getElementById('search-engine-button');
    const searchEngineMenu = document.getElementById('search-engine-menu');
    const currentEngineIcon = document.getElementById('current-engine-icon');
    const searchEngineOptions = document.querySelectorAll('.search-engine-option');
    
    // 从localStorage读取上次选择的搜索引擎
    let currentEngine = localStorage.getItem('selectedSearchEngine') || 'google';
    
    // 搜索引擎URL映射
    const searchEngineUrls = {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q='
    };
    
    // 搜索引擎名称映射
    const searchEngineNames = {
        google: 'Google',
        bing: 'Bing',
        duckduckgo: 'DuckDuckGo'
    };
    
    // 初始化当前搜索引擎图标和名称
    currentEngineIcon.src = `assets/icons/${currentEngine}.svg`;
    currentEngineIcon.alt = searchEngineNames[currentEngine];
     
     // 从URL参数中检查是否启用自定义搜索引擎功能
     function getUrlParameter(name) {
         name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
         const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
         const results = regex.exec(location.search);
         return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
     }
     
     // 检查URL参数enableCustomizeSearchingEngine是否为1
     const enableCustomEngines = getUrlParameter('enableCustomizeSearchingEngine') === '1';
     
     // 自定义搜索引擎相关功能（当enableCustomEngines为true时启用）
    if (enableCustomEngines) {
        // 自定义搜索引擎相关DOM元素
        const customEngineModal = document.getElementById('custom-engine-modal');
        const addCustomEngineOption = document.querySelector('.add-custom-engine');
        const closeModal = document.querySelector('.close');
        const cancelCustomEngine = document.getElementById('cancel-custom-engine');
        const saveCustomEngine = document.getElementById('save-custom-engine');
        const customEngineName = document.getElementById('custom-engine-name');
        const customEngineUrl = document.getElementById('custom-engine-url');
        
        // 移除hidden类以显示自定义搜索引擎相关元素
        addCustomEngineOption.classList.remove('hidden');
        customEngineModal.classList.remove('hidden');
        
        // 从localStorage获取自定义搜索引擎
        function getCustomSearchEngines() {
            const engines = localStorage.getItem('customSearchEngines');
            return engines ? JSON.parse(engines) : {};
        }
        
        // 保存自定义搜索引擎到localStorage
        function saveCustomSearchEngines(engines) {
            localStorage.setItem('customSearchEngines', JSON.stringify(engines));
        }
        
        // 加载自定义搜索引擎
        function loadCustomSearchEngines() {
            const customEngines = getCustomSearchEngines();
            
            // 合并内置和自定义搜索引擎
            for (const [id, engine] of Object.entries(customEngines)) {
                searchEngineUrls[id] = engine.url;
                searchEngineNames[id] = engine.name;
            }
            
            // 在下拉菜单中显示自定义搜索引擎
            displayCustomSearchEngines(customEngines);
        }
        
        // 在下拉菜单中显示自定义搜索引擎
        function displayCustomSearchEngines(engines) {
            // 首先移除现有的自定义搜索引擎选项
            const existingCustomOptions = document.querySelectorAll('.custom-search-engine');
            existingCustomOptions.forEach(option => option.remove());
            
            // 在"添加自定义搜索引擎"选项之前添加新的自定义搜索引擎选项
            for (const [id, engine] of Object.entries(engines)) {
                const option = document.createElement('div');
                option.className = 'search-engine-option custom-search-engine';
                option.dataset.engine = id;
                option.innerHTML = `
                    <span>${engine.name}</span>
                `;
                
                // 添加点击事件
                option.addEventListener('click', () => {
                    currentEngine = id;
                    // 更新当前搜索引擎图标（使用默认图标）
                    currentEngineIcon.src = `assets/icons/search.svg`;
                    currentEngineIcon.alt = engine.name;
                    // 保存选择到localStorage
                    localStorage.setItem('selectedSearchEngine', id);
                    // 关闭下拉菜单
                    searchEngineMenu.classList.remove('active');
                });
                
                // 插入到"添加自定义搜索引擎"选项之前
                addCustomEngineOption.parentNode.insertBefore(option, addCustomEngineOption);
            }
        }
        
        // 打开模态窗口
        function openModal() {
            customEngineModal.style.display = 'block';
        }
        
        // 关闭模态窗口
        function closeModalFunc() {
            customEngineModal.style.display = 'none';
            // 清空输入框
            customEngineName.value = '';
            customEngineUrl.value = '';
        }
        
        // 添加自定义搜索引擎
        function addCustomSearchEngine(name, url) {
            if (!name.trim() || !url.trim() || !url.includes('%s')) {
                alert('请输入有效的搜索引擎名称和包含%s的URL模板');
                return;
            }
            
            // 生成唯一ID
            const id = 'custom_' + Date.now();
            
            // 获取现有的自定义搜索引擎
            const customEngines = getCustomSearchEngines();
            
            // 添加新的自定义搜索引擎
            customEngines[id] = { name, url };
            
            // 保存到localStorage
            saveCustomSearchEngines(customEngines);
            
            // 更新内存中的映射
            searchEngineUrls[id] = url;
            searchEngineNames[id] = name;
            
            // 在下拉菜单中显示新的自定义搜索引擎
            displayCustomSearchEngines(customEngines);
            
            // 关闭模态窗口
            closeModalFunc();
        }
        
        // 加载自定义搜索引擎
        loadCustomSearchEngines();
        
        // 如果当前引擎是自定义的，更新UI以使用正确的图标
        if (currentEngine.startsWith('custom_')) {
            const customEngines = getCustomSearchEngines();
            if (customEngines[currentEngine]) {
                currentEngineIcon.src = `assets/icons/search.svg`;
                currentEngineIcon.alt = customEngines[currentEngine].name;
            }
        }
        
        // 打开模态窗口事件
        addCustomEngineOption.addEventListener('click', openModal);
        
        // 关闭模态窗口事件
        closeModal.addEventListener('click', closeModalFunc);
        cancelCustomEngine.addEventListener('click', closeModalFunc);
        
        // 点击模态窗口外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === customEngineModal) {
                closeModalFunc();
            }
        });
        
        // 保存自定义搜索引擎事件
        saveCustomEngine.addEventListener('click', () => {
            addCustomSearchEngine(customEngineName.value, customEngineUrl.value);
        });
    }
     
     // 切换搜索引擎下拉菜单
     searchEngineButton.addEventListener('click', () => {
         searchEngineMenu.classList.toggle('active');
     });
     
     // 点击搜索引擎选项切换当前搜索引擎
     searchEngineOptions.forEach(option => {
         option.addEventListener('click', () => {
             const engine = option.dataset.engine;
             currentEngine = engine;
             // 更新当前搜索引擎图标
            currentEngineIcon.src = `assets/icons/${engine}.svg`;
            currentEngineIcon.alt = searchEngineNames[engine];
            // 保存选择到localStorage
            localStorage.setItem('selectedSearchEngine', engine);
            // 关闭下拉菜单
            searchEngineMenu.classList.remove('active');
         });
     });
     
     // 点击页面其他地方关闭下拉菜单
     document.addEventListener('click', (e) => {
         if (!searchEngineButton.contains(e.target) && !searchEngineMenu.contains(e.target)) {
             searchEngineMenu.classList.remove('active');
         }
     });
     
     // 搜索历史记录相关
     const searchHistory = document.getElementById('search-history');
     const historyItems = document.getElementById('history-items');
     const clearHistoryButton = document.getElementById('clear-history');
     const searchWrapper = document.querySelector('.search-wrapper');
     
     // 从localStorage获取搜索历史记录
     function getSearchHistory() {
         const history = localStorage.getItem('searchHistory');
         return history ? JSON.parse(history) : [];
     }
     
     // 保存搜索历史记录到localStorage
     function saveSearchHistory(term) {
         if (!term.trim()) return;
         
         let history = getSearchHistory();
         // 移除重复项
         history = history.filter(item => item.term !== term);
         // 添加到开头
         history.unshift({ term, timestamp: Date.now() });
         // 只保留最近10条记录
         if (history.length > 10) {
             history = history.slice(0, 10);
         }
         localStorage.setItem('searchHistory', JSON.stringify(history));
     }
     
     // 显示搜索历史记录
     function displaySearchHistory() {
         const history = getSearchHistory();
         if (history.length === 0) {
             historyItems.innerHTML = '<p class="no-history">暂无搜索历史</p>';
             return;
         }
         
         historyItems.innerHTML = history.map(item => `
             <div class="history-item" data-term="${item.term}">
                 <span class="history-term">${item.term}</span>
                 <span class="history-timestamp">${new Date(item.timestamp).toLocaleDateString()}</span>
             </div>
         `).join('');
         
         // 为历史记录项添加点击事件
         document.querySelectorAll('.history-item').forEach(item => {
             item.addEventListener('click', () => {
                 const term = item.dataset.term;
                 searchInput.value = term;
                 performSearch();
             });
         });
     }
     
     // 清空搜索历史记录
     function clearSearchHistory() {
         localStorage.removeItem('searchHistory');
         displaySearchHistory();
     }
     
     // 显示/隐藏搜索历史记录面板
     function toggleSearchHistory() {
         const searchTerm = searchInput.value.trim();
         const history = getSearchHistory();
         
         // 如果搜索框有焦点且有历史记录，则始终显示历史记录
         if (searchInput === document.activeElement && history.length > 0) {
             searchHistory.classList.add('active');
             // 根据输入内容过滤历史记录
             filterHistoryItems(searchTerm);
         } else {
             searchHistory.classList.remove('active');
         }
     }
     
     // 根据搜索词过滤历史记录
     function filterHistoryItems(searchTerm) {
         const history = getSearchHistory();
         const historyElements = document.querySelectorAll('.history-item');
         
         if (!searchTerm) {
             // 如果搜索词为空，显示所有历史记录
             historyElements.forEach(element => {
                 element.style.display = 'flex';
             });
         } else {
             // 如果有搜索词，只显示匹配的历史记录
             historyElements.forEach((element, index) => {
                 if (history[index].term.toLowerCase().includes(searchTerm.toLowerCase())) {
                     element.style.display = 'flex';
                 } else {
                     element.style.display = 'none';
                 }
             });
         }
     }
     
     // 执行搜索
     function performSearch() {
         const searchTerm = searchInput.value.trim();
         if (searchTerm) {
             const searchUrl = searchEngineUrls[currentEngine] + encodeURIComponent(searchTerm);
             window.open(searchUrl, '_blank');
             // 保存搜索历史记录
             saveSearchHistory(searchTerm);
             // 刷新历史记录显示
             displaySearchHistory();
             // 执行搜索后隐藏历史记录面板
             searchHistory.classList.remove('active');
         }
     }
     
     // 按下回车键执行搜索
     searchInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') {
             performSearch();
         }
     });
     
     // 点击搜索按钮执行搜索
     document.getElementById('search-button').addEventListener('click', performSearch);
     
     // 输入时显示/隐藏搜索历史记录
     searchInput.addEventListener('input', toggleSearchHistory);
     
     // 聚焦搜索框时显示搜索历史记录
     searchInput.addEventListener('focus', toggleSearchHistory);
     
     // 点击页面其他地方隐藏搜索历史记录
     document.addEventListener('click', (e) => {
         if (!searchWrapper.contains(e.target)) {
             searchHistory.classList.remove('active');
         }
     });
     
     // 清空历史记录按钮点击事件
    clearHistoryButton.addEventListener('click', clearSearchHistory);
    
    // 初始化显示搜索历史记录
    displaySearchHistory();
});