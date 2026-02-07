// Import required libraries
import OpenAI from "openai";
import fs from "fs";
import { ethers } from "ethers";
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

// Use the private key from .env
const mathiasPrivateKey = process.env.MATHIAS_PRIVATE_CFX_WALLET;

// Conflux eSpace RPC (Testnet example)
const CFX_ESPACE_RPC = "https://evmtestnet.confluxrpc.com";

// Your contract details
const contractAddress = "0x2B77B6f8C5b7C7d5115dF095D75a09238081ea7f";
const contractABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "address", name: "_voter", type: "address" },
      { internalType: "uint256", name: "_votes", type: "uint256" },
    ],
    name: "voteAsAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ARIA_PRIVATE_CFX_WALLET = process.env.ARIA_PRIVATE_CFX_WALLET;

const NFT_FACTORY_CONTRACT_ADDRESS = "0x8DB86AB5C72b875Af8C7B36A4D916f071e1C9a78";
const NFT_FACTORY_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "string", name: "tokenURI", type: "string" },
    ],
    name: "createNFT",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "creationFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export async function handlePublishNFT({ name, symbol, tokenURI }) {
    if (!ARIA_PRIVATE_CFX_WALLET) {
      throw new Error("Private key not found in environment variables.");
    }
  
    try {
      // Connect to blockchain
      const provider = new ethers.JsonRpcProvider(CFX_ESPACE_RPC);
      const wallet = new ethers.Wallet(ARIA_PRIVATE_CFX_WALLET, provider);
      const contract = new ethers.Contract(NFT_FACTORY_CONTRACT_ADDRESS, NFT_FACTORY_ABI, wallet);
  
      // Fetch creation fee
      const creationFee = await contract.creationFee();
  
      // Create NFT transaction
      const tx = await contract.createNFT(name, symbol, tokenURI, { value: creationFee });
      console.log("Transaction sent:", tx.hash);
  
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt.transactionHash);
  
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        message: "NFT successfully published.",
      };
    } catch (error) {
      console.error("Error in handlePublishNFT:", error);
      return {
        success: false,
        error: error.message || "Failed to publish NFT.",
      };
    }
}

/**
 * This function uses Mathias's private key to sign and send a transaction
 * calling `voteAsAgent` on your contract, passing `projectName`, `voterAddress`,
 * and `randomVotes`.
 */
export async function handleMathiasOnChainVote(projectName, voterAddress, randomVotes) {
  try {
    // 1) Connect to Conflux eSpace
    const provider = new ethers.JsonRpcProvider(CFX_ESPACE_RPC);

    // 2) Create a wallet using Mathias's private key
    const mathiasWallet = new ethers.Wallet(mathiasPrivateKey, provider);

    // 3) Instantiate the contract
    const contract = new ethers.Contract(contractAddress, contractABI, mathiasWallet);

    // 4) Send the transaction
    const txResponse = await contract.voteAsAgent(projectName, voterAddress, randomVotes);

    // 5) Wait for confirmation
    const receipt = await txResponse.wait();
    console.log("Mathias vote TX mined:", receipt.transactionHash);

    // Return the transaction hash or anything else you need
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error in handleMathiasOnChainVote:", error);
    throw error;
  }
}

// Handler: Erza - Ecosystem Insights
const handleErza = async (req, res) => {
    const { parameters, context = [] } = req.body;
    const character = characters.erza;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            store: true,
            max_tokens: 150, // Reduced token limit for concise responses
            messages: [
                {
                    role: "system",
                    content: `${character.systemPrompt}\n\nCurrent Time: ${getCurrentTimestamp()}\nHere is some basic knowledge about the Conflux ecosystem:\n${confluxEcosystemKnowledge}\n\nIMPORTANT: Provide extremely concise responses. Keep answers brief, direct, and to the point. Limit to 1-3 short sentences whenever possible.`
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
            max_tokens: 150, // Reduced token limit for concise responses
            messages: [
                {
                    role: "system",
                    content: `${character.systemPrompt}\n\nCurrent Time: ${getCurrentTimestamp()}\nHere is some basic knowledge about the FluxPad ecosystem:\n${fluxpadEcosystemKnowledge}\n\nIMPORTANT: Provide extremely concise responses. Keep answers brief, direct, and to the point. Limit to 1-3 short sentences whenever possible.`
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
        let systemPrompt = `${character.systemPrompt}\n\nCurrent Time: ${getCurrentTimestamp()}\n\nIMPORTANT: Provide extremely concise responses. Keep answers brief, direct, and to the point. Limit to 1-3 short sentences whenever possible.`;

        if (operation === "createNFT") {
            systemPrompt += "\nProvide a brief one-sentence description of the generated NFT.";
        } else if (operation === "question") {
            systemPrompt += "\nAnswer questions about NFT creation or tokenomics concisely.";
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
                message = "Your NFT is ready.";
                console.log(`Generated AI image URL: ${imageUrl}`);
            } else {
                throw new Error('Image generation failed.');
            }
        } else {
            // For 'question' operation, get a text response from the assistant
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                max_tokens: 150, // Reduced token limit for concise responses
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
        inputText,
        projectKnowledge = "No additional knowledge provided.",
        candleData,
        tradingPair,
        lastRecordedPrice,
        context = [],
        maxTokens = 150 // Reduced default token limit for concise responses
    } = req.body;

    const { systemPrompt } = characters.debra;
    const currentTime = getCurrentTimestamp();

    try {
        const systemMessageParts = [
            `${systemPrompt}\n\nCurrent Time: ${currentTime}`,
            `You are an expert of the following project: ${specificProject}.`,
            `${projectKnowledge}`,
            `IMPORTANT: Provide extremely concise responses. Keep answers brief, direct, and to the point. Limit to 1-3 short sentences whenever possible.`
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
            max_tokens: maxTokens,
            messages: [
                { role: "system", content: systemMessage },
                ...context,
                { role: "user", content: inputText }
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
