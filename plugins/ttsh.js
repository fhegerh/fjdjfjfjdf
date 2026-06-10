const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "fancy",
    alias: ["fancytext", "styletext", "font"],
    desc: "Convert normal text into stylish fonts.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Checking if text is provided
        if (!q) return reply("❌ Please provide text to convert!\n\n*Example:* .fancy Hello World");

        // Temporary loading message
        await reply("⏳ Generating style fonts, please wait...");

        // API URL
        const apiUrl = `https://api.princetechn.com/api/tools/fancy?apikey=prince&text=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        // FIXED: Reading 'results' (with 's') directly from your API structure
        let results = [];
        if (data && Array.isArray(data.results)) {
            results = data.results;
        } else if (data && Array.isArray(data.result)) {
            results = data.result;
        } else if (Array.isArray(data)) {
            results = data;
        }

        // If no results found or API gives error
        if (!results || results.length === 0) {
            return reply("❌ Failed to generate fancy fonts. The API returned an empty list.");
        }

        // Building response text
        let responseText = `✨ *Fancy Font Results for:* _${q}_\n\n`;

        results.forEach((item, index) => {
            // Extracting name and result from the API array object
            let styleName = item.name || `Font Style ${index + 1}`;
            let styledText = item.result || item.text || item;

            // Formatting so users can easily tap and copy the text in WhatsApp
            responseText += `*${styleName}:*\n\`\`\`${styledText}\`\`\`\n\n`;
        });

        responseText += `*Powered by Prince API*`;

        // Send the complete list of styled fonts
        return await conn.sendMessage(from, { text: responseText }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ An error occurred: ${error.message}`);
    }
});
