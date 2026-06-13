const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "prince"; // Apni key yahan adjust karein

cmd({
    pattern: "ai",
    alias: ["gpt", "gemini", "mistral", "vision"],
    category: "ai",
    description: "AI chat options",
    use: '.ai <model> <query>',
}, async (conn, mek, m, { args, q, reply }) => {
    
    if (!q) return reply("❌ Format: .ai <gemini|gpt|mistral|openai> <peshan>\n\nExample: .ai gemini kya haal hai?");

    const model = args[0].toLowerCase();
    const query = args.slice(1).join(" ");
    
    if (!query) return reply("❌ Peshan (query) likhein!");

    let apiUrl = "";
    // Endpoints selection
    switch(model) {
        case 'gemini': apiUrl = `https://api.princetechn.com/api/ai/geminiaipro?apikey=${prince}&q=${encodeURIComponent(query)}`; break;
        case 'gpt': apiUrl = `https://api.princetechn.com/api/ai/gpt?apikey=${prince}&q=${encodeURIComponent(query)}`; break;
        case 'mistral': apiUrl = `https://api.princetechn.com/api/ai/mistral?apikey=${prince}&q=${encodeURIComponent(query)}`; break;
        case 'openai': apiUrl = `https://api.princetechn.com/api/ai/openai?apikey=${prince}&q=${encodeURIComponent(query)}`; break;
        default: return reply("❌ Invalid model! Use: gemini, gpt, mistral, or openai");
    }

    await conn.sendMessage(m.chat, { react: { text: "🤖", key: mek.key } });

    try {
        const res = await axios.get(apiUrl);
        // Note: API ka response structure check karein, agar 'result' mein data hai toh wo bhej rahe hain
        const result = res.data.result || res.data.message || JSON.stringify(res.data);
        reply(`🤖 *${model.toUpperCase()} AI:*\n\n${result}`);
    } catch (e) {
        reply("❌ API Error: " + e.message);
    }
});

// Vision AI Command (Image analysis ke liye)
cmd({
    pattern: "vision",
    category: "ai",
    description: "Analyze image with AI",
    use: '.vision <reply image>',
}, async (conn, mek, m, { quoted, reply }) => {
    
    const isQuotedImage = quoted && (quoted.mtype === 'imageMessage' || quoted.mimetype?.includes('image'));
    if (!isQuotedImage) return reply("❌ Please reply to an image!");

    await reply("🔍 Analyzing image...");
    
    try {
        // Yahan image ka URL generate karna hoga jo API ko diya ja sake
        // Note: Is API ke liye aapko image ka public URL chahiye
        const imgUrl = "IMAGE_URL_HERE"; 
        const res = await axios.get(`https://api.princetechn.com/api/ai/vision?apikey=${prince}&url=${encodeURIComponent(imgUrl)}`);
        reply(`👁️ *Vision Analysis:*\n\n${res.data.result}`);
    } catch (e) {
        reply("❌ Vision API Error.");
    }
});
