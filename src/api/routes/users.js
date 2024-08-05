const { isAdmin, isHotelManager, isAuth } = require("../../middlewares/auth");
const {
  getUsers,
  register,
  login,
  convertToManager,
  bookAccommodation,
  convertToAdmin,
  updateUser,
  deleteUser,
  getUserById,
} = require("../controllers/users");

const usersRouter = require("express").Router();

usersRouter.get("/:id", [isAdmin], getUserById);
usersRouter.get("/", [isAdmin], getUsers);
usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.post(
  "/:newManagerId/to-manager/:hotelId",
  [isAdmin],
  convertToManager
);
usersRouter.post("/to-admin/:newAdminId", [isAdmin], convertToAdmin);
usersRouter.post("/:userId/book/:accommodationId", [isAuth], bookAccommodation);
usersRouter.put("/:id", [isAuth], updateUser);
usersRouter.delete("/:id", [isAuth], deleteUser);

module.exports = usersRouter;
