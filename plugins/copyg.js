const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "define",
    alias: ["meaning", "dict", "dictionary"],
    desc: "Get the definition or meaning of a word.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Checking if word/term is provided
        if (!q) return reply("❌ Please provide a word to define!\n\n*Example:* .define persistent");

        // Temporary loading message
        await reply(`⏳ Fetching meaning for "${q}", please wait...`);

        // API URL setup
        const apiUrl = `https://api.princetechn.com/api/tools/define?apikey=prince&term=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Extracting data dynamically from multiple possible structures
        let resObj = null;
        if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
            resObj = data.results[0]; // Object from results array
        } else if (data && data.result) {
            resObj = Array.isArray(data.result) ? data.result[0] : data.result;
        } else if (data && data.data) {
            resObj = Array.isArray(data.data) ? data.data[0] : data.data;
        } else {
            resObj = data;
        }

        // Checking if we got a valid definition field
        let word = resObj?.word || resObj?.term || q;
        let definition = resObj?.definition || resObj?.meaning || resObj?.desc || (typeof resObj === 'string' ? resObj : null);
        let example = resObj?.example || resObj?.examples || null;

        // If definition is completely missing or API structure didn't match
        if (!definition) {
            return reply(`❌ Could not find the definition for "${q}". The word might be invalid or API returned empty.`);
        }

        // Building clean, scannable response text
        let responseText = `📚 *DICTIONARY DEFINITION* 📚\n\n`;
        responseText += `🔤 *Word:* ${word.toUpperCase()}\n\n`;
        responseText += `📖 *Meaning:* ${definition}\n`;
        
        // If an example sentence exists in API response
        if (example) {
            responseText += `\n📝 *Example:* _${example}_\n`;
        }

        responseText += `\n───────────────────\n`;
        responseText += `*Powered by DR KAMRAN*`;

        // Send definition
        return await conn.sendMessage(from, { text: responseText }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ An error occurred while fetching definition: ${error.message}`);
    }
});
