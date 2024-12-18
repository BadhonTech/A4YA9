const botStartTime = Date.now();

module.exports = {
    config: {
        name: "uptime",
        aliases: ["upt"],
        version: "1.0",
        author: "Badhon",
        countDown: 5,
        role: 0,
        category: "info",
        guide: {
            vi: "Not Available",
            en: "bot uptime"
        }
    },
    onStart: async function ({ api, args, event }) {
        const now = Date.now();
        const uptime = now - botStartTime;

        const seconds = Math.floor((uptime / 1000) % 60);
        const minutes = Math.floor((uptime / (1000 * 60)) % 60);
        const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

        const uptimeMessage = `==== 𝗣𝗶𝗸𝗮 - 𝗕𝗼𝘁 🦋 ====

💡 Bot Uptime:
🗓️ Days: ${days}
⏰ Hours: ${hours}
🕒 Minutes: ${minutes}
⏱️ Seconds: ${seconds}`;

        api.sendMessage(uptimeMessage, event.threadID, event.messageID);
    }
};
