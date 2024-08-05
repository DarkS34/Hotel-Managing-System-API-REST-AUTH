const User = require("../api/models/user");
const { verifyJwt } = require("./jwt");

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json("Unauthoraized");
    const { id } = verifyJwt(token);
    const user = await User.findById(id);
    user.password = null;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json("Unauthoraized");
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json("Unauthoraized");
    const { id } = verifyJwt(token);
    const user = await User.findById(id);
    if (user.role === "admin"){
      user.password = null;
      req.user = user;
      next();
    }else return res.status(401).json("Unauthoraized, not an admin");
  } catch (error) {
    return res.status(401).json("Unauthoraized");
  }
};

const isHotelManager = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json("Unauthoraized");
    const { id } = verifyJwt(token);
    const user = await User.findById(id);
    if (user.role === "hotel manager" || user.role === "admin"){
      user.password = null;
      req.user = user;
      next();
    }else return res.status(401).json("Unauthoraized, not a hotel manager");
  } catch (error) {
    return res.status(401).json("Unauthoraized");
  }
};


module.exports = { isAuth, isAdmin, isHotelManager};
