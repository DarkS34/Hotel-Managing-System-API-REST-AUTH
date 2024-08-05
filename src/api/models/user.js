const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, require: true },
    password: { type: String, require: true },
    role: {
      type: String,
      require: true,
      enum: ["admin", "user", "hotel manager"],
      default: "user",
    },
    managedHotel: {
      type: mongoose.Types.ObjectId,
      ref: "hotels",
      require: false,
    },
    bookedAccommodations: [
      { type: mongoose.Types.ObjectId, ref: "accommodations", require: false },
    ],
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.pre("save", function () {
  this.password = bcrypt.hashSync(this.password, 10);
});

const User = mongoose.model("users", userSchema, "users");

module.exports = User;
