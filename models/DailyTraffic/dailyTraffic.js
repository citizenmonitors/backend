import mongoose from 'mongoose';

const dailyTrafficSchema = new mongoose.Schema({
  date: {
    type: String,
    unique: true,
    required: true,
  },
  loginCount: {
    type: Number,
    // default: 0,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
    },
  ],
});

const DailyTraffic = mongoose.model('DailyTraffic', dailyTrafficSchema);

export default DailyTraffic;
