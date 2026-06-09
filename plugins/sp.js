const { cmd } = require("../command");
const axios = require("axios"); // API fetch karne ke liye axios zaroori hai

cmd({
    pattern: "proxy", // Is command ko run karne ke liye prefix ke sath 'proxy' likhna hoga (e.g., .proxy)
    desc: "Get latest proxy list.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
    try {
        // User ko batane ke liye ki process ho raha hai
        await reply("🔄 Fetching proxies, please wait...");

        const url = "https://api.princetechn.com/api/tools/proxy?apikey=prince";
        const response = await axios.get(url);
        
        // Agar API ka response successfully mil jata hai
        if (response.data) {
            // Note: Agar API response direct text hai to direct bhejenge, 
            // agar JSON object hai to use string me convert karenge.
            let proxyData = response.data;
            
            if (typeof proxyData === 'object') {
                proxyData = JSON.stringify(proxyData, null, 2);
            }

            // Chat me result bhejna
            const msg = `*🌐 PROXY FETCHED SUCCESSFULLY* \n\n${proxyData}`;
            return await reply(msg);
        } else {
            return await reply("❌ Proxy data nahi mil saka. API me koi dikkat hai.");
        }

    } catch (e) {
        console.log(e);
        return await reply(`❌ An error occurred: ${e.message}`);
    }
});
