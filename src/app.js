let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let stream = require("./ws/stream");
let path = require("path");
let favicon = require("serve-favicon");
const morgan = require("morgan");
const AudioRoom = require("./models/AudioRoom");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PollNQna = require("./models/PollNQna");
const Comment = require("./models/Comment");
require("dotenv").config();

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Database connected!"))
    .catch((err) => console.log(err));

app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(favicon(path.join(__dirname, "favicon.ico")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/create-room", async (req, res) => {
    try {
        const newRoom = new AudioRoom();
        newRoom.title = req.body?.title.toString();
        newRoom.sub_title = req.body?.subTitle.toString();
        newRoom.start_datetime = req.body?.startDatetime.toString();
        newRoom.created_by = req.body?.userId.toString();
        newRoom.record_session = req.body?.recordSession;
        newRoom.preview_background = req.body?.previewBg.toString();
        newRoom.entry_fee = parseInt(req.body?.entryFee);
        newRoom.affiliate_cut = parseInt(req.body?.affiliateCut);
        newRoom.speaking_queue = [];
        newRoom.url =
            "audio-room/" +
            req.body?.title.toString() +
            "/" +
            (Math.random() + 1).toString(36).substring(7);

        const roomData = (await newRoom.save()).toJSON();
        return res.json({ roomDetails: roomData });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/join-room", async (req, res) => {
    try {
        const communityId = req.body?.communityId.toString();
        const audioUrl = req.body?.audioUrl.toString();
        const userId = req.body?.userId.toString();

        const room = await AudioRoom.findOne({
            url: audioUrl,
            community_id: communityId,
        }).lean();

        if (room.start_datetime < Date.now().toString()) {
            console.log("Meeting not started yet");
            return res.json({ message: "Meeting has not started yet" });
        }

        const roomData = await AudioRoom.findOneAndUpdate(
            { url: audioUrl, community_id: communityId },
            { $push: { participants: userId } }
        ).lean();
        return res.json({ roomDetails: roomData });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/add-to-queue", async (req, res) => {
    try {
        const audioRoomId = req.body?.audioRoomId.toString();
        const userId = req.body?.userId.toString();
        const roomData = await AudioRoom.findByIdAndUpdate(
            audioRoomId,
            {
                $push: { speaking_queue: userId },
            },
            { new: true }
        ).lean();
        return res.json({ roomDetails: roomData });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/get-queue", async (req, res) => {
    try {
        const audioRoomId = req.body?.audioRoomId.toString();
        const roomData = await AudioRoom.findById(audioRoomId).lean();
        return res.json({ roomDetails: roomData });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/remove-from-queue", async (req, res) => {
    try {
        const audioRoomId = req.body?.audioRoomId.toString();
        const userId = req.body?.userId.toString();
        const roomData = await AudioRoom.findByIdAndUpdate(
            audioRoomId,
            {
                $pull: { speaking_queue: userId },
            },
            { new: true }
        ).lean();
        return res.json({ roomDetails: roomData });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/create-pollqna", async (req, res) => {
    try {
        let pollNQna = new PollNQna();
        pollNQna.audio_room_id = req.body?.audioRoomId.toString();
        pollNQna.question = req.body?.question.toString();
        pollNQna.options = req.body?.options; // options: [{option_id: <id>, option_name: "abc", is_right_answer: bool (if qna) answered_by: userId}]
        pollNQna.isPoll = req.body?.is_poll;
        pollNQna.community_id = req.body?.communityId.toString();
        pollNQna.isExpired = false;

        const newPollQna = (await pollNQna.save()).toJSON();

        return res.json({ pollNQnaDetails: newPollQna });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/expire-pollqna", async (req, res) => {
    try {
        const pollQnaId = req.body?.pollQnaId;
        const newPollQna = await PollNQna.findByIdAndUpdate(
            pollQnaId,
            { $set: { isExpired: true } },
            { new: true }
        ).lean();

        return res.json({ pollNQnaDetails: newPollQna });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/comment", async (req, res) => {
    try {
        let newComment = new Comment();

        newComment.user_id = req.body?.userId.toString();
        newComment.text = req.body?.text.toString();
        newComment.reaction = req.body?.reaction.toString() ?? "";
        newComment.is_by_creator = req.body?.isByCreator;
        newComment.audio_room_id = req.body?.audioRoomId.toString();

        const commentDetails = (await newComment.save()).toJSON();

        return res.json({ commentDetails: commentDetails });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

app.post("/get-comments", async (req, res) => {
    try {
        const comments = Comment.find({
            audio_room_id: req.body?.audioRoomId.toString(),
        }).lean();

        return res.json({ comments: comments });
    } catch (e) {
        console.log(e);
        throw e;
    }
});

io.of("/stream").on("connection", stream);

server.listen(3000, () => console.log("listening on port 3000"));
