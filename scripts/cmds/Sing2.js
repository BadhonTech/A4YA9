const axios = require("axios");
const fs = require("fs");

// Base API URL configuration
const baseApiUrl = async () => {
  return "https://yt1s.com/api/ajaxSearch/index"; // Updated downloader API
};

// Exported bot module
module.exports = {
  config: {
    name: "sing",
    version: "1.1.5",
    aliases: ["music", "play"],
    author: "Badhon Biswas",
    countDown: 5,
    role: 0,
    description: {
      en: "Download audio from YouTube",
    },
    category: "media",
    guide: {
      en: "{pn} [<song name>|<song link>]:\n   Example:\n{pn} chipi chipi chapa chapa",
    },
  },
  onStart: async ({ api, args, event, commandName }) => {
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    let videoID;

    // If URL is provided
    if (checkurl.test(args[0])) {
      videoID = args[0].match(checkurl)[1];
      try {
        const { title, audioUrl } = await downloadYouTubeAudio(videoID);
        return api.sendMessage(
          {
            body: `🎵 Downloading: ${title}`,
            attachment: await downloadFile(audioUrl, "audio.mp3"),
          },
          event.threadID,
          () => fs.unlinkSync("audio.mp3"),
          event.messageID
        );
      } catch (error) {
        console.error(error);
        return api.sendMessage(
          `❌ An error occurred: ${error.message}`,
          event.threadID,
          event.messageID
        );
      }
    }

    // If search query is provided
    let keyWord = args.join(" ");
    keyWord = keyWord.replace("?feature=share", "").trim();
    const maxResults = 6;

    try {
      const searchResults = await searchYouTube(keyWord, maxResults);
      if (searchResults.length === 0) {
        return api.sendMessage(
          `⭕ No search results found for: ${keyWord}`,
          event.threadID,
          event.messageID
        );
      }

      let msg = "";
      const thumbnails = [];
      searchResults.forEach((info, i) => {
        msg += `${i + 1}. ${info.title}\nTime: ${info.duration}\nChannel: ${info.channel}\n\n`;
        thumbnails.push(downloadThumbnail(info.thumbnail, `thumb_${i}.jpg`));
      });

      return api.sendMessage(
        {
          body: msg + "Reply with the number of the song you want to download.",
          attachment: await Promise.all(thumbnails),
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            results: searchResults,
          });
        },
        event.messageID
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        `❌ An error occurred: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
  onReply: async ({ event, api, Reply }) => {
    try {
      const { results } = Reply;
      const choice = parseInt(event.body, 10);

      if (!isNaN(choice) && choice > 0 && choice <= results.length) {
        const selectedVideo = results[choice - 1];
        const { title, audioUrl } = await downloadYouTubeAudio(selectedVideo.id);

        await api.unsendMessage(Reply.messageID);

        return api.sendMessage(
          {
            body: `🎵 Title: ${title}`,
            attachment: await downloadFile(audioUrl, "audio.mp3"),
          },
          event.threadID,
          () => fs.unlinkSync("audio.mp3"),
          event.messageID
        );
      } else {
        return api.sendMessage(
          "❌ Invalid choice. Please reply with a number between 1 and 6.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        `❌ An error occurred: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};

// Helper: Download YouTube audio
async function downloadYouTubeAudio(videoID) {
  // Using the latest yt1s API for audio download
  const response = await axios.post(
    `${await baseApiUrl()}?url=https://www.youtube.com/watch?v=${videoID}`
  );
  if (!response.data || !response.data.links || !response.data.links.mp3) {
    throw new Error("Failed to retrieve download link.");
  }
  const audioUrl = response.data.links.mp3.mp3128.url;
  const title = response.data.title || "Unknown Title";
  return { title, audioUrl };
}

// Helper: Search YouTube
async function searchYouTube(keyword, maxResults) {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      keyword
    )}&type=video&maxResults=${maxResults}&key=AIzaSyCqox-KXEwDncsuo2HIpE0MF8J7ATln5Vc`
  );
  if (!response.data || !response.data.items) return [];
  return response.data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    duration: "Unknown Duration", // Add duration logic if needed
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.default.url,
  }));
}

// Helper: Download file
async function downloadFile(url, pathName) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(pathName, Buffer.from(response.data));
  return fs.createReadStream(pathName);
}

// Helper: Download thumbnail
async function downloadThumbnail(url, pathName) {
  const response = await axios.get(url, { responseType: "stream" });
  response.data.path = pathName;
  return response.data;
}
