import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * We'll keep a simple in-memory map of user sessions so each Discord user
 * maintains their own 'chatId' for talking to Debra. 
 * That means each Discord user has a unique conversation with Debra.
 */
const sessions = {};
const lastAnalysisTimestamps = {}; // Store the last timestamp for each project

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
 * Create a new Discord bot client with necessary intents for reading messages.
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/**
 * When the bot starts, log a message to console
 */
client.on('ready', () => {
  console.log(`Discord bot is logged in as ${client.user.tag}`);
  startAnalysisMonitor(); // Start monitoring for analysis updates
});

/**
 * Monitor analysis updates and send them to a designated channel
 */
const startAnalysisMonitor = async () => {
    const channelId = process.env.DISCORD_CHANNEL_ID; // Specify your target channel ID
    const interval = 5 * 60 * 1000; // Check every 5 minutes
  
    // Fetch the latest data immediately upon bot start
    await fetchAndSendAnalysisUpdates(channelId);
  
    // Then set an interval to repeatedly fetch updates
    setInterval(() => {
      fetchAndSendAnalysisUpdates(channelId);
    }, interval);
  };
  
  /**
   * Fetch and send the latest analysis updates to the specified channel.
   */
  const fetchAndSendAnalysisUpdates = async (channelId) => {
    for (const project of projects) {
      try {
        const res = await fetch(`http://localhost:3000/api/project-analysis/${project.name}`);
        if (!res.ok) {
          console.error(`Failed to fetch analysis for ${project.name}`);
          continue;
        }
        const data = await res.json();
  
        const lastUpdated = new Date(data.lastUpdated);
        if (
          !lastAnalysisTimestamps[project.name] || 
          new Date(lastAnalysisTimestamps[project.name]) < lastUpdated
        ) {
          // New analysis found
          lastAnalysisTimestamps[project.name] = lastUpdated.toISOString();
          
          // Send message to designated Discord channel
          const channel = await client.channels.fetch(channelId);
          if (channel && channel.isTextBased()) {
            await channel.send(
              `**New analysis for ${project.name}:**\n${data.analysis}`
            );
          }
        }
      } catch (error) {
        console.error(`Error monitoring analysis for ${project.name}:`, error);
      }
    }
  };
  

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
 * Listen for messages. We'll use a simple prefix "!debra " for now.
 * E.g., user types: "!debra Hello Debra"
 */
client.on('messageCreate', async (message) => {
  // Ignore bot messages or empty content
  if (message.author.bot) return;
  if (!message.content.startsWith('!debra ')) return;

  // Extract the user input after "!debra "
  const userInput = message.content.slice('!debra '.length).trim();

  // Guess the project name
  let projectName = guessProject(userInput);
  if (!projectName) {
    await message.reply(
      `I couldn't determine which project you're talking about. Please specify the project by using one of the following: ${projects
        .map((p) => p.name)
        .join(', ')}`
    );
    return;
  }

  // Check if we already have a chat session for this Discord user
  let chatId = sessions[message.author.id];

  // If no session yet, request a new chatId from /api/startChat/debra
  if (!chatId) {
    try {
      const startRes = await fetch('http://localhost:3000/api/startChat/debra');
      if (!startRes.ok) {
        await message.reply("Failed to start chat with Debra. Please try again later.");
        return;
      }
      const startData = await startRes.json();
      chatId = startData.chatId;
      sessions[message.author.id] = chatId; // Save for subsequent messages
    } catch (error) {
      console.error(error);
      await message.reply("Error connecting to Debra. Please try again later.");
      return;
    }
  }

  // Prepare body data for the API request
  const bodyData = {
    chatId,
    projectName,
    inputText: userInput,
  };

  try {
    const res = await fetch('http://localhost:3000/api/debra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    if (!res.ok) {
      throw new Error('Failed to call /api/debra');
    }
    const data = await res.json();
    // data.message is Debra's response
    await message.reply(data.message);
  } catch (error) {
    console.error(error);
    await message.reply("Debra is not responding right now. Please try again later.");
  }
});

// Finally, log in using the bot token from .env
client.login(process.env.DISCORD_BOT_TOKEN);
