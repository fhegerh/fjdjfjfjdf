const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const converter = require('../lib/converter');

const filePath = path.join(__dirname, '../lib/autovoice.json');

// Command: .autovoice on/off
cmd({
    pattern: "autovoice",
    category: "owner",
    desc: "Enable/Disable auto voice"
}, async (conn, mek, m, { args, reply }) => {
    const status = args[0]?.toLowerCase();
    if (status !== 'on' && status !== 'off') return reply("❌ Use: .autovoice on ya .autovoice off");
    
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        data._status = (status === 'on'); // autovoice.json ke andar status save hoga
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        reply(`✅ Auto Voice is now ${status.toUpperCase()}`);
    } else {
        reply("❌ autovoice.json file nahi mili!");
    }
});

// Listener: Auto Voice Response
cmd({ on: "body" }, async (conn, mek, m, { from, body }) => {
    try {
        if (m.fromMe || !body || !fs.existsSync(filePath)) return;

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Agar _status false hai, to ruk jaye
        if (data._status === false) return;

        const matchText = Object.keys(data).find(trigger => trigger.toLowerCase() === body.toLowerCase());
        if (!matchText) return;

        const audioPath = path.join(__dirname, '../lib', data[matchText]);
        if (!fs.existsSync(audioPath)) return;

        const buffer = fs.readFileSync(audioPath);
        const fileExtension = data[matchText].split('.').pop();
        const pttAudio = await converter.toPTT(buffer, fileExtension);

        await conn.sendMessage(from, {
            audio: pttAudio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        console.error("AutoVoice Listener Error:", error);
    }
});
