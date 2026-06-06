const mongoose = require('mongoose');

const officerMovementSchema = new mongoose.Schema({
  officerName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  goingTo: {
    type: String,
    required: true
  },
  leavingHQOn: {
    type: Date,
    required: true
  },
  comingBackOn: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Leave', 'Duty'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OfficerMovement = mongoose.model('OfficerMovement', officerMovementSchema);

module.exports = OfficerMovement;
