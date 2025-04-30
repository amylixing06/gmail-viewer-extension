document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');
    
    // 创建标签页UI
    root.innerHTML = `
        <div style="padding: 16px;">
            <h1>Gmail查看器</h1>
            <div id="login-section" style="margin-bottom: 16px;">
                <button id="login-btn" style="padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    登录 Gmail
                </button>
            </div>
            <div id="content-section" style="display: none;">
                <div class="tabs">
                    <button id="tab-unread" class="active">未读邮件</button>
                    <button id="tab-codes">验证码</button>
                    <button id="tab-links">验证链接</button>
                </div>
                <div id="content" style="margin-top: 16px; min-height: 400px;">
                    <div id="loading">正在加载...</div>
                    <div id="results" style="display: none;"></div>
                </div>
            </div>
        </div>
    `;
    
    // 登录按钮点击事件
    document.getElementById('login-btn').addEventListener('click', function() {
        // 发送刷新令牌的消息
        chrome.runtime.sendMessage({ type: 'REFRESH_TOKEN' }, function(response) {
            if (response.error) {
                document.getElementById('loading').textContent = '授权错误: ' + response.error;
                return;
            }
            
            const token = response.token;
            if (!token) {
                document.getElementById('loading').textContent = '未获取到授权令牌';
                return;
            }
            
            // 登录成功，显示内容区域
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('content-section').style.display = 'block';
            
            // 默认加载未读邮件
            loadUnreadEmails(token);
            
            // 标签切换
            document.getElementById('tab-unread').addEventListener('click', () => loadUnreadEmails(token));
            document.getElementById('tab-codes').addEventListener('click', () => loadVerificationCodes(token));
            document.getElementById('tab-links').addEventListener('click', () => loadVerificationLinks(token));
        });
    });
    
    // 加载未读邮件
    function loadUnreadEmails(token) {
        setActiveTab('tab-unread');
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        
        fetch('https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread+in:inbox&maxResults=20', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.messages || data.messages.length === 0) {
                showResults('没有未读邮件');
                return;
            }
            
            // 获取邮件详情
            const promises = data.messages.map(msg => 
                fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(res => res.json())
            );
            
            Promise.all(promises).then(messages => {
                displayEmails(messages);
            });
        })
        .catch(error => {
            showResults('加载邮件出错: ' + error.message);
        });
    }
    
    // 加载验证码
    function loadVerificationCodes(token) {
        setActiveTab('tab-codes');
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        
        fetch('https://www.googleapis.com/gmail/v1/users/me/messages?q=验证码 OR verification code OR security code&maxResults=20', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.messages || data.messages.length === 0) {
                showResults('没有找到验证码');
                return;
            }
            
            // 获取邮件详情
            const promises = data.messages.map(msg => 
                fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(res => res.json())
            );
            
            Promise.all(promises).then(messages => {
                displayVerificationCodes(messages);
            });
        })
        .catch(error => {
            showResults('加载验证码出错: ' + error.message);
        });
    }
    
    // 加载验证链接
    function loadVerificationLinks(token) {
        setActiveTab('tab-links');
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        
        fetch('https://www.googleapis.com/gmail/v1/users/me/messages?q=verify OR confirm OR activate OR verification&maxResults=20', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.messages || data.messages.length === 0) {
                showResults('没有找到验证链接');
                return;
            }
            
            // 获取邮件详情
            const promises = data.messages.map(msg => 
                fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(res => res.json())
            );
            
            Promise.all(promises).then(messages => {
                displayVerificationLinks(messages);
            });
        })
        .catch(error => {
            showResults('加载验证链接出错: ' + error.message);
        });
    }
    
    // 显示邮件列表
    function displayEmails(messages) {
        const html = messages.map(msg => {
            const subject = getHeader(msg.payload.headers, 'Subject') || '(无主题)';
            const from = getHeader(msg.payload.headers, 'From') || '未知发件人';
            const date = new Date(parseInt(msg.internalDate)).toLocaleString();
            
            return `
                <div style="border: 1px solid #ddd; padding: 12px; margin-bottom: 8px; border-radius: 4px;">
                    <div style="font-weight: bold;">${subject}</div>
                    <div style="color: #666; font-size: 14px;">发件人: ${from}</div>
                    <div style="color: #888; font-size: 12px;">${date}</div>
                    <div style="margin-top: 8px;">
                        <a href="https://mail.google.com/mail/u/0/#inbox/${msg.id}" target="_blank">
                            在Gmail中查看
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
        showResults(html || '没有未读邮件');
    }
    
    // 显示验证码
    function displayVerificationCodes(messages) {
        const results = [];
        
        messages.forEach(msg => {
            const subject = getHeader(msg.payload.headers, 'Subject') || '(无主题)';
            const from = getHeader(msg.payload.headers, 'From') || '未知发件人';
            const date = new Date(parseInt(msg.internalDate)).toLocaleString();
            
            // 提取验证码
            let body = '';
            if (msg.payload.parts) {
                // 多部分邮件
                msg.payload.parts.forEach(part => {
                    if (part.mimeType === 'text/plain' && part.body.data) {
                        body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }
                });
            } else if (msg.payload.body.data) {
                // 单部分邮件
                body = atob(msg.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
            
            // 匹配验证码
            const patterns = [
                /验证码[：:\s]*([0-9]{4,8})/i,
                /验证码是[：:\s]*([0-9]{4,8})/i,
                /verification code[：:\s]*([0-9]{4,8})/i,
                /security code[：:\s]*([0-9]{4,8})/i,
                /code[：:\s]*([0-9]{4,8})/i,
                /([0-9]{4,8})[\s\n]+是您的验证码/i,
                /您的验证码是[：:\s]*([0-9]{4,8})/i,
                /your code is[：:\s]*([0-9]{4,8})/i
            ];
            
            let code = '';
            for (const pattern of patterns) {
                const match = body.match(pattern) || subject.match(pattern);
                if (match && match[1]) {
                    code = match[1];
                    break;
                }
            }
            
            if (!code) {
                // 尝试匹配任何4-8位数字
                const match = body.match(/\b([0-9]{4,8})\b/);
                if (match) code = match[1];
            }
            
            if (code) {
                results.push({ msg, subject, from, date, code });
            }
        });
        
        if (results.length === 0) {
            showResults('没有找到验证码');
            return;
        }
        
        const html = results.map(({ msg, subject, from, date, code }) => {
            return `
                <div style="border: 1px solid #ddd; padding: 12px; margin-bottom: 8px; border-radius: 4px;">
                    <div style="font-weight: bold;">${subject}</div>
                    <div style="color: #666; font-size: 14px;">发件人: ${from}</div>
                    <div style="margin: 8px 0; font-size: 20px; padding: 8px; background: #f5f5f5; font-family: monospace;">
                        ${code}
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <button class="copy-btn" data-code="${code}">复制验证码</button>
                        <a href="https://mail.google.com/mail/u/0/#inbox/${msg.id}" target="_blank">
                            在Gmail中查看
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
        showResults(html);
        
        // 添加复制功能
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                navigator.clipboard.writeText(code).then(() => {
                    this.textContent = '已复制!';
                    setTimeout(() => {
                        this.textContent = '复制验证码';
                    }, 2000);
                });
            });
        });
    }
    
    // 显示验证链接
    function displayVerificationLinks(messages) {
        const results = [];
        
        messages.forEach(msg => {
            const subject = getHeader(msg.payload.headers, 'Subject') || '(无主题)';
            const from = getHeader(msg.payload.headers, 'From') || '未知发件人';
            const date = new Date(parseInt(msg.internalDate)).toLocaleString();
            
            // 提取验证链接
            let body = '';
            if (msg.payload.parts) {
                // 多部分邮件
                msg.payload.parts.forEach(part => {
                    if (part.mimeType === 'text/plain' && part.body.data) {
                        body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }
                });
            } else if (msg.payload.body.data) {
                // 单部分邮件
                body = atob(msg.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
            
            // 匹配验证链接
            const patterns = [
                /(https?:\/\/[^\s]+verify[^\s]+)/i,
                /(https?:\/\/[^\s]+confirm[^\s]+)/i,
                /(https?:\/\/[^\s]+activate[^\s]+)/i,
                /(https?:\/\/[^\s]+verification[^\s]+)/i
            ];
            
            let link = '';
            for (const pattern of patterns) {
                const match = body.match(pattern);
                if (match && match[1]) {
                    link = match[1];
                    break;
                }
            }
            
            if (link) {
                results.push({ msg, subject, from, date, link });
            }
        });
        
        if (results.length === 0) {
            showResults('没有找到验证链接');
            return;
        }
        
        const html = results.map(({ msg, subject, from, date, link }) => {
            return `
                <div style="border: 1px solid #ddd; padding: 12px; margin-bottom: 8px; border-radius: 4px;">
                    <div style="font-weight: bold;">${subject}</div>
                    <div style="color: #666; font-size: 14px;">发件人: ${from}</div>
                    <div style="margin: 8px 0;">
                        <a href="${link}" target="_blank" style="word-break: break-all;">${link}</a>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <button class="copy-btn" data-link="${link}">复制链接</button>
                        <a href="https://mail.google.com/mail/u/0/#inbox/${msg.id}" target="_blank">
                            在Gmail中查看
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
        showResults(html);
        
        // 添加复制功能
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const link = this.getAttribute('data-link');
                navigator.clipboard.writeText(link).then(() => {
                    this.textContent = '已复制!';
                    setTimeout(() => {
                        this.textContent = '复制链接';
                    }, 2000);
                });
            });
        });
    }
    
    function getHeader(headers, name) {
        const header = headers.find(h => h.name === name);
        return header ? header.value : null;
    }
    
    function setActiveTab(tabId) {
        document.querySelectorAll('.tabs button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
    }
    
    function showResults(html) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('results').innerHTML = html;
    }
}); 