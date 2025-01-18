import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";
import { handleErza, handleMathias, handleAria, handleDebra } from "./handlers.js";
import fs from "fs";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://fluxpad.org"
  ],
  credentials: true
}));

const conversationContexts = {};

function generateChatId() {
  return crypto.randomBytes(16).toString("hex");
}

function getOrCreateContext(chatId) {
  if (!conversationContexts[chatId]) {
    conversationContexts[chatId] = [];
  }
  return conversationContexts[chatId];
}

function createMockRequest(body) {
  return { body };
}

function createMockResponse() {
  const res = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.data = data;
      return this;
    },
  };
  return res;
}

app.get("/api/startChat/:agent", (req, res) => {
  const { agent } = req.params;
  const validAgents = ["erza", "mathias", "aria", "debra"];
  if (!validAgents.includes(agent.toLowerCase())) {
    return res.status(400).json({ error: `Invalid agent name: ${agent}` });
  }
  const chatId = generateChatId();
  conversationContexts[chatId] = [];
  return res.json({ chatId });
});

app.post("/api/erza", async (req, res) => {
  try {
    const { chatId, message } = req.body;
    if (!chatId || !message) {
      return res.status(400).json({ error: "Missing chatId or message." });
    }
    const context = getOrCreateContext(chatId);
    const mockReq = createMockRequest({ parameters: message, context: context.slice(-6) });
    const mockRes = createMockResponse();
    await handleErza(mockReq, mockRes);
    context.push(
      { role: "user", content: message },
      { role: "assistant", content: mockRes.data.message }
    );
    return res.json({ message: mockRes.data.message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/mathias", async (req, res) => {
  try {
    const { chatId, message } = req.body;
    if (!chatId || !message) {
      return res.status(400).json({ error: "Missing chatId or message." });
    }
    const context = getOrCreateContext(chatId);
    const mockReq = createMockRequest({ parameters: message, context: context.slice(-6) });
    const mockRes = createMockResponse();
    await handleMathias(mockReq, mockRes);
    context.push(
      { role: "user", content: message },
      { role: "assistant", content: mockRes.data.message }
    );
    return res.json({ message: mockRes.data.message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/aria", async (req, res) => {
    try {
        const { chatId, inputText, operation } = req.body;
        if (!chatId || !inputText || !operation) {
            return res.status(400).json({ error: "Missing chatId, inputText, or operation." });
        }
        if (!["createNFT", "question"].includes(operation)) {
            return res.status(400).json({ error: "Invalid operation. Use 'createNFT' or 'question'." });
        }

        const context = getOrCreateContext(chatId);
        console.log(chatId, inputText, operation);

        const mockReq = createMockRequest({
            operation,
            inputText,
            context: context.slice(-6),
        });

        const mockRes = createMockResponse();

        // Call the Aria handler
        await handleAria(mockReq, mockRes);

        const { message, imageUrl } = mockRes.data;

        // Store context
        context.push(
            { role: "user", content: inputText },
            { role: "assistant", content: message }
        );

        // Return the message and optionally the image URL if provided
        return res.json({
            message,
            ...(imageUrl && { imageUrl }), // Include imageUrl only if it exists
        });
    } catch (error) {
        console.error("Error handling Aria request:", error);
        return res.status(500).json({ error: "Server error" });
    }
});


app.post("/api/debra", async (req, res) => {
    try {
      const { chatId, inputText, projectName } = req.body;
  
      if (!chatId || !inputText || !projectName) {
        return res.status(400).json({ error: "Missing chatId, inputText, or projectName." });
      }
  
      // Load necessary files and data
      const projectsPath = "./projects.json";
      const knowledgePath = `./knowledge/${projectName.toLowerCase()}.json`;
      const candlesPath = `./project_candles/${projectName.toLowerCase()}.json`;
  
      let projectKnowledge = "";
      let candleData = null;
      let tradingPair = null;
      let lastRecordedPrice = null;
  
      // Check if projects database exists
      if (!fs.existsSync(projectsPath)) {
        return res.status(500).json({ error: "Projects database not found." });
      }
  
      // Load project from projects.json
      const projects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
      const project = projects.find(
        (p) => p.name.toLowerCase() === projectName.toLowerCase()
      );
  
      if (!project) {
        return res.status(404).json({ error: `Project '${projectName}' not found.` });
      }
  
      // Load knowledge file if it exists
      if (fs.existsSync(knowledgePath)) {
        const knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
        projectKnowledge = `Here is the known information about ${projectName}: ${JSON.stringify(knowledgeData)}`;
      }
  
      // Load candle data if it exists
      if (fs.existsSync(candlesPath)) {
        try {
          const candleFileData = JSON.parse(fs.readFileSync(candlesPath, "utf8"));
          tradingPair = candleFileData.pair || { base: "", quote: "" };
  
          candleData = {
            "1m": Array.isArray(candleFileData["1m"]) ? candleFileData["1m"] : [],
            "1h": Array.isArray(candleFileData["1h"]) ? candleFileData["1h"] : [],
            "1d": Array.isArray(candleFileData["1d"]) ? candleFileData["1d"] : [],
            "5d": Array.isArray(candleFileData["5d"]) ? candleFileData["5d"] : []
          };
  
          // Determine the last recorded price
          if (candleData["1m"].length > 0) {
            lastRecordedPrice = candleData["1m"][candleData["1m"].length - 1].close;
          } else if (candleData["1h"].length > 0) {
            lastRecordedPrice = candleData["1h"][candleData["1h"].length - 1].close;
          } else if (candleData["1d"].length > 0) {
            lastRecordedPrice = candleData["1d"][candleData["1d"].length - 1].close;
          } else if (candleData["5d"].length > 0) {
            lastRecordedPrice = candleData["5d"][candleData["5d"].length - 1].close;
          }
        } catch (error) {
          console.error(`Invalid candle data for '${projectName}'.`);
          tradingPair = { base: "", quote: "" };
          candleData = { "1m": [], "1h": [], "1d": [], "5d": [] };
        }
      }
  
      // Get or create context for the chat
      const context = getOrCreateContext(chatId);
  
      // Create mock request for Debra
      const mockReq = createMockRequest({
        specificProject: projectName,
        inputText,
        projectKnowledge,
        candleData,
        tradingPair,
        lastRecordedPrice,
        context: context.slice(-6) // Limit to last 6 messages for context
      });
  
      const mockRes = createMockResponse();
      await handleDebra(mockReq, mockRes);
  
      // Update context
      context.push(
        { role: "user", content: inputText },
        { role: "assistant", content: mockRes.data.message }
      );
  
      // Send response back to the client
      return res.json({ message: mockRes.data.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  
  const analysisFilePath = "./project_analyses.json";
const projectsFilePath = "./projects.json";

// Function to perform analysis
// Ensure the analysis file exists
if (!fs.existsSync(analysisFilePath)) {
    fs.writeFileSync(analysisFilePath, JSON.stringify({}));
  }
  
  // Helper function to load JSON data
  const loadJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
  const saveJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  // Function to perform analysis
  const performAnalysis = async () => {
    const projects = loadJSON(projectsFilePath); // Load project data
    const projectAnalyses = loadJSON(analysisFilePath); // Load existing analyses
  
    for (const project of projects) {
      const { name: projectName } = project;
      const candlesPath = `./project_candles/${projectName.toLowerCase()}.json`;
  
      if (!fs.existsSync(candlesPath)) {
        console.error(`Candle data not found for project: ${projectName}`);
        continue;
      }
  
      const candleData = JSON.parse(fs.readFileSync(candlesPath, "utf8"));
  
      // Prepare Debra request
      const mockReq = {
        body: {
          specificProject: projectName,
          inputText: "Make a short analysis speaking about the last recorded prices in the last 5m and if it means it is an up or down trend. It needs to be 2 sentences max and make it engaging and funny! Let's make it a bit like a size of a tweet",
          projectKnowledge: "",
          candleData: candleData["1m"] || [],
          tradingPair: candleData.pair || { base: "", quote: "" },
          lastRecordedPrice: candleData["1m"]?.slice(-1)[0]?.close || null,
          context: [],
          maxTokens: 80
        },
      };
  
      const mockRes = {
        json: (response) => {
          projectAnalyses[projectName] = {
            analysis: response.message,
            lastUpdated: new Date().toISOString(), // Store the timestamp of the analysis
          };
        },
      };
  
      try {
        console.log(`Generating analysis for ${projectName}...`);
        await handleDebra(mockReq, mockRes);
      } catch (error) {
        console.error(`Failed to analyze project ${projectName}:`, error);
      }
    }
  
    // Save updated analyses
    saveJSON(analysisFilePath, projectAnalyses);
  };
  
  
  // Run the analysis immediately upon server start
  (async () => {
    console.log("Performing initial analysis...");
    await performAnalysis();
  })();
  
  // Schedule analysis every 5 minutes
  setInterval(performAnalysis, 5 * 60 * 1000);
  
  app.get("/api/project-analysis/:projectName", (req, res) => {
    const { projectName } = req.params;
    const projectAnalyses = loadJSON(analysisFilePath);
  
    if (!projectAnalyses[projectName]) {
      return res.status(404).json({ error: `No analysis found for project: ${projectName}` });
    }
  
    return res.json({
      projectName,
      analysis: projectAnalyses[projectName].analysis,
      lastUpdated: projectAnalyses[projectName].lastUpdated, // Include the timestamp
    });
  });
  
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  