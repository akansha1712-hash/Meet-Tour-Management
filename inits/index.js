const mongoose = require("mongoose");
const initData = require("./data.js"); // sampleMeetings data
const Meeting = require("../models/meeting.js"); // mongoose model

// Connect to the database
main()
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => {
    console.log("Connection error:", err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Ecor");
}

// Function to initialize DB with sample meetings
const initDB = async () => {
  await Meeting.deleteMany({});
  await Meeting.insertMany(initData.data);
  console.log("Meeting data was initialized");
};

initDB();
