const mongoose = require("mongoose");
const Hotel = require("./hotel");

const accommodationSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Types.ObjectId,
      ref: "hotels",
      required: true,
      immutable: true,
    },
    type: {
      type: String,
      require: true,
      enum: ["Guest room", "Suite", "Apartment"],
    },
    price: { type: Number, require: true, min: 1 },
    nRooms: { type: Number, require: true, min: 1, max: 4 },
    location: {
      floor: { type: Number, require: true, immutalbe: true },
      letter: { type: String, require: true, immutable: true },
    },
    available: { type: Boolean, require: true },
    onMaintenance: { type: Boolean, require: false },
  },
  {
    timestamps: true,
    collection: "accommodations",
  }
);

const Accommodation = mongoose.model(
  "accommodations",
  accommodationSchema,
  "accommodations"
);

module.exports = Accommodation;
