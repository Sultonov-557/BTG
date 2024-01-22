function sendMessage(chatID, text) {
  if (text == "") return;

  fetch("http://localhost/send", {
    method: "POST",
    body: JSON.stringify({ chatID, message: text }),
    headers: { "Content-Type": "application/json" },
  });
}

let currentChatID;

// Function to toggle between chat categories
function toggleCategory(category) {
  const categories = document.querySelectorAll(".chat-categories li");
  categories.forEach((item) => {
    item.classList.remove("active");
  });

  category.classList.add("active");
  // Here you can implement logic to display respective chats based on the selected category
  // For now, let's log the selected category to the console
  console.log(`Selected category: ${category.innerText}`);
}

// Function to toggle dark mode
function toggleDarkMode() {
  const app = document.querySelector(".messaging-app");
  document.querySelector("body").classList.toggle("dark-mode");
  app.classList.toggle("dark-mode");
}

// Function to fetch and display chats based on category
function fetchChats(category) {
  fetch(`http://localhost/${category}`)
    .then((response) => response.json())
    .then((data) => displayChats(data))
    .catch((error) => console.error("Error fetching chats:", error));
}

function fetchChat(chatID) {
  fetch(`http://localhost/chat/${chatID}`)
    .then((response) => response.json())
    .then((data) => displayChat(data))
    .catch((error) => console.error("Error fetching chats:", error));
}

// Function to display chats in the chat container
function displayChats(chats) {
  const chatContainer = document.getElementById("chats-container");
  chatContainer.innerHTML = ""; // Clear previous chats

  chats.forEach((chat) => {
    const chatName = chat.name;
    const lastMessage = chat.message;

    const chatElement = document.createElement("div");
    chatElement.className = "chat";

    const nameElement = document.createElement("div");
    nameElement.className = "chat-name";
    nameElement.innerText = chatName;

    const messageElement = document.createElement("div");
    messageElement.className = "last-message";
    messageElement.innerText = lastMessage;

    chatElement.appendChild(nameElement);
    chatElement.appendChild(messageElement);

    chatElement.addEventListener("click", handleChatClick);
    chatElement.dataset.chatId = chat.ID;

    chatContainer.appendChild(chatElement);
  });
}

function displayChat(messages) {
  const chatContainer = document.getElementById("chat-container");
  chatContainer.innerHTML = ""; // Clear previous chats

  messages.forEach((message) => {
    console.log(message);
    const name = message.sender;
    const text = message.message;

    const messageElement = document.createElement("div");
    messageElement.className = "message";

    const nameElement = document.createElement("div");
    nameElement.className = "sender";
    nameElement.innerText = name;

    const textElement = document.createElement("div");
    textElement.className = "text";
    textElement.innerText = text;

    messageElement.appendChild(nameElement);
    messageElement.appendChild(textElement);

    chatContainer.appendChild(messageElement);
  });
}

// Function to toggle between chat categories
function toggleCategory(category) {
  const categories = document.querySelectorAll(".chat-categories li");
  categories.forEach((item) => {
    item.classList.remove("active");
  });

  category.classList.add("active");
  fetchChats(category.dataset.chat); // Fetch chats based on the selected category
}

// Function to handle chat click event
function handleChatClick(event) {
  const chatId = event.currentTarget.dataset.chatId;
  currentChatID = chatId;
  showMessages(chatId);
}

function showMessages(chatID) {
  fetchChat(chatID);
}

sendBTN.onclick = () => {
  let text = sendTXT.value;
  sendMessage(currentChatID, text);
};
