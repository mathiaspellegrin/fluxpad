import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
dotenv.config();

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const TWITTER_API_URL = 'https://api.twitter.com/1.1/statuses/update.json';
const XAI_API_KEY = process.env.XAI_API_KEY;

// OAuth 1.0a Credentials
const X_API_KEY = process.env.X_API_KEY; // Consumer Key
const X_API_SECRET_KEY = process.env.X_API_SECRET_KEY; // Consumer Secret
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN; // Access Token
const X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET; // Access Token Secret

/**
 * Load projects from projects.json
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

/**
 * Select a random project from the list
 */
const getRandomProject = (projects) => {
  const validProjects = projects.filter((p) => p.xAccount); // Exclude projects without xAccount
  if (validProjects.length === 0) return null;
  return validProjects[Math.floor(Math.random() * validProjects.length)];
};

/**
 * Generate a message using the xAI API
 */
const generateMessage = async (project) => {
  try {
    const payload = {
      model: "grok-2-latest",
      messages: [
        { role: "system", content: "You are an assistant generating concise social media posts." },
        {
          role: "user",
          content: `Provide a concise update about the project "${project.name}". Use their official X account @${project.xAccount} for reference.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    };

    console.log(`[DEBUG] Sending payload for project ${project.name}:`, payload);

    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to generate message for project ${project.name}:`, response.statusText, errorText);
      return null;
    }

    const data = await response.json();
    const message = data.choices[0].message.content;

    console.log(`[DEBUG] AI response for project ${project.name}:`, message);
    return message;
  } catch (error) {
    console.error(`Error generating message for project ${project.name}:`, error);
    return null;
  }
};

/**
 * Generate OAuth 1.0a Signature
 */
const generateOAuthSignature = (httpMethod, baseURL, params, consumerSecret, tokenSecret) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const signatureBaseString = [
    httpMethod.toUpperCase(),
    encodeURIComponent(baseURL),
    encodeURIComponent(sortedParams),
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
};

/**
 * Create OAuth 1.0a Authorization Header
 */
const createAuthorizationHeader = (params) => {
  return 'OAuth ' + Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(params[key])}"`)
    .join(', ');
};

/**
 * Post a tweet using OAuth 1.0a
 */
const postTweet = async (message) => {
  const oauthParams = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: '1.0',
    status: message,
  };

  // Generate OAuth signature
  oauthParams.oauth_signature = generateOAuthSignature(
    'POST',
    TWITTER_API_URL,
    oauthParams,
    X_API_SECRET_KEY,
    X_ACCESS_TOKEN_SECRET
  );

  // Create Authorization header
  const authorizationHeader = createAuthorizationHeader(oauthParams);

  try {
    const response = await fetch(TWITTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authorizationHeader,
      },
      body: `status=${encodeURIComponent(message)}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to post tweet:', response.statusText, errorText);
      return false;
    }

    console.log('Tweet posted successfully:', message);
    return true;
  } catch (error) {
    console.error('Error posting tweet:', error);
    return false;
  }
};

/**
 * Main function to handle a single random project
 */
const processRandomProject = async (projects) => {
  const project = getRandomProject(projects);
  if (!project) {
    console.log('No valid projects with X account found.');
    return;
  }

  console.log(`Processing project: ${project.name}`);
  const message = await generateMessage(project);
  if (!message) {
    console.warn(`No message generated for project ${project.name}.`);
    return;
  }

  const tweetPosted = await postTweet(message);
  if (!tweetPosted) {
    console.error(`Failed to post tweet for project ${project.name}.`);
  }
};

/**
 * Main function: Run once immediately and then every hour
 */
const main = async () => {
  const projects = loadProjects();
  if (projects.length === 0) {
    console.error('No projects found. Exiting...');
    return;
  }

  console.log('Starting Leo bot...');

  // Run immediately
  console.log('Running initial update...');
  await processRandomProject(projects);

  // Run every hour
  setInterval(async () => {
    console.log('Fetching updates and posting tweets...');
    await processRandomProject(projects);
  }, 60 * 60 * 1000);
};

// Start the bot
main();
