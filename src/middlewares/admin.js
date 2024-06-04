import { userRoles } from "../constants.js";
export const isAdmin = (req, res, next) => {
  try {
    console.log("is admin middleware called", req.user.role);
    if (req.user.role !== userRoles.Admin) {
      console.log("user-role", req.user.role);
      return res.status(403).send({
        message: "Route not accessible",
        success: false,
      });
    }
    next();
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong",
      success: false,
    });
  }
};
