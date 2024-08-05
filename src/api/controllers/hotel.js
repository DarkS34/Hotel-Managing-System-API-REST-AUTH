const Accommodation = require("../models/accommodation");
const Hotel = require("../models/hotel");
const mongoose = require("mongoose");
const User = require("../models/user");

const getHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find().populate({
      path: "accommodations",
      select: ["type", "nRooms", "available"],
    });
    return res.status(200).json(hotels);
  } catch (error) {
    if (error.name === "MongoNetworkError") {
      return res
        .status(503)
        .json({ message: "Service Unavailable: " + error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error: " + error.message });
    }
  }
};

const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const hotel = await Hotel.findById(id).populate({
      path: "accommodations",
      select: ["type", "nRooms", "available"],
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    return res.status(200).json(hotel);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Bad Request: " + error.message });
    } else if (error.name === "MongoNetworkError") {
      return res
        .status(503)
        .json({ message: "Service Unavailable: " + error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error: " + error.message });
    }
  }
};

const postHotel = async (req, res, next) => {
  try {
    if (await Hotel.findOne({ name: req.body.name })) {
      return res
        .status(400)
        .json({ message: "Hotel with the same name already exists." });
    }

    const newHotel = new Hotel(req.body);
    newHotel.accommodations = [];
    newHotel.nAvailableAccommodations = 0;

    const hotelSaved = await newHotel.save();
    return res.status(201).json(hotelSaved);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Bad Request: " + error.message });
    } else if (error.name === "MongoNetworkError") {
      return res
        .status(503)
        .json({ message: "Service Unavailable: " + error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error: " + error.message });
    }
  }
};

const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const oldHotel = await Hotel.findById(id);
    if (!oldHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    if (
      req.body.name &&
      req.body.name !== oldHotel.name &&
      (await Hotel.findOne({ name: req.body.name }))
    ) {
      return res
        .status(400)
        .json({ message: "Hotel with the same name already exists." });
    }

    const newHotel = new Hotel(req.body);

    newHotel._id = id;
    newHotel.accommodations = oldHotel.accommodations;
    newHotel.nAvailableAccommodations = oldHotel.nAvailableAccommodations;

    const hotelUpdated = await Hotel.findByIdAndUpdate(id, newHotel, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(hotelUpdated);
  } catch (error) {
    if (error.name === "CastError" || error.name === "ValidationError") {
      return res.status(400).json({ message: "Bad Request: " + error.message });
    } else if (error.name === "MongoNetworkError") {
      return res
        .status(503)
        .json({ message: "Service Unavailable: " + error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error: " + error.message });
    }
  }
};

const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const hotelDeleted = await Hotel.findByIdAndDelete(id);
    if (!hotelDeleted) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    hotelDeleted.accommodations.forEach(async (e) => {
      await Accommodation.findByIdAndDelete(e);
    });

    const hotelManager = await User.findOne({ hotel: id });
    if (hotelManager) {
      hotelManager.hotel = null;
      hotelManager.role = "user";
      hotelManager.save();
    }

    return res.status(200).json({
      message: "Hotel deleted",
      element: hotelDeleted,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Bad Request: " + error.message });
    } else if (error.name === "MongoNetworkError") {
      return res
        .status(503)
        .json({ message: "Service Unavailable: " + error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error: " + error.message });
    }
  }
};

module.exports = {
  getHotels,
  getHotelById,
  postHotel,
  updateHotel,
  deleteHotel,
};
