const { default: mongoose } = require("mongoose");
const { generateSign } = require("../../middlewares/jwt");
const Hotel = require("../models/hotel");
const User = require("../models/user");
const Accommodation = require("../models/accommodation");
const bcrypt = require("bcrypt");

const register = async (req, res, next) => {
  try {
    const newUser = new User({
      userName: req.body.userName,
      password: req.body.password,
      managedHotel: null,
      bookedAccommodations: [],
    });

    if (await User.findOne({ userName: req.body.userName })) {
      return res.status(400).json("User with these credentials already exists");
    }

    const userSaved = await newUser.save();

    return res.status(201).json(userSaved);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    if (!user) return res.status(400).json("User or password incorrect");

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(400).json("User or password incorrect");
    } else {
      const token = generateSign(user._id);
      return res.status(200).json({ token, user });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const convertToManager = async (req, res, next) => {
  try {
    const { newManagerId, hotelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(newManagerId)) {
      return res
        .status(400)
        .json({ message: `Invalid ID format: ${newManagerId}` });
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: `Invalid ID format: ${hotelId}` });
    }

    const managerUser = await User.findById(newManagerId);
    const hotelToManage = await Hotel.findById(hotelId);

    if (!managerUser) {
      return res.status(404).json({ message: "Manager not found" });
    }
    if (!hotelToManage) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    managerUser.role = "hotel manager";
    managerUser.managedHotel = hotelId;
    const managerSaved = await managerUser.save();

    return res.status(200).json(managerSaved);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const convertToAdmin = async (req, res, next) => {
  try {
    const { newAdminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(newAdminId)) {
      return res
        .status(400)
        .json({ message: `Invalid ID format: ${newAdminId}` });
    }

    const newAdminUser = await User.findById(newAdminId);

    if (!newAdminUser) {
      return res.status(404).json({ message: "User not found" });
    }

    newAdminUser.role = "admin";
    const managerSaved = await newAdminUser.save();

    return res.status(200).json(managerSaved);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const bookAccommodation = async (req, res, next) => {
  try {
    const { userId, accommodationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: `Invalid ID format: ${userId}` });
    }

    if (!mongoose.Types.ObjectId.isValid(accommodationId)) {
      return res
        .status(400)
        .json({ message: `Invalid ID format: ${accommodationId}` });
    }

    const user = await User.findById(userId);
    const accommodation = await Accommodation.findById(accommodationId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    if (!user.bookedAccommodations.includes(accommodationId)) {
      if (accommodation.available) {
        user.bookedAccommodations.addToSet(accommodationId);
        accommodation.available = false;
        const userSaved = await user.save();
        userSaved.password = null;
        const accommodationSaved = await accommodation.save();
        return res.status(200).json({ userSaved, accommodationSaved });
      } else {
        return res.status(400).json({
          message: `Accommodation ${accommodationId} is not available at the moment.`,
        });
      }
    } else {
      return res.status(400).json({
        message: `User ${userId} already has booked accommodation ${accommodationId}`,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate({
        path: "managedHotel",
        select: ["name", "address"],
      })
      .populate({
        path: "bookedAccommodations",
        select: ["type", "nRooms", "location"],
        populate: {
          path: "hotel",
          select: ["name", "address"],
        },
      });

    return res.status(200).json(users);
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

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const user = await User.findById(id)
      .populate({
        path: "managedHotel",
        select: ["name", "address"],
      })
      .populate({
        path: "bookedAccommodations",
        select: ["type", "nRooms", "location"],
        populate: {
          path: "hotel",
          select: ["name", "address"],
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
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

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ID format: ${id}` });
    }
    const oldUser = await User.findById(id);

    if (!oldUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.user._id.equals(oldUser._id) || req.user.role === "admin") {
      return res
        .status(400)
        .json({ message: "A user can only modify his own credentials." });
    }

    const newUser = new User(req.body);

    newUser._id = id;
    if (req.body.userName) {
      const duplicateUser = await User.findOne({ userName: req.body.userName });
      if (duplicateUser && duplicateUser.userName !== oldUser.userName) {
        return res.status(400).json({
          message:
            "Impossible to modify username. A user with the same username already exists.",
        });
      } else {
        newUser.userName = req.body.userName;
      }
    }

    if (req.body.password) {
      newUser.password = bcrypt.hashSync(req.body.password, 10);
    }

    if (req.body.role) {
      newUser.role = oldUser.role;
    }

    if (req.body.managedHotel && req.user.role === "hotel manager") {
      const newHotelId = req.body.managedHotel;
      if (!mongoose.Types.ObjectId.isValid(newHotelId)) {
        return res
          .status(400)
          .json({ message: `Invalid ID format: ${newHotelId}` });
      }

      if (await Hotel.findById(newHotelId)) {
        newUser.managedHotel = newHotelId;
      } else {
        return res
          .status(404)
          .json({ message: `Hotel ${newHotelId} does not exists.` });
      }
    }

    if (req.body.bookedAccommodations) {
      newUser.bookedAccommodations = oldUser.bookedAccommodations;
    }

    const userUpdated = await User.findByIdAndUpdate(id, newUser, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json(userUpdated);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ID format: ${id}` });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.user._id.equals(user._id) && req.user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "A user can only delete his own user." });
    }

    user.bookedAccommodations.forEach(async (accId) => {
      const accommodation = await Accommodation.findById(accId);
      if (!accommodation) {
        return res
          .status(404)
          .json({ message: `Accommodation ${accId} not found` });
      }

      accommodation.available = true;
      await accommodation.save();
    });

    const userDeleted = await User.findByIdAndDelete(id);
    return res.status(200).json(userDeleted);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  convertToManager,
  convertToAdmin,
  bookAccommodation,
};
