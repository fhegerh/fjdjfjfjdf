const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "neko",
    desc: "Get random anime neko images.",
    category: "anime",
    filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        // User ko waiting message bhejna
        await reply("🐱 Fetching random Neko image, please wait...");

        const apiUrl = "https://api.princetechn.com/api/anime/neko?apikey=prince";
        
        // 1. API se data fetch karna
        const res = await axios.get(apiUrl);
        
        // Aapke terminal/console me response check karne ke liye (Debugging)
        console.log("API Response:", res.data);

        // Prince API ke mutabik sahi image URL nikalna
        let imageUrl = res.data.result || res.data.url || res.data.link;

        // Agar API direct text me URL de rahi ho
        if (!imageUrl && typeof res.data === 'string' && res.data.startsWith('http')) {
            imageUrl = res.data;
        }

        if (!imageUrl) {
            return await reply("❌ API se image ka link nahi mil saka. Terminal check karein.");
        }

        // 2. Image ko Buffer me download karna (Yeh sabse safe aur working tarika hai)
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imageResponse.data);

        // 3. WhatsApp par send karna
        await conn.sendMessage(from, { 
            image: buffer, 
            caption: "✨ *Here is your Neko Image!* ✨\n\n> Powered by Prince API" 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        return await reply(`❌ Error occurred: ${e.message}`);
    }
});
