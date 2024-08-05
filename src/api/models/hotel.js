const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    address: { type: String, require: true },
    accommodations: [
      { type: mongoose.Types.ObjectId, ref: "accommodations", require: false },
    ],
    nAvailableAccommodations: { type: Number, require: false },
  },
  {
    timestamps: true,
    collection: "hotels",
  }
);

const Hotel = mongoose.model("hotels", hotelSchema, "hotels");

module.exports = Hotel;
