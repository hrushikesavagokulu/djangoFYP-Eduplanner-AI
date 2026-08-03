const fs = require('fs').promises;
const path = require('path');

/**
 * Utility to handle JSON file read/write operations safely.
 */
const fileHandler = {
    /**
     * Read JSON data from a file.
     * @param {string} filePath - Path to the JSON file.
     * @returns {Promise<any>} - Parsed JSON data.
     */
    read: async (filePath) => {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // If file doesn't exist, return null or handle as needed
                return null;
            }
            throw error;
        }
    },

    /**
     * Write JSON data to a file.
     * @param {string} filePath - Path to the JSON file.
     * @param {any} data - Data to write.
     */
    write: async (filePath, data) => {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf8');
        } catch (error) {
            throw error;
        }
    }
};

module.exports = fileHandler;
