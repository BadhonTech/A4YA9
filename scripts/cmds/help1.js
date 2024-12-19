const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ 🐐 | ArYan Bot V2 ]";
/**
* @author NTKhang
* @message if you delete or edit it you will get a global ban
*/

module.exports = {
  config: {
    name: "help",
    version: "1.21",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      vi: "Xem cách sử dụng của các lệnh",
      en: "View command usage"
    },
    category: "info",
    guide: {
      vi: "   {pn} [để trống | <số trang> | <tên lệnh>]"
        + "\n   {pn} <command name> [-u | usage | -g | guide]: chỉ hiển thị phần hướng dẫn sử dụng lệnh"
        + "\n   {pn} <command name> [-i | info]: chỉ hiển thị phần thông tin về lệnh"
        + "\n   {pn} <command name> [-r | role]: chỉ hiển thị phần quyền hạn của lệnh"
        + "\n   {pn} <command name> [-a | alias]: chỉ hiển thị phần tên viết tắt của lệnh",
      en: "{pn} [empty | <page number> | <command name>]"
        + "\n   {pn} <command name> [-u | usage | -g | guide]: only show command usage"
        + "\n   {pn} <command name> [-i | info]: only show command info"
        + "\n   {pn} <command name> [-r | role]: only show command role"
        + "\n   {pn} <command name> [-a | alias]: only show command alias"
    },
    priority: 1
  },

  langs: {
    vi: {
      help: "╭─────────────⭓"
        + "\n%1"
        + "\n├─────⭔"
        + "\n│ Trang [ %2/%3 ]"
        + "\n│ Hiện tại bot có %4 lệnh có thể sử dụng"
        + "\n│ » Gõ %5help <số trang> để xem danh sách các lệnh"
        + "\n│ » Gõ %5help để xem chi tiết cách sử dụng lệnh đó"
        + "\n├────────⭔"
        + "\n│ %6"
        + "\n╰─────────────⭓",
      help2: "%1├───────⭔"
        + "\n│ » Hiện tại bot có %2 lệnh có thể sử dụng"
        + "\n│ » Gõ %3help <tên lệnh> để xem chi tiết cách sử dụng lệnh đó"
        + "\n│ %4"
        + "\n╰─────────────⭓",
      commandNotFound: "Lệnh \"%1\" không tồn tại",
      getInfoCommand: "╭── NAME ────⭓"
        + "\n│ %1"
        + "\n├── INFO"
        + "\n│ Mô tả: %2"
        + "\n│ Các tên gọi khác: %3"
        + "\n│ Các tên gọi khác trong nhóm bạn: %4"
        + "\n│ Version: %5"
        + "\n│ Role: %6"
        + "\n│ Thời gian mỗi lần dùng lệnh: %7s"
        + "\n│ Author: %8"
        + "\n├── USAGE"
        + "\n│%9"
        + "\n├── NOTES"
        + "\n│ Nội dung bên trong <XXXXX> là có thể thay đổi"
        + "\n│ Nội dung bên trong [a|b|c] là a hoặc b hoặc c"
        + "\n╰──────⭔",
      onlyInfo: "╭── INFO ────⭓"
        + "\n│ Tên lệnh: %1"
        + "\n│ Mô tả: %2"
        + "\n│ Các tên gọi khác: %3"
        + "\n│ Các tên gọi khác trong nhóm bạn: %4"
        + "\n│ Version: %5"
        + "\n│ Role: %6"
        + "\n│ Thời gian mỗi lần dùng lệnh: %7s"
        + "\n│ Author: %8"
        + "\n╰─────────────⭓",
      onlyUsage: "╭── USAGE ────⭓"
        + "\n│%1"
        + "\n╰─────────────⭓",
      onlyAlias: "╭── ALIAS ────⭓"
        + "\n│ Các tên gọi khác: %1"
        + "\n│ Các tên gọi khác trong nhóm bạn: %2"
        + "\n╰─────────────⭓",
      onlyRole: "╭── ROLE ────⭓"
        + "\n│%1"
        + "\n╰─────────────⭓",
      doNotHave: "Không có",
      roleText0: "0 (Tất cả người dùng)",
      roleText1: "1 (Quản trị viên nhóm)",
      roleText2: "2 (Admin bot)",
      roleText0setRole: "0 (set role, tất cả người dùng)",
      roleText1setRole: "1 (set role, quản trị viên nhóm)",
      pageNotFound: "Trang %1 không tồn tại"
    },
    en: {
      help: "╭─────────────⭓"
        + "\n%1"
        + "\n├─────⭔"
        + "\n│ Page [ %2/%3 ]"
        + "\n│ Currently, the bot has %4 commands that can be used"
        + "\n│ » Type %5help <page> to view the command list"
        + "\n│ » Type %5help to view the details of how to use that command"
        + "\n├────────⭔"
        + "\n│ %6"
        + "\n╰─────────────⭓",
      help2: "%1├───────⭔"
        + "\n│ » Currently, the bot has %2 commands that can be used"
        + "\n│ » Type %3help <command name> to view the details of how to use that command"
        + "\n│ %4"
        + "\n╰─────────────⭓",
      commandNotFound: "Command \"%1\" does not exist",
      getInfoCommand: "╭── NAME ────⭓"
        + "\n│ %1"
        + "\n├── INFO"
        + "\n│ Description: %2"
        + "\n│ Other names: %3"
        + "\n│ Other names in your group: %4"
        + "\n│ Version: %5"
        + "\n│ Role: %6"
        + "\n│ Time per command: %7s"
        + "\n│ Author: %8"
        + "\n├── USAGE"
        + "\n│%9"
        + "\n├── NOTES"
        + "\n│ The content inside <XXXXX> can be changed"
        + "\n│ The content inside [a|b|c] is a or b or c"
        + "\n╰──────⭔",
      onlyInfo: "╭── INFO ────⭓"
        + "\n│ Command name: %1"
        + "\n│ Description: %2"
        + "\n│ Other names: %3"
        + "\n│ Other names in your group: %4"
        + "\n│ Version: %5"
        + "\n│ Role: %6"
        + "\n│ Time per command: %7s"
        + "\n│ Author: %8"
        + "\n╰─────────────⭓",
      onlyUsage: "╭── USAGE ────⭓"
        + "\n│%1"
        + "\n╰─────────────⭓",
      onlyAlias: "╭── ALIAS ────⭓"
        + "\n│ Other names: %1"
        + "\n│ Other names in your group: %2"
        + "\n╰─────────────⭓",
      onlyRole: "╭── ROLE ────⭓"
        + "\n│%1"
        + "\n╰─────────────⭓",
      doNotHave: "Do not have",
      roleText0: "0 (All users)",
      roleText1: "1 (Group administrators)",
      roleText2: "2 (Admin bot)",
      roleText0setRole: "0 (set role, all users)",
      roleText1setRole: "1 (set role, group administrators)",
      pageNotFound: "Page %1 does not exist"
    }
  },

  onStart: async function ({ message, args }) {
    const prefix = await getPrefix(message);
    let page = 1;
    if (args[0]) {
      // Handle page number or command name for detailed help
      page = parseInt(args[0]) || 1;
    }

    // If it's a specific command request
    if (args.length > 0 && !isNaN(page)) {
      const command = commands[args[0].toLowerCase()];
      if (command) {
        return message.reply(command.details);
      } else {
        return message.reply(`Command not found: ${args[0]}`);
      }
    }

    // Show a page of help
    const totalCommands = Object.keys(commands).length;
    const commandsPerPage = 5;  // Adjust this based on your needs
    const start = (page - 1) * commandsPerPage;
    const end = start + commandsPerPage;
    const pageCommands = Object.keys(commands).slice(start, end);

    const formattedHelp = pageCommands.map(cmd => `${cmd}: ${commands[cmd].description.en}`).join("\n");

    message.reply(`
      ${formattedHelp}
      Page ${page}/${Math.ceil(totalCommands / commandsPerPage)}
    `);
  }
};