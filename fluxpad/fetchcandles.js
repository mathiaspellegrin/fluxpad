import fs from 'fs';
import axios from 'axios';
import path from 'path';

// GeckoTerminal API base URL
const GECKO_TERMINAL_API_BASE_URL = 'https://api.geckoterminal.com/api/v2';

// Folder to store candle data
const CANDLE_FOLDER = path.resolve('./project_candles');

// Ensure the folder exists
if (!fs.existsSync(CANDLE_FOLDER)) {
    fs.mkdirSync(CANDLE_FOLDER);
}

// Function to fetch OHLCV data using LP contract
const fetchCandlesByLPContract = async (network, lpContract, interval, limit = 5, aggregate = 1) => {
    const url = `${GECKO_TERMINAL_API_BASE_URL}/networks/${network}/pools/${lpContract}/ohlcv/${interval}`;
    try {
        const response = await axios.get(url, {
            params: {
                limit,
                aggregate,
                currency: 'usd',
            },
        });

        const ohlcvList = response.data?.data?.attributes?.ohlcv_list;
        if (!ohlcvList || !Array.isArray(ohlcvList)) {
            return [];
        }

        return ohlcvList.map(item => ({
            timestamp: new Date(item[0] * 1000)
            .toISOString()
            .replace(/T/, ' ')
            .slice(0, 16) + ' UTC', // Convert to 'YYYY-MM-DD HH:mm UTC' format
                    open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            volume: item[5],
        }));
    } catch (error) {
        return [];
    }
};

// Function to save candle data to a file
const saveCandles = (projectName, interval, candles) => {
    const filePath = path.join(CANDLE_FOLDER, `${projectName.toLowerCase()}.json`);
    const intervalKey = interval === 'minute' ? '1m' : interval === 'hour' ? '1h' : interval === 'day' ? '1d' : '1w';

    try {
        let existingData = { "1m": [], "1h": [], "1d": [], "5d": [] };

        if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const mergedData = [...existingData[intervalKey], ...candles].filter(
            (candle, index, self) =>
                index === self.findIndex((t) => t.timestamp === candle.timestamp)
        );

        const initialLength = existingData[intervalKey].length;
        existingData[intervalKey] = mergedData.slice(-30);

        const addedCount = candles.length;
        const deletedCount = Math.max(0, initialLength + addedCount - existingData[intervalKey].length);

        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
        console.log(`${addedCount} candles added, ${deletedCount} candles deleted for ${projectName} (${intervalKey}).`);
    } catch (error) {
        console.error(`Error saving ${intervalKey} candle data for ${projectName}:`, error.message);
    }
};

// Main function to fetch and save candle data
const main = async () => {
    const projectsPath = './projects.json';
    const previousProjectsPath = './previous_projects.json';

    // Load current and previous projects
    const currentProjects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    let previousProjects = [];
    if (fs.existsSync(previousProjectsPath)) {
        previousProjects = JSON.parse(fs.readFileSync(previousProjectsPath, 'utf8'));
    }

    // Helper function to detect added and removed projects
    const detectProjectChanges = (oldProjects, newProjects) => {
        const oldProjectNames = oldProjects.map(p => p.name.toLowerCase());
        const newProjectNames = newProjects.map(p => p.name.toLowerCase());

        const addedProjects = newProjects.filter(p => !oldProjectNames.includes(p.name.toLowerCase()));
        const removedProjects = oldProjects.filter(p => !newProjectNames.includes(p.name.toLowerCase()));

        return { addedProjects, removedProjects };
    };

    const cleanupOldProjectFiles = (projects) => {
        const projectFiles = fs.readdirSync(CANDLE_FOLDER).map(file => file.replace('.json', ''));
        const activeProjects = projects.map(project => project.name.toLowerCase());
    
        // Define files to exclude from deletion
        const excludedFiles = ['template']; // Add other filenames here if needed
    
        projectFiles.forEach(file => {
            if (!activeProjects.includes(file) && !excludedFiles.includes(file)) {
                fs.unlinkSync(path.join(CANDLE_FOLDER, `${file}.json`));
                console.log(`Deleted stale data file: ${file}.json`);
            }
        });
    };
    
    // Detect changes
    const { addedProjects, removedProjects } = detectProjectChanges(previousProjects, currentProjects);

    if (addedProjects.length > 0) {
        console.log('Added projects:', addedProjects.map(p => p.name));
    }

    if (removedProjects.length > 0) {
        console.log('Removed projects:', removedProjects.map(p => p.name));
    }

    // Save current projects for future comparison
    fs.writeFileSync(previousProjectsPath, JSON.stringify(currentProjects, null, 2));

    // Clean up stale files
    cleanupOldProjectFiles(currentProjects);

    // Function to fetch and save candles for all projects
    const fetchAndSaveAllProjects = async (interval, aggregate, fetchLimit) => {
        for (const project of currentProjects) {
            const { name, lpContract, network } = project;

            if (!lpContract || !network) {
                console.warn(`Project '${name}' does not have a valid LP contract or network.`);
                continue;
            }

            console.log(`Fetching ${interval} data for ${name}...`);
            const candles = await fetchCandlesByLPContract(
                network.toLowerCase(),
                lpContract,
                interval,
                fetchLimit,
                aggregate
            );

            if (candles.length > 0) {
                saveCandles(name, interval, candles);
            }
        }
    };

    // Initial and interval fetches
    await fetchAndSaveAllProjects("minute", 1, 30); // Initial 30-minute candles
    setInterval(() => fetchAndSaveAllProjects("minute", 1, 5), 5 * 60 * 1000);

    await fetchAndSaveAllProjects("hour", 1, 30); // Initial 30-hour candles
    setInterval(() => fetchAndSaveAllProjects("hour", 1, 1), 60 * 60 * 1000);

    await fetchAndSaveAllProjects("day", 1, 30); // Initial 30-day candles
    setInterval(() => fetchAndSaveAllProjects("day", 1, 1), 24 * 60 * 60 * 1000);

    await fetchAndSaveAllProjects("day", 5, 30); // Initial 30-week candles
    setInterval(() => fetchAndSaveAllProjects("day", 5, 1), 5 * 24 * 60 * 60 * 1000);
};


main();
