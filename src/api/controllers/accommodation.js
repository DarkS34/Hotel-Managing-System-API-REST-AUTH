const Accommodation = require("../models/accommodation");
const mongoose = require("mongoose");
const Hotel = require("../models/hotel");

const getAccommodations = async (req, res, next) => {
  try {
    const accommodations = await Accommodation.find({}).populate({
      path: "hotel",
      select: ["name", "address"],
    });
    return res.status(200).json(accommodations);
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

const getAccommodationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const accommodation = await Accommodation.findById(id).populate({
      path: "hotel",
      select: ["name", "address"],
    });

    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    return res.status(200).json(accommodation);
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

const postAccommodation = async (req, res, next) => {
  try {
    const newAccommodation = new Accommodation(req.body);
    const hotel = await Hotel.findById(req.body.hotel);

    if (hotel) {
      hotel.accommodations.addToSet(newAccommodation._id);
      hotel.nAvailableAccommodations++;
      await hotel.save();
    } else return res.status(404).json(`Hotel ${req.body.hotel} not found`);

    if (req.body.onMaintenance) {
      newAccommodation.available = false;
    } else {
      newAccommodation.onMaintenance = false;
    }

    const accommodationSaved = await newAccommodation.save();

    return res.status(201).json(accommodationSaved);
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

const updateAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const newAccommodation = new Accommodation(req.body);

    newAccommodation._id = id;
    if (req.body.onMaintenance) {
      newAccommodation.available = false;
    } else {
      newAccommodation.onMaintenance = false;
    }

    const accommodationUpdated = await Accommodation.findByIdAndUpdate(
      id,
      newAccommodation,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!accommodationUpdated) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    return res.status(200).json(accommodationUpdated);
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

const deleteAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const accommodationDeleted = await Accommodation.findByIdAndDelete(id);
    if (!accommodationDeleted) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    const accHotel = await Hotel.findById(accommodationDeleted.hotel);
    if (!accHotel) {
      return res
        .status(404)
        .json({ message: `Hotel ${accommodationDeleted.hotel} not found` });
    } else {
      accHotel.accommodations = accHotel.accommodations.filter(
        (e) => e.toJSON() !== id
      );
      accHotel.nAvailableAccommodations--;
      await Hotel.findByIdAndUpdate(accommodationDeleted.hotel, accHotel);
    }

    return res.status(200).json({
      message: "Accommodation deleted",
      element: accommodationDeleted,
    });
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

module.exports = {
  getAccommodations,
  getAccommodationById,
  postAccommodation,
  updateAccommodation,
  deleteAccommodation,
};
