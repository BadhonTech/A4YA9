const axios = require("axios");
const fs = require("fs");

// YouTube API Key
const YOUTUBE_API_KEY = "AIzaSyCqox-KXEwDncsuo2HIpE0MF8J7ATln5Vc";

// Helper Functions
async function downloadFile(url, pathName) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(pathName, Buffer.from(response.data));
  return fs.createReadStream(pathName);
}

async function downloadStream(url, pathName) {
  const response = await axios.get(url, { responseType: "stream" });
  response.data.path = pathName;
  return response.data;
}

// YouTube Search API
async function searchYouTube(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(
    query
  )}&key=${YOUTUBE_API_KEY}`;
  const response = await axios.get(url);
  return response.data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high.url,
  }));
}

// YouTube Download API (Example: ytmp3.cc API or similar)
async function downloadYouTubeAudio(videoID) {
  const url = `https://yt1s.com/api/ajaxSearch/index?url=https://www.youtube.com/watch?v=${videoID}`;
  const response = await axios.post(url, null);
  const audioUrl = response.data.links.mp3.mp3128.url;
  const title = response.data.title;
  return { title, audioUrl };
}

// Main Command
module.exports = {
  config: {
    name: "sing",
    version: "1.1.5",
    aliases: ["music", "play"],
    author: "dipto",
    countDown: 5,
    role: 0,
    description: {
      en: "Download audio from YouTube",
    },
    category: "media",
    guide: {
      en: "{pn} [<song name>|<song link>]:\nExample:\n{pn} chipi chipi chapa chapa",
    },
  },

  onStart: async ({ api, args, event, commandName, message }) => {
    const checkUrl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    let videoID;

    // Check if the argument is a YouTube URL
    const isYouTubeUrl = checkUrl.test(args[0]);
    if (isYouTubeUrl) {
      const match = args[0].match(checkUrl);
      videoID = match ? match[1] : null;
      const { title, audioUrl } = await downloadYouTubeAudio(videoID);
      return api.sendMessage(
        {
          body: title,
          attachment: await downloadFile(audioUrl, "audio.mp3"),
        },
        event.threadID,
        () => fs.unlinkSync("audio.mp3"),
        event.messageID
      );
    }

    // Handle search by keywords
    const keyword = args.join(" ");
    let searchResults;
    try {
      searchResults = await searchYouTube(keyword);
    } catch (err) {
      return api.sendMessage(
        `❌ Error occurred: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }

    if (searchResults.length === 0) {
      return api.sendMessage(
        `⭕ No search results found for: ${keyword}`,
        event.threadID,
        event.messageID
      );
    }

    let msg = "";
    const thumbnails = [];
    searchResults.forEach((item, index) => {
      thumbnails.push(downloadStream(item.thumbnail, "photo.jpg"));
      msg += `${index + 1}. ${item.title}\nChannel: ${item.channel}\n\n`;
    });

    return api.sendMessage(
      {
        body: msg + "Reply to this message with the number of your choice.",
        attachment: await Promise.all(thumbnails),
      },
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          searchResults,
        });
      },
      event.messageID
    );
  },

  onReply: async ({ event, api, Reply }) => {
    try {
      const { searchResults } = Reply;
      const choice = parseInt(event.body, 10);

      if (!isNaN(choice) && choice > 0 && choice <= searchResults.length) {
        const selectedVideo = searchResults[choice - 1];
        const { title, audioUrl } = await downloadYouTubeAudio(selectedVideo.id);

        await api.unsendMessage(Reply.messageID);
        return api.sendMessage(
          {
            body: `• Title: ${title}`,
            attachment: await downloadFile(audioUrl, "audio.mp3"),
          },
          event.threadID,
          () => fs.unlinkSync("audio.mp3"),
          event.messageID
        );
      } else {
        return api.sendMessage(
          "Invalid choice. Please enter a number between 1 and 6.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "⭕ An error occurred while processing your request.",
        event.threadID,
        event.messageID
      );
    }
  },
};
