// Import required libraries
import readline from "readline";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Import your existing handlers
import { handleErza, handleMathias, handleAria, handleDebra } from "./handlers.js";

// Initialize the CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Map numeric choices to agent names
const agentChoices = {
    1: "erza",
    2: "mathias",
    3: "aria",
    4: "debra"
};

// Map agent names to their handlers
const agents = {
    erza: handleErza,
    mathias: handleMathias,
    aria: handleAria,
    debra: handleDebra
};

const askAgent = async () => {
    console.log("\nWhich agent would you like to interact with?");
    console.log("1) Erza");
    console.log("2) Mathias");
    console.log("3) Aria");
    console.log("4) Debra");

    rl.question("\nEnter a number (1-4): ", async (choice) => {
        const agentName = agentChoices[choice];
        if (!agentName || !agents[agentName]) {
            console.log("Invalid choice. Please choose a number between 1 and 4.");
            return askAgent();
        }

        const agentHandler = agents[agentName];
        let context = []; // Conversation context
        let ariaMode = null; // For Aria's 'createNFT' or 'question' modes

        // Mocked req/res so we can reuse your Express-style handlers
        const mockRequest = (body) => ({ body });
        const mockResponse = () => {
            const res = {
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.data = data;
                    // Print to console either an image URL or the textual response
                    if (data.image) {
                        console.log("Image URL:", data.image);
                    } else {
                        console.log("Response:", data.message);
                    }
                    return this;
                },
            };
            return res;
        };

        // Main interaction loop
        const interact = async () => {
            // === Aria Mode Handling ===
            if (agentName === "aria") {
                if (!ariaMode) {
                    rl.question("\nWhat do you want to do with Aria? (createNFT/question): ", async (mode) => {
                        if (mode !== "createNFT" && mode !== "question") {
                            console.log("Invalid mode. Choose 'createNFT' or 'question'.");
                            return interact();
                        }
                        ariaMode = mode;
                        interact();
                    });
                } else {
                    rl.question(`Enter your input for ${ariaMode}: `, async (message) => {
                        const req = mockRequest({
                            mode: ariaMode,
                            inputText: message,
                            context
                        });
                        const res = mockResponse();
                        await agentHandler(req, res);

                        // Update context
                        context.push(
                            { role: "user", content: message },
                            { role: "assistant", content: res.data.message }
                        );

                        interact();
                    });
                }
            }

            // === Debra Flow ===
            else if (agentName === "debra") {
                const selectProject = async () => {
                    rl.question("\nEnter the project name for Debra to analyze: ", async (projectName) => {
                        const projectsPath = "./projects.json";
                        const knowledgePath = `./knowledge/${projectName.toLowerCase()}.json`; 
                        const candlesPath = `./project_candles/${projectName.toLowerCase()}.json`; 
                        
                        let projectKnowledge = "";
                        let candleData = null;
                        let tradingPair = null;
                        let lastRecordedPrice = null;

                        if (!fs.existsSync(projectsPath)) {
                            console.log("Projects database (projects.json) not found.");
                            return askAgent();
                        }

                        // Load project from projects.json
                        const projects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
                        const project = projects.find(
                            (p) => p.name.toLowerCase() === projectName.toLowerCase()
                        );

                        if (!project) {
                            console.log(`Project '${projectName}' not found in projects.json. Please try again.`);
                            return selectProject();
                        }

                        // Load knowledge file if it exists
                        if (fs.existsSync(knowledgePath)) {
                            const knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
                            projectKnowledge = `Here is the known information about ${projectName}: ${JSON.stringify(knowledgeData)}`;
                            console.log(`Loaded knowledge for '${projectName}'.`);
                        } else {
                            console.log(`Knowledge file for project '${projectName}' not found.`);
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

                                console.log(`Loaded '1m', '1h', '1d', and '5d' candle data for '${projectName}'.`);
                            } catch (error) {
                                console.log(`Invalid candle data for '${projectName}'. Defaulting to empty data.`);
                                tradingPair = { base: "", quote: "" };
                                candleData = { "1m": [], "1h": [], "1d": [], "5d": [] };
                            }
                        } else {
                            tradingPair = { base: "", quote: "" };
                            candleData = { "1m": [], "1h": [], "1d": [], "5d": [] };
                            console.log(`Candle data for '${projectName}' not found.`);
                        }

                        console.log(`\nDebra is now ready to talk about '${projectName}'.`);

                        // Next, ask if user wants short-term trading analysis or normal chat
                        const askDebraMode = async () => {
                            rl.question("What do you want from Debra? (analysis/chat): ", async (debraMode) => {
                                if (debraMode !== "analysis" && debraMode !== "chat") {
                                    console.log("Invalid choice. Choose 'analysis' or 'chat'.");
                                    return askDebraMode();
                                }

                                if (debraMode === "analysis") {
                                    // Single prompt, no further interaction
                                    const analysisPrompt = `You are a witty and insightful crypto analyst. Provide a short-term analysis for the project "${projectName}" in a slightly humorous way. Keep it under 2 sentences. Tell if the trend is up or down on short term and speak about numbers.`;

                                    // Create a request object for Debra
                                    const req = mockRequest({
                                        // Pass the "analysisPrompt" as if the user typed it
                                        specificProject: projectName,
                                        projectKnowledge,
                                        candleData,
                                        tradingPair,
                                        lastRecordedPrice,
                                        context: [
                                            ...context.slice(-6),
                                            { role: "user", content: analysisPrompt }
                                        ]
                                    });

                                    const res = mockResponse();
                                    await agentHandler(req, res);

                                    // Return to main menu
                                    askAgent();
                                } else {
                                    // 'chat' mode, proceed with normal Q&A
                                    console.log(`Debra is now in chat mode for '${projectName}'.`);

                                    const askQuestion = async () => {
                                        rl.question(`\nEnter your question about '${projectName}': `, async (question) => {
                                            const recentContext = context.slice(-6);
                                            let prompt = question;

                                            // If user specifically asks 'about' or context is empty, add knowledge
                                            if (context.length === 0 || question.toLowerCase().includes("about")) {
                                                prompt = `${projectKnowledge}. ${question}`;
                                                if (candleData) {
                                                    prompt += ` Recent candle data: ${JSON.stringify(candleData)}.`;
                                                }
                                                if (tradingPair) {
                                                    prompt += ` Trading pair: Base - ${tradingPair.base}, Quote - ${tradingPair.quote}.`;
                                                }
                                                if (lastRecordedPrice) {
                                                    prompt += ` Last recorded price: ${lastRecordedPrice}.`;
                                                }
                                            }

                                            const req = mockRequest({
                                                specificProject: projectName,
                                                projectKnowledge,
                                                candleData,
                                                tradingPair,
                                                lastRecordedPrice,
                                                context: [
                                                    ...recentContext,
                                                    { role: "user", content: prompt }
                                                ]
                                            });

                                            const res = mockResponse();
                                            await agentHandler(req, res);

                                            // Update context
                                            context.push(
                                                { role: "user", content: prompt },
                                                { role: "assistant", content: res.data.message }
                                            );

                                            askQuestion();
                                        });
                                    };

                                    askQuestion();
                                }
                            });
                        };

                        askDebraMode();
                    });
                };

                selectProject();
            }

            // === Erza / Mathias Flow (Normal Q&A) ===
            else {
                rl.question(`\nEnter your message for ${agentName}: `, async (message) => {
                    const recentContext = context.slice(-6); 
                    const req = mockRequest({
                        parameters: message,
                        context: recentContext
                    });
                    const res = mockResponse();
                    await agentHandler(req, res);

                    // Update context
                    context.push(
                        { role: "user", content: message },
                        { role: "assistant", content: res.data.message }
                    );

                    interact();
                });
            }
        };

        console.log(`\nYou are now interacting with ${agentName}. Type your messages below.`);
        interact();
    });
};

// Start the CLI
askAgent();
