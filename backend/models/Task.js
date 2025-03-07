const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  startTime: {
    type: Date,
    required: [true, "Start Time is required"],
    default: Date.now(),
  },
  endTime: {
    type: Date,
    required: [true, "End Time is required"],
  },
  priority: {
    type: Number,
    required: [true, "Priority is required"],
    min: [1, "Priority must be at least 1"],
    max: [5, "Priority cannot exceed 5"],
  },
  status: {
    type: String,
    enum: ["pending", "finished"],
    default: "pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
TaskSchema.pre("validate", function (next) {
  if (this.endTime < this.startTime) {
    this.invalidate("endTime", "End time must be after start time");
  }
  next();
});
module.exports = mongoose.model("Task", TaskSchema);
