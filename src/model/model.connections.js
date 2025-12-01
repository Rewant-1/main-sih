const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
    },
    connectionDate: { type: Date, default: Date.now },
});

const ConnectionModel = mongoose.model("Connection", connectionSchema);

module.exports = ConnectionModel;
