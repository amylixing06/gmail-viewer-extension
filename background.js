// 处理 OAuth 认证
chrome.identity.getAuthToken({ interactive: true }, function(token) {
  if (chrome.runtime.lastError) {
    console.error('获取令牌错误:', chrome.runtime.lastError);
    return;
  }
  
  if (!token) {
    console.error('未获取到令牌');
    return;
  }
  
  console.log('成功获取令牌:', token);
  
  // 将 token 存储到 chrome.storage
  chrome.storage.local.set({ 'gmailToken': token }, function() {
    if (chrome.runtime.lastError) {
      console.error('Token 存储失败:', chrome.runtime.lastError);
      return;
    }
    console.log('Token 已存储');
  });
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  
  if (request.type === 'GET_TOKEN') {
    // 从存储中获取 token
    chrome.storage.local.get(['gmailToken'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('获取存储的令牌失败:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError });
        return;
      }
      
      if (!result.gmailToken) {
        console.log('存储中没有令牌，尝试重新获取');
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
          if (chrome.runtime.lastError) {
            console.error('重新获取令牌失败:', chrome.runtime.lastError);
            sendResponse({ error: chrome.runtime.lastError });
            return;
          }
          
          if (!token) {
            console.error('重新获取令牌为空');
            sendResponse({ error: '未获取到授权令牌' });
            return;
          }
          
          chrome.storage.local.set({ 'gmailToken': token }, function() {
            if (chrome.runtime.lastError) {
              console.error('存储新令牌失败:', chrome.runtime.lastError);
              sendResponse({ error: chrome.runtime.lastError });
              return;
            }
            console.log('新令牌已存储');
            sendResponse({ token: token });
          });
        });
        return true;
      }
      
      console.log('返回存储的令牌');
      sendResponse({ token: result.gmailToken });
    });
    return true;
  }
  
  if (request.type === 'REFRESH_TOKEN') {
    console.log('刷新令牌');
    // 直接获取新令牌，不需要清除缓存
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        console.error('刷新令牌失败:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError });
        return;
      }
      
      if (!token) {
        console.error('刷新后的令牌为空');
        sendResponse({ error: '未获取到授权令牌' });
        return;
      }
      
      chrome.storage.local.set({ 'gmailToken': token }, function() {
        if (chrome.runtime.lastError) {
          console.error('存储刷新后的令牌失败:', chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError });
          return;
        }
        console.log('刷新后的令牌已存储');
        sendResponse({ token: token });
      });
    });
    return true;
  }
}); 