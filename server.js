
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to access backend

const DATA_FILE = "surveyData.json";

// 📌 API: Get Survey Data
app.get("/survey", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading data" });
    res.json(JSON.parse(data));
  });
});

// 📌 API: Vote on a Topic (Uses ID instead of name)
// 📌 API: Vote on a Topic
app.post("/vote", (req, res) => {
   // console.log("Vote received:", req.body);
    const { headlineId, topicId, vote } = req.body; // Get data from frontend

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading file" });

        let surveyData = JSON.parse(data);

        // Find the headline and topic
        let headlineObj = surveyData.headlines.find(h => h.id === headlineId);
        if (!headlineObj) return res.status(404).json({ error: "Headline not found" });

        let topic = headlineObj.topics.find(t => t.id === topicId);
        if (!topic) return res.status(404).json({ error: "Topic not found" });

        // ✅ Ensure totalVotes is initialized
        if (!topic.totalVotes) topic.totalVotes = topic.yes + topic.no;

        // ✅ Update votes
        if (vote === "yes") topic.yes += 1;
        else if (vote === "no") topic.no += 1;

        topic.totalVotes += 1; // Update total votes

        // ✅ Recalculate percentages
        topic.yesPercentage = ((topic.yes / topic.totalVotes) * 100).toFixed(2);
        topic.noPercentage = ((topic.no / topic.totalVotes) * 100).toFixed(2);

        // Save back to JSON file
        fs.writeFile(DATA_FILE, JSON.stringify(surveyData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Error saving vote" });
            res.json({ message: "Vote counted", updatedTopic: topic });
        });
    });
});



// Start the server
app.listen(5000, () => console.log("Server running on port 5000"));
