const { cmd } = require('../command')

// ================================
// Anti Bot System
// ================================

let antiBotGroups = new Set()

cmd({
    pattern: "antibot",
    react: "🤖",
    desc: "Enable / Disable Anti Bot",
    category: "group",
    filename: __filename
},
async (
    conn,
    mek,
    m,
    {
        from,
        isGroup,
        isAdmins,
        isBotAdmins,
        reply,
        args
    }
) => {

    try {

        if (!isGroup) {
            return reply("❌ یہ کمانڈ صرف گروپ میں چلے گی")
        }

        if (!isAdmins) {
            return reply("❌ صرف ایڈمن یہ کمانڈ استعمال کر سکتا ہے")
        }

        if (!isBotAdmins) {
            return reply("❌ پہلے بوٹ کو گروپ ایڈمن بناؤ")
        }

        const option = args[0]

        // ON
        if (option === "on") {

            antiBotGroups.add(from)

            return reply(
`✅ Anti Bot کامیابی سے آن ہو گیا

📌 اب اگر کوئی بوٹ نما اکاؤنٹ گروپ میں میسج کرے گا
تو اسے خودکار طریقے سے ریموو کر دیا جائے گا۔`
            )
        }

        // OFF
        if (option === "off") {

            antiBotGroups.delete(from)

            return reply("❌ Anti Bot آف کر دیا گیا")
        }

        // STATUS
        if (option === "status") {

            if (antiBotGroups.has(from)) {
                return reply("✅ Anti Bot ابھی ON ہے")
            } else {
                return reply("❌ Anti Bot ابھی OFF ہے")
            }
        }

        // HELP
        return reply(
`🤖 Anti Bot Commands

.antibot on
.antibot off
.antibot status`
        )

    } catch (e) {

        console.log(e)

        reply("❌ Error آیا")
    }
})


// ================================
// AUTO DETECTION SYSTEM
// ================================

module.exports = {

    async before(m, {
        conn,
        isGroup,
        isBotAdmins,
        sender,
        from
    }) {

        try {

            // Group check
            if (!isGroup) return

            // Bot admin check
            if (!isBotAdmins) return

            // AntiBot ON check
            if (!antiBotGroups.has(from)) return

            // Sender check
            if (!sender) return

            // Ignore own messages
            if (m.key.fromMe) return

            const jid = sender

            // ============================
            // Bot Name Keywords
            // ============================

            const botKeywords = [

                "bot",
                "md",
                "xmd",
                "hacked",
                "bug",
                "crash",
                "wa",
                "auto",
                "ai",
                "support",
                "official",
                "panel"

            ]

            // Pushname
            const pushName =
                (m.pushName || "").toLowerCase()

            // Detection
            const isBot =
                botKeywords.some(word =>
                    pushName.includes(word)
                )

            // ============================
            // ACTION
            // ============================

            if (isBot) {

                // Warning Message
                await conn.sendMessage(from, {
                    text:
`🚨 Anti Bot Detected

👤 User:
@${jid.split("@")[0]}

❌ Action:
Removed Successfully`,
                    mentions: [jid]
                })

                // Remove User
                await conn.groupParticipantsUpdate(
                    from,
                    [jid],
                    "remove"
                )
            }

        } catch (err) {

            console.log("AntiBot Error:", err)
        }
    }
}
