const { cmd } = require('../command');
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys'); // Ya aapke framework ka download method

const API_KEY = "prince";

// Helper: Image upload to Telegra.ph (Vision ke liye zaruri)
async function uploadToTelegraph(buffer) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', buffer, 'image.jpg');
    const res = await axios.post('https://telegra.ph/upload', form, { headers: form.getHeaders() });
    return 'https://telegra.ph' + res.data[0].src;
}

cmd({
    pattern: "ai2",
    category: "ai",
    description: "AI chat options",
    use: '.ai <model> <query>',
}, async (conn, mek, m, { args, q, reply }) => {
    
    // Fixed logic for model and query
    if (args.length < 2) return reply("❌ Format: .ai <gemini|gpt|mistral|openai> <peshan>\n\nExample: .ai gemini kya haal hai?");

    const model = args[0].toLowerCase();
    const query = args.slice(1).join(" ");
    
    let apiUrl = "";
    switch(model) {
        case 'gemini': apiUrl = `https://api.princetechn.com/api/ai/geminiaipro?apikey=${API_KEY}&q=${encodeURIComponent(query)}`; break;
        case 'gpt': apiUrl = `https://api.princetechn.com/api/ai/gpt?apikey=${API_KEY}&q=${encodeURIComponent(query)}`; break;
        case 'mistral': apiUrl = `https://api.princetechn.com/api/ai/mistral?apikey=${API_KEY}&q=${encodeURIComponent(query)}`; break;
        case 'openai': apiUrl = `https://api.princetechn.com/api/ai/openai?apikey=${API_KEY}&q=${encodeURIComponent(query)}`; break;
        default: return reply("❌ Invalid model! Use: gemini, gpt, mistral, or openai");
    }

    await conn.sendMessage(m.chat, { react: { text: "🤖", key: mek.key } });

    try {
        const res = await axios.get(apiUrl);
        const result = res.data.result || res.data.message || "No response from AI";
        reply(`🤖 *${model.toUpperCase()} AI:*\n\n${result}`);
    } catch (e) {
        reply("❌ API Error: " + e.message);
    }
});

cmd({
    pattern: "vision",
    category: "ai",
    description: "Analyze image with AI",
}, async (conn, mek, m, { reply }) => {
    
    // Quoted image check
    const quoted = m.quoted ? m.quoted : mek;
    const isImage = (quoted.mtype === 'imageMessage' || quoted.mimetype?.includes('image'));
    
    if (!isImage) return reply("❌ Please kisi image par reply karke .vision likhein!");

    await reply("🔍 Uploading and Analyzing...");
    
    try {
        const media = await conn.downloadMediaMessage(quoted);
        const imgUrl = await uploadToTelegraph(media);
        
        const res = await axios.get(`https://api.princetechn.com/api/ai/vision?apikey=${API_KEY}&url=${encodeURIComponent(imgUrl)}`);
        reply(`👁️ *Vision Analysis:*\n\n${res.data.result || "No analysis found."}`);
    } catch (e) {
        reply("❌ Vision API Error: " + e.message);
    }
});
