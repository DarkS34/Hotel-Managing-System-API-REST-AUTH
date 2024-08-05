const { isHotelManager } = require("../../middlewares/auth");
const {
  getAccommodationById,
  getAccommodations,
  postAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require("../controllers/accommodation");

const accommodationsRouter = require("express").Router();

accommodationsRouter.get("/:id", getAccommodationById);
accommodationsRouter.get("/", getAccommodations);
accommodationsRouter.post("/", [isHotelManager], postAccommodation);
accommodationsRouter.put("/:id", [isHotelManager], updateAccommodation);
accommodationsRouter.delete("/:id", [isHotelManager], deleteAccommodation);

module.exports = accommodationsRouter;
