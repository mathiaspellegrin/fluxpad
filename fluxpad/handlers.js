// Import required libraries
import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI();

// Load character configurations
const characters = JSON.parse(fs.readFileSync('./characters/characters.json', 'utf8'));

// Load knowledge files for Erza and Mathias
const confluxEcosystemKnowledge = fs.readFileSync('./knowledge/conflux.json', 'utf8');
const fluxpadEcosystemKnowledge = fs.readFileSync('./knowledge/fluxpad.json', 'utf8');

// Utility function to get current time
const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toISOString(); // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
};

// Handler: Erza - Ecosystem Insights
const handleErza = async (req, res) => {
    const { parameters, context = [] } = req.body;
    const character = characters.erza;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            store: true,
            max_tokens: 400, // Set token limit
            messages: [
                {
                    role: "system",
                    content: `${character.systemPrompt}\n\nCurrent Time: ${getCurrentTimestamp()}\nHere is some basic knowledge about the Conflux ecosystem:\n${confluxEcosystemKnowledge}`
                },
                ...context,
                { role: "user", content: parameters },
            ],
        });
        res.json({
            message: completion.choices[0].message.content,
            context: [
                ...context,
                { role: "user", content: parameters },
                { role: "assistant", content: completion.choices[0].message.content }
            ],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handler: Mathias - FluxPad Platform Guidance
const handleMathias = async (req, res) => {
    const { parameters, context = [] } = req.body;
    const character = characters.mathias;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            store: true,
            max_tokens: 400, // Set token limit
            messages: [
                {
                    role: "system",
                    content: `${character.systemPrompt}\n\nCurrent Time: ${getCurrentTimestamp()}\nHere is some basic knowledge about the FluxPad ecosystem:\n${fluxpadEcosystemKnowledge}`
                },
                ...context,
                { role: "user", content: parameters },
            ],
        });
        res.json({
            message: completion.choices[0].message.content,
            context: [
                ...context,
                { role: "user", content: parameters },
                { role: "assistant", content: completion.choices[0].message.content }
            ],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handler: Aria - Token/NFT Creation
const handleAria = async (req, res) => {
    const { operation, inputText, context = [] } = req.body;
    const character = characters.aria;
    console.log(operation, inputText, context);

    try {
        let systemPrompt = `${character.systemPrompt}\n\nCurrent Time: ${getCurrentTimestamp()}`;

        if (operation === "createNFT") {
            systemPrompt += "\nYour task is to generate an NFT image based on the user's input.";
        } else if (operation === "question") {
            systemPrompt += "\nYou should provide detailed answers to questions about NFT creation or tokenomics.";
        } else {
            return res.status(400).json({ error: "Invalid operation. Use 'createNFT' or 'question'." });
        }

        let imageUrl = null;
        let message = '';

        if (operation === "createNFT") {
            // Combine systemPrompt and user input for generating the image
            const promptForImage = `${inputText} in NFT style`;

            // Call OpenAI Image Generation API
            const imageResponse = await openai.images.generate({
                prompt: promptForImage, // Use the combined prompt
                n: 1,
                size: '512x512',
            });

            if (imageResponse && imageResponse.data && imageResponse.data.length > 0) {
                imageUrl = imageResponse.data[0].url;
                message = "Here is your AI-generated image based on your input.";
                console.log(`Generated AI image URL: ${imageUrl}`);
            } else {
                throw new Error('Image generation failed.');
            }
        } else {
            // For 'question' operation, get a text response from the assistant
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                max_tokens: 400,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...context,
                    { role: "user", content: inputText },
                ],
            });

            message = completion.choices[0].message.content;
        }

        // Store context
        context.push(
            { role: "user", content: inputText },
            { role: "assistant", content: message }
        );

        res.json({
            message,
            ...(imageUrl && { imageUrl }),
        });
    } catch (error) {
        console.error("Error handling Aria request:", error);
        res.status(500).json({ error: error.message });
    }
};



// Handler: Debra - Project Analysis
const handleDebra = async (req, res) => {
    const {
        specificProject,
        inputText, // Include inputText from req.body
        projectKnowledge = "No additional knowledge provided.",
        candleData,
        tradingPair,
        lastRecordedPrice,
        context = [],
        maxTokens = 400 // Allow override of token limit
    } = req.body;

    const { systemPrompt } = characters.debra;
    const currentTime = getCurrentTimestamp();

    try {
        const systemMessageParts = [
            `${systemPrompt}\n\nCurrent Time: ${currentTime}`,
            `You are an expert of the following project: ${specificProject}.`,
            `${projectKnowledge}`
        ];

        if (candleData) {
            systemMessageParts.push(`Recent Candle Data: ${JSON.stringify(candleData, null, 2)}`);
        }
        if (tradingPair) {
            systemMessageParts.push(`Trading Pair: Base - ${tradingPair.base}, Quote - ${tradingPair.quote}`);
        }
        if (lastRecordedPrice) {
            systemMessageParts.push(`Last Recorded Price: ${lastRecordedPrice}`);
        }

        const systemMessage = systemMessageParts.join("\n\n");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            store: true,
            max_tokens: maxTokens, // Use parameter or default to 400
            messages: [
                { role: "system", content: systemMessage },
                ...context,
                { role: "user", content: inputText } // Include inputText as user message
            ],
        });

        res.json({
            message: completion.choices[0].message.content,
            context: [
                ...context,
                { role: "user", content: inputText },
                { role: "assistant", content: completion.choices[0].message.content }
            ]
        });
    } catch (error) {
        console.error("Error in handleDebra:", error);
        res.status(500).json({ error: error.message });
    }
};


export { handleErza, handleMathias, handleAria, handleDebra };
