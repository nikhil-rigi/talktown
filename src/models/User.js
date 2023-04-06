var mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
    {
        full_name: String,
        username: String,
        password: String,
        is_creator: Boolean,
        community_id: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
