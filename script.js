// 1. ABLY CONFIGURATION (Working Key)
const ably = new Ably.Realtime('8O7-Xg.mZ9_9A:pYv6E7x7fE5u9K9u'); 
const channel = ably.channels.get('secure-chat-v3');

let myName = "";
let currentChatPartner = "";

// 2. LOGIN FUNCTION
function startApp() {
    const input = document.getElementById('username-input');
    if (input.value.trim() !== "") {
        myName = input.value.trim();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-screen').style.display = 'flex';
        document.getElementById('my-name-tag').textContent = "Logged in as: " + myName;
    } else {
        alert("Please enter your name!");
    }
}

// 3. CHAT REQUEST BHEJNA (Step 1)
function sendChatRequest() {
    const target = document.getElementById('target-user-input').value.trim();
    if (target !== "" && target !== myName) {
        channel.publish('request', { from: myName, to: target, type: 'chat-req' });
        document.getElementById('request-status').textContent = "Request sent to " + target + "... Waiting for them to accept.";
    } else {
        alert("Enter a valid friend's name!");
    }
}

// 4. MAIN LISTENER (Requests aur Messages ko sunna)
channel.subscribe((msg) => {
    const data = msg.data;

    // Chat Request Receive Hona (Step 2)
    if (msg.name === 'request' && data.to === myName && data.type === 'chat-req') {
        showRequestOverlay(data.from);
    }
    
    // Request ka Answer (Accept/Reject) (Step 3)
    if (msg.name === 'response' && data.to === myName) {
        if (data.status === 'accepted') {
            openChat(data.from);
        } else {
            alert(data.from + " rejected your request.");
            document.getElementById('request-status').textContent = "";
        }
    }

    // Sirf us bande ke messages dikhana jiske sath chat open hai
    if (msg.name === 'chat-msg') {
        if ((data.sender === currentChatPartner && data.receiver === myName) || 
            (data.sender === myName && data.receiver === currentChatPartner)) {
            displayMessage(data, data.sender === myName ? 'sent' : 'received');
        }
    }
});

// 5. REQUEST OVERLAY DIKHANA
function showRequestOverlay(fromName) {
    document.getElementById('request-overlay').style.display = 'flex';
    document.getElementById('requesting-user-name').textContent = fromName + " wants to chat with you!";
    
    document.getElementById('accept-req').onclick = () => {
        channel.publish('response', { from: myName, to: fromName, status: 'accepted' });
        document.getElementById('request-overlay').style.display = 'none';
        openChat(fromName);
    };
    
    document.getElementById('reject-req').onclick = () => {
        channel.publish('response', { from: myName, to: fromName, status: 'rejected' });
        document.getElementById('request-overlay').style.display = 'none';
    };
}

// 6. CHAT WINDOW KHOLNA
function openChat(partner) {
    currentChatPartner = partner;
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('chat-screen').style.display = 'flex';
    document.getElementById('chat-with-name').textContent = "Chatting with: " + partner;
    document.getElementById('chat-box').innerHTML = ""; // Purani chat clear karein
}

// 7. MESSAGE BHEJNA
function sendMessage() {
    const input = document.getElementById('user-input');
    if (input.value.trim() !== "") {
        channel.publish('chat-msg', { 
            text: input.value, 
            sender: myName, 
            receiver: currentChatPartner,
            type: 'text' 
        });
        input.value = "";
    }
}

// 8. MESSAGE DISPLAY KARNA
function displayMessage(data, type) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    msgDiv.textContent = data.text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 9. VOICE CALL SYSTEM (Simple Overlay)
function startVoiceCall() {
    document.getElementById('call-overlay').style.display = 'flex';
    document.getElementById('call-status').textContent = "Calling " + currentChatPartner + "...";
}

function endCall() {
    document.getElementById('call-overlay').style.display = 'none';
}

// 10. BACK BUTTON
function goBack() {
    document.getElementById('chat-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'flex';
    currentChatPartner = "";
    document.getElementById('request-status').textContent = "";
}