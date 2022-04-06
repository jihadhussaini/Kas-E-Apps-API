const { Transactions, Categories, Safes } = require("../models");
const { Op } = require("sequelize");

// Daily Report
module.exports = {
  getDaily: async (req, res) => {
    const user = req.user;
    let date = req.query.date;
    try {
      if (date == null) {
        date = new Date();
      }
      const expense = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "expense",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date),
          },
        },
        include: [
          {
            model: Categories,
            as: "Categories",
            attributes: ["categoryName", "image_url"],
          },
        ],
      });

      if (!expense) {
        return res.status(404).json({
          status: "failed",
          message: "Transaction not found",
          data: null,
        });
      }

      const addIncome = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "addIncome",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date),
          },
        },
        attributes: {
          exclude: ["category_id", "detailExpense"],
        },
        include: {
          model: Safes,
          as: "Safe",
          attributes: ["safeName", "openingBalance"],
        },
      });

      if (!addIncome) {
        return res.status(404).json({
          status: "failed",
          message: "Transaction not found",
          data: null,
        });
      }

      if (expense.length == 0 && addIncome.length == 0) {
        return res.status(200).json({
          status: "success",
          message: "daily report transaction retrieved successfully",
          expense: null,
          addIncome: null,
        });
      } else if (expense.length == 0) {
        return res.status(200).json({
          status: "success",
          message: "daily report transaction retrieved successfully",
          expense: null,
          addIncome: addIncome,
        });
      } else if (addIncome.length == 0) {
        return res.status(200).json({
          status: "success",
          message: "daily report transaction retrieved successfully",
          expense: expense,
          addIncome: null,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "daily report transaction retrieved successfully",
        expense: expense,
        addIncome: addIncome,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        data: null,
      });
    }
  },
  getMonthly: async (req, res) => {
    const user = req.user;
    let date = req.query.date;
    try {
      if (date == null) {
        date = new Date();
      }
      const expense = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "expense",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        include: [
          {
            model: Categories,
            as: "Categories",
            attributes: ["categoryName", "image_url"],
          },
        ],
      });

      if (!expense) {
        return res.status(404).json({
          status: "failed",
          message: "Transaction not found",
          data: null,
        });
      }

      const addIncome = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "addIncome",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        attributes: {
          exclude: ["category_id", "detailExpense"],
        },
        include: {
          model: Safes,
          as: "Safe",
          attributes: ["safeName", "openingBalance"],
        },
      });
      if (!addIncome) {
        return res.status(404).json({
          status: "failed",
          message: "Transaction not found",
          data: null,
        });
      }
      if (expense.length == 0 && addIncome.length == 0) {
        return res.status(200).json({
          status: "success",
          message: "Monthly report transaction retrieved successfully",
          expense: null,
          addIncome: null,
        });
      } else if (expense.length == 0) {
        return res.status(200).json({
          status: "success",
          message: "Monthly report transaction retrieved successfully",
          expense: null,
          addIncome: addIncome,
        });
      } else if (addIncome.length == 0) {
        return res.status(200).json({
          status: "success",
          message: "Monthly report transaction retrieved successfully",
          expense: expense,
          addIncome: null,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Monthly report transaction retrieved successfully",
        expense: expense,
        addIncome: addIncome,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: { message: "Internal Server Error" },
        data: null,
      });
    }
  },
};
