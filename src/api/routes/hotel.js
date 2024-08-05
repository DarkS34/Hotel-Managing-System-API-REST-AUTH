const { isHotelManager, isAdmin } = require("../../middlewares/auth");
const { getHotelById, getHotels, postHotel, updateHotel, deleteHotel } = require("../controllers/hotel");

const hotelsRouter = require("express").Router();

hotelsRouter.get("/:id", getHotelById);
hotelsRouter.get("/", getHotels);
hotelsRouter.post("/", [isAdmin], postHotel);
hotelsRouter.put("/:id", [isHotelManager], updateHotel);
hotelsRouter.delete("/:id", [isAdmin], deleteHotel);

module.exports = hotelsRouter;
