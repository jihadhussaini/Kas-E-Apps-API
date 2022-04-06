const { Safes, Users } = require("../models");
const Joi = require("joi");
const { Op } = require("sequelize");

module.exports = {
  createSafe: async (req, res) => {
    const user = req.user;
    const body = req.body;
    try {
      const schema = Joi.object({
        user_id: Joi.number().required(),
        safeName: Joi.string().min(4).required(),
        amount: Joi.number().required(),
      });
      const check = schema.validate(
        {
          user_id: user.id,
          safeName: body.safeName,
          amount: body.amount,
        },
        { abortEarly: false }
      );

      if (check.error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: check.error["details"][0]["message"],
          data: null,
        });
      }

      const safe = await Safes.create({
        user_id: user.id,
        safeName: body.safeName,
        amount: body.amount,
        openingBalance: body.amount,
      });
      if (safe) {
        return res.status(200).json({
          success: true,
          message: "Successfully created safe",
          data: safe,
        });
      } else {
        return res.status(401).json({
          message: "Failed to create user safe",
          data: null,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
        data: null,
      });
    }
  },
  getSafe: async (req, res) => {
    const user = req.user;
    let date = new Date()
    try {
      const safe = await Safes.findAll({
        where: {
          user_id: user.id,
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        include: [
          {
            model: Users,
            as: "user",
            attributes: {
              exclude: ["password", "confirmPassword", "verifCode"],
            },
          },
        ],
      });

      if (!safe.length) {
        return res.status(400).json({
          status: "failed",
          message: "There's no safe in database!",
          data: null,
        });
      } else {
        return res.status(200).json({
          success: { message: "This is the list of safes" },
          data: safe,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
        data: null,
      });
    }
  },

  updateSafe: async(req, res) => {
        const user = req.user;
        const body = req.body;
        try {
            const schema = Joi.object({
                user_id: Joi.number(),
                safeName: Joi.string(),
                amount: Joi.number(),
            });

            const { error } = schema.validate({
                user_id: user.id,
                safeName: body.safeName,
                amount: body.amount,
            }, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    status: 'failed',
                    message: "Bad Request",
                    errors: error["details"][0]["message"],
                    data: null
                });
            };

            const userSafe = await Safes.findAll({
                where: {
                    user_id: user.id,
                },
                include: [{
                    model: Users,
                    as: "user",
                    attributes: {
                        exclude: ["password", "confirmPassword", "verifCode"]
                    }
                }]
            });

            if (!userSafe.length) {
                return res.status(400).json({
                    status: "failed",
                    message: "There's no safe to be updated!",
                    data: null
                })
            };
            
            const listSafes = userSafe.map((e) => {
                return e.dataValues.id;
            });
            
            const sortedList = listSafes.sort(function(a, b) {
                return a - b;
            });
            
            const targetedId = sortedList[sortedList.length - 1];

            const safe = await Safes.findOne({
                where: {
                    id: targetedId,
                    user_id: user.id
                }
            });

            let updateSafe;
            if (body.amount) {
                const newAmount = body.amount - (safe.dataValues.openingBalance - safe.dataValues.amount)
                updateSafe = await Safes.update({
                    user_id: user.id,
                    safeName: body.safeName,
                    openingBalance: body.amount,
                    amount: newAmount,
                    id: targetedId
                }, {
                    where: {
                        user_id: user.id,
                        id: targetedId
                    }
                });
            };

            updateSafe = await Safes.update({
                user_id: user.id,
                safeName: body.safeName,
                id: targetedId
            }, {
                where: {
                    user_id: user.id,
                    id: targetedId
                }
            });

            if (!updateSafe[0]) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Failed to update safe. You can not update other people safe',
                    data: null
                })
            };

            const data = await Safes.findOne({
                where: {
                    user_id: user.id,
                    id: targetedId
                }
            });

            return res.status(200).json({
                status: 'success',
                message: 'Successfully retrieved data safe',
                updatedSafe: { data }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'failed',
                message: 'Internal server error',
                data: null
            })
        };
    },
  deleteSafe: async (req, res) => {
    try {
      const deletedSafe = await Safes.destroy({
        where: {
          id: req.params.id,
        },
      });

      if (!deletedSafe) {
        return res.status(400).json({
          status: "failed",
          message: "Failed to delete!",
          data: null,
        });
      } else {
        return res.status(200).json({
          status: "success",
          message: "Successfully delete safe!",
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
        data: null,
      });
    }
  },
};
