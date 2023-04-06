var mongoose = require("mongoose");

var pollNQnaSchema = new mongoose.Schema(
    {
        audio_room_id: String,
        question: String,
        options: Object,
        isPoll: Boolean,
        community_id: String,
        isExpired: Boolean,
    },
    { timestamps: true }
);

module.exports = mongoose.model("pollnqna", pollNQnaSchema);
