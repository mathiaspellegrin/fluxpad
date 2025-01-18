import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * We'll keep a simple in-memory map of user sessions so each Telegram user
 * maintains their own 'chatId' for talking to Debra.
 */
const sessions = {};

/**
 * Load the list of projects from `projects.json`.
 */
const loadProjects = () => {
  try {
    const data = fs.readFileSync('./projects.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load projects.json:', error);
    return [];
  }
};

const projects = loadProjects();

/**
 * Initialize the Telegram bot.
 */
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

/**
 * Guess the project name mentioned in the user input.
 */
const guessProject = (userInput) => {
  for (const project of projects) {
    if (userInput.toLowerCase().includes(project.name.toLowerCase())) {
      return project.name; // Return the first match
    }
  }
  return null; // No match found
};

/**
 * Handle incoming messages.
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // Log incoming message details
  console.log(`[LOG] Received message from ${msg.chat.type} chat (ID: ${chatId})`);
  console.log(`[LOG] Sender: ${msg.from.username || msg.from.id}`);
  console.log(`[LOG] Message content: ${msg.text || '[No text]'}`);

  // Ignore messages without text
  if (!msg.text) {
    console.log('[INFO] Message ignored (no text).');
    return;
  }

  // Guess the project name
  const userInput = msg.text.trim();
  let projectName = guessProject(userInput);
  if (!projectName) {
    console.log('[INFO] Project not recognized. Prompting user for clarification.');
    await bot.sendMessage(
      chatId,
      `I couldn't determine which project you're talking about. Please specify one of the following: ${projects
        .map((p) => p.name)
        .join(', ')}`
    );
    return;
  }

  // Check if we already have a chat session for this user
  let chatIdSession = sessions[chatId];

  // If no session yet, request a new chatId from /api/startChat/debra
  if (!chatIdSession) {
    try {
      console.log('[INFO] No active session found. Requesting a new session.');
      const startRes = await fetch('http://localhost:3000/api/startChat/debra');
      if (!startRes.ok) {
        console.error('[ERROR] Failed to initialize chat session.');
        await bot.sendMessage(chatId, "Failed to start chat with Debra. Please try again later.");
        return;
      }
      const startData = await startRes.json();
      chatIdSession = startData.chatId;
      sessions[chatId] = chatIdSession; // Save for subsequent messages
    } catch (error) {
      console.error('[ERROR] Error initializing chat session:', error);
      await bot.sendMessage(chatId, "Error connecting to Debra. Please try again later.");
      return;
    }
  }

  // Prepare body data for the API request
  const bodyData = {
    chatId: chatIdSession,
    projectName,
    inputText: userInput,
  };

  try {
    console.log('[INFO] Sending user query to Debra API...');
    const res = await fetch('http://localhost:3000/api/debra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    if (!res.ok) {
      throw new Error('Failed to call /api/debra');
    }
    const data = await res.json();
    console.log('[INFO] Received response from Debra API.');
    // data.message is Debra's response
    await bot.sendMessage(chatId, data.message);
  } catch (error) {
    console.error('[ERROR] Error communicating with Debra API:', error);
    await bot.sendMessage(chatId, "Debra is not responding right now. Please try again later.");
  }
});

/**
 * Log errors.
 */
bot.on('polling_error', (error) => {
  console.error('[ERROR] Polling error:', error);
});
