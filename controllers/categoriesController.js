const Joi = require("joi");
const { Categories } = require("../models");
const path = require("path");

module.exports = {
  postCategory: async (req, res) => {
    const body = req.body;
    try {
      const schema = Joi.object({
        categoryName: Joi.string().required(),
        caption: Joi.string().required(),
      });

      const { error } = schema.validate(
        {
          categoryName: body.categoryName,
          caption: body.caption,
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

      const check = await Categories.create({
        categoryName: body.categoryName,
        caption: body.caption,
      });

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
  getCategory: async (req, res) => {
    try {
      const category = await Categories.findAll({
        order: [["id", "ASC"]],
      });
      if (category.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
          data: null
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved category data",
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },
  updateCategory: async (req, res) => {
    const body = req.body;
    try {
      const schema = Joi.object({
        categoryName: Joi.string(),
        image_url: Joi.string(),
        caption: Joi.string(),
      });

      const { error } = schema.validate(
        {
          categoryName: body.categoryName,
          image_url: req.file ? req.file.path : "image_url",
          caption: body.caption,
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

      const updatedCategory = await Categories.update(
        {
          categoryName: body.categoryName,
          [req.file ? "image_url" : null]: req.file ? req.file.path : null,
          caption: body.caption,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );

      if (!updatedCategory[0]) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to update database",
          data: null
        });
      }

      const data = await Categories.findOne({
        where: {
          id: req.params.id,
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
  deleteCategory: async (req, res) => {
    const id = req.params.id;
    try {
      const check = await Categories.destroy({
        where: {
          id,
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
