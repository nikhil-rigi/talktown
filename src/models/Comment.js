var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema(
    {
        user_id: String,
        text: String,
        reaction: String,
        audio_room_id: String,
        is_by_creator: Boolean,
    },
    { timestamps: true }
);

module.exports = mongoose.model("comment", commentSchema);
