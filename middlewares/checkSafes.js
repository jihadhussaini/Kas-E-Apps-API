const { Safes } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const check = await Safes.findOne({
      where: {
        user_id: user.id,
      },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "createdAt"],
    });

    if (!check) {
      return res.status(200).json({
        status: "failed",
        message: "You dont have safe yet",
        data: null,
      });
    }

    const month = new Date(check.createdAt).getMonth() + 1;
    const now = new Date().getMonth() + 1;
    if (month !== now) {
      return res.status(200).json({
        status: "failed",
        message: "Create your safe first",
        data: null,
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      status: "failed",
      message: error.message,
      data: null,
    });
  }
};
