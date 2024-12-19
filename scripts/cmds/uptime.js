module.exports = {
	config: {
		name: "uptime",
		aliases: ["upt"],
		version: "1.0",
		author: "Badhon",
		countDown: 5,
		role: 0,
		category: "system",
		guide: {
			vi: "Not Available",
			en: "bot uptime"
		} 
	},

// Store the bot's start time globally
const botStartTime = Date.now();

// The main function for the command
onStart: async function ({ api, args, event }) {  
  const now = Date.now(); // Get the current time
  const uptime = now - botStartTime; // Calculate the bot's uptime in milliseconds

  const seconds = Math.floor((uptime / 1000) % 60);
  const minutes = Math.floor((uptime / (1000 * 60)) % 60);
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  
  const uptimeMessage = 
  `🕒 Bot Uptime: \n
  ${days} days, \n
  ${hours} hours, \n
  ${minutes} minutes, \n
  ${seconds} seconds.`;

  api.sendMessage(uptimeMessage, event.threadID, event.messageID);
};
