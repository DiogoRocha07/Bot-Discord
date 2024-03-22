import { config } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { google } from "googleapis";
import { schedule } from "node-cron";

config();

const discordClient = new Client({
  intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
});

const youtubeClient = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

let latestVideoId = "";

discordClient.login(process.env.DISCORD_TOKEN);

discordClient.on("ready", () => {
  console.log(`Bot online, logado como ${discordClient.user.tag}`);
  checkNewVideos();
  schedule("* * 0 * * *", checkNewVideos)
});

async function checkNewVideos() {
  try {
    const response = await youtubeClient.search
      .list({
        channelId: "UCFjlKpJr0qXoY-PrUunXhDg",
        order: "date",
        part: "snippet",
        type: "video",
        maxResults: 1,
      })
      .then((res) => res);
    const latestVideo = response.data.items[0];
    console.log(latestVideo);
    if (latestVideo?.id.videoId != latestVideoId) {
      latestVideoId = latestVideo?.id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
      const message = "confira o ultimo video do canal ";
      const channel = discordClient.channels.cache.get("");
      channel.send(message + videoUrl);
    }
  } catch (err) {
    throw new Error("Erro ao enviar mensagem ao canal" + err);
  }
}
