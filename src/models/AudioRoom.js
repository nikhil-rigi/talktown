var mongoose = require("mongoose");

var audioRoomSchema = new mongoose.Schema(
    {
        title: String,
        sub_title: String,
        start_datetime: String,
        created_by: String,
        participants: Array,
        record_session: Boolean,
        preview_background: String,
        entry_fee: Number,
        affiliate_cut: Number,
        url: String,
        is_active: Boolean,
        speaking_queue: Array,
        community_id: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("audioroom", audioRoomSchema);
