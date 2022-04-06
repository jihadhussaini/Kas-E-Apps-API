const Joi = require("joi");
const { Limits, Categories,Safes } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  postLimit: async (req, res) => {
    const body = req.body;
    const user = req.user;
    const category = body.map((x) => x.category_id);
    const limit = body.map((x) => x.limit);
    const data = [];
    const safedata = await Safes.findAll({
      where: {
        user_id: user.id,
        createdAt: {
          [Op.lt]: new Date().setDate(new Date().getDate() + 1),
          [Op.gt]: new Date().setDate(1),
        },
      },
      attributes: ["id"],
      raw: true,
    });
    const safeid = safedata.map((e) => e.id);
    for (var i = 0; i < body.length; i++) {
      data.push({
        category_id: category[i],
        limit: limit[i],
        safe_id: safeid,
        user_id: user.id,
        newLimit: limit[i]
      });
    }
    try {
      const check = await Limits.bulkCreate(data);

      if (!check) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to save the data to database",
          data: null
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully saved to database",
        data: check,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },
  getAllLimit: async (req, res) => {
    const user = req.user
    try {
      const limit = await Limits.findAll({
        where:{
          user_id: user.id
        },
        include: [
          {
            model: Categories,
            as: "Category",
          },
        ],
      });
      if (limit.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
          data: null
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved limit data",
        data: limit,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },
  getLimit: async (req, res) => {
    const user = req.user
    try {
      const limit = await Limits.findAll({
        where: {
          user_id: user.id,
        },
        include: [
          {
            model: Categories,
            as: "Limit",
          },
        ],
        order:[['category_id','ASC']]
      });
      if (limit.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
          data: null
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved limit data",
        data: limit,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },
  updateLimit: async (req, res) => {
    const body = req.body;
    const user = req.user;
    try {
      const schema = Joi.object({
        category_id: Joi.number(),
        limit: Joi.number(),
      });

      const { error } = schema.validate(
        {
          category_id: body.category_id,
          limit: body.limit,
        },
        { abortEarly: false }
      );

      if (error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: error["details"][0]["message"],
        });
      }

      const updatedLimit = await Limits.update(
        { 
          limit: body.limit 
        },
        {
          where: {
            user_id: user.id,
            category_id: body.category_id
          },
        }
      );

      if (!updatedLimit[0]) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to update database",
          data: null
        });
      }

      const data = await Limits.findOne({
        where: {
          user_id: user.id,
          category_id: body.category_id
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Data updated successfully",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },
  deleteLimit: async (req, res) => {
    const user = req.user;
    const body= req.body
    try {
      const check = await Limits.destroy({
        where: {
          category_id: body.category_id,
          user_id: user.id
        },
      });
      if (!check) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to delete the data",
          data: null
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },
};
