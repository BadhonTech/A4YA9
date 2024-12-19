module.exports = {
  config: {
    name: "help",
    version: "1.0",
    author: "Modified by Badhon",
    description: "Displays a paginated list of bot commands",
    category: "info",
  },

  onStart: async function ({ message, args, commands }) {
    // Validate commands input
    if (!commands || typeof commands[Symbol.iterator] !== "function") {
      return message.reply("Error: Commands list is unavailable.");
    }

    const commandsPerPage = 30;
    const page = parseInt(args[0]) || 1;

    // Group commands by categories
    const categories = {};
    for (const [, cmd] of commands) {
      const category = cmd.config.category || "Others";
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd.config.name);
    }

    // Flatten and prepare the list
    const categoryList = Object.entries(categories).map(([category, cmds]) => ({
      category,
      cmds: cmds.sort(),
    }));

    const paginated = [];
    let currentPage = [];
    let currentCount = 0;

    for (const { category, cmds } of categoryList) {
      if (currentCount + cmds.length > commandsPerPage && currentPage.length > 0) {
        paginated.push(currentPage);
        currentPage = [];
        currentCount = 0;
      }

      currentPage.push({ category, cmds });
      currentCount += cmds.length;
    }

    if (currentPage.length > 0) paginated.push(currentPage);

    const totalPages = paginated.length;
    if (page > totalPages || page < 1) {
      return message.reply(`Invalid page number. Please select a page between 1 and ${totalPages}.`);
    }

    // Generate the message for the requested page
    let msg = `===== 𝗣𝗶𝗸𝗮 - 𝗕𝗼𝘁 🦋 ======\n\n`;
    msg += `📍 Total Commands: ${commands.size || commands.length}\n`;
    msg += `📍 Page: ${page}/${totalPages}\n\n`;

    for (const { category, cmds } of paginated[page - 1]) {
      msg += `📍 ${category}\n`;
      cmds.forEach((cmd) => {
        msg += `   ▪︎ ${cmd}\n`;
      });
      msg += "\n";
    }

    message.reply(msg.trim());
  },
};