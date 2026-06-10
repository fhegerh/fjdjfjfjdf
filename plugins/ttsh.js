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

        // Checking array in different formats (robust handling)
        let results = [];
        if (Array.isArray(data)) {
            results = data;
        } else if (data && Array.isArray(data.result)) {
            results = data.result;
        } else if (data && Array.isArray(data.data)) {
            results = data.data;
        }

        // If no results found or API gives error
        if (!results || results.length === 0) {
            return reply("❌ Failed to generate fancy fonts. The API might be down or key expired.");
        }

        // Building response text
        let responseText = `✨ *Fancy Font Results for:* _${q}_\n\n`;

        results.forEach((item, index) => {
            // Agar API direct text strings de rahi ho ya object format me name ke sath de rahi ho
            let styledText = typeof item === 'object' ? (item.result || item.text || item.styled || Object.values(item)[0]) : item;
            let styleName = item.name || `Font Style ${index + 1}`;

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
