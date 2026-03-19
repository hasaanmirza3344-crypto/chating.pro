// Nayi Working API Key
const ably = new Ably.Realtime('8O7-Xg.T9I5vA:Uj96P_Mv-m7G897n1O7p7L8u8N8m7K8u8L8j8k8'); 
const channel = ably.channels.get('chat-vfinal-secure');

let myName = "";
let currentPartner = "";

function startApp() {
    const input = document.getElementById('username-input');
    if (input.value.trim() !== "") {
        myName = input.value.trim();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-screen').style.display = 'flex';
        document.getElementById('my-name-tag').textContent = "User: " + myName;
    }
}

function sendChatRequest() {
    const target = document.getElementById('target-user-input').value.trim();
    if (target !== "" && target !== myName) {
        channel.publish('request', { from: myName, to: target });
        document.getElementById('request-status').textContent = "Request sent to " + target + "...";
    }
}

channel.subscribe((msg) => {
    const data = msg.data;
    if (msg.name === 'request' && data.to === myName) {
        showPopup(data.from);
    }
    if (msg.name === 'response' && data.to === myName && data.status === 'accepted') {
        openChat(data.from);
    }
    if (msg.name === 'chat-msg') {
        if ((data.to === myName && data.from === currentPartner) || (data.from === myName && data.to === currentPartner)) {
            displayMsg(data);
        }
    }
});

function showPopup(fromUser) {
    document.getElementById('request-overlay').style.display = 'flex';
    document.getElementById('requesting-user-name').textContent = fromUser + " wants to chat!";
    document.getElementById('accept-req').onclick = () => {
        channel.publish('response', { from: myName, to: fromUser, status: 'accepted' });
        document.getElementById('request-overlay').style.display = 'none';
        openChat(fromUser);
    };
    document.getElementById('reject-req').onclick = () => {
        document.getElementById('request-overlay').style.display = 'none';
    };
}

function openChat(partner) {
    currentPartner = partner;
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('chat-screen').style.display = 'flex';
    document.getElementById('chat-with-name').textContent = partner;
}

function sendMessage() {
    const input = document.getElementById('user-input');
    if (input.value.trim() !== "") {
        channel.publish('chat-msg', { from: myName, to: currentPartner, text: input.value });
        input.value = "";
    }
}

function displayMsg(data) {
    const chatBox = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = 'message ' + (data.from === myName ? 'sent' : 'received');
    div.textContent = data.text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function goBack() { location.reload(); }
