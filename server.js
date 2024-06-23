const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

const { OPENAI_API_KEY, TRANSLATE_API_URL, MONGODB_URI } = process.env;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const chatSchema = new mongoose.Schema({
  userMessage: String,
  botResponse: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

async function translate(text, sourceLang, targetLang) {
  const response = await axios.post(TRANSLATE_API_URL, {
    q: text,
    source: sourceLang,
    target: targetLang,
    format: "text",
  });
  return response.data.translatedText;
}

async function getResponse(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/completions",
    {
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].text.trim();
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const hausaMessage = await translate(userMessage, "en", "ha");
    const botResponse = await getResponse(hausaMessage);
    const translatedResponse = await translate(botResponse, "ha", "en");

    const chat = new Chat({ userMessage, botResponse: translatedResponse });
    await chat.save();

    res.json({ response: translatedResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle all other routes and serve the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
