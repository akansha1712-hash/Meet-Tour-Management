const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  meetingDate: {
    type: Date,
    required: true
  },
  meetingTime: {
    type: String,
    required: true,
    trim: true // Example: "11:00 AM"
  },
  meetingWith: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  isVIP: {
    type: Boolean,
    default: false
  },
  quickNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
