const { Users, Limits, Safes, Transactions, Categories } = require("../models");
const Joi = require("joi");
const { Op } = require("sequelize");

module.exports = {
  postTransaction: async (req, res) => {
    const user = req.user;
    const body = req.body;
    try {
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

      const schema = Joi.object({
        user_id: Joi.number().required(),
        category_id: Joi.number().required(),
        safe_id: Joi.number().required(),
        detailExpense: Joi.string().required(),
        expense: Joi.number().required(),
      });

      const { error } = schema.validate(
        {
          user_id: user.id,
          category_id: body.category_id,
          safe_id: safeid[0],
          detailExpense: body.detailExpense,
          expense: body.expense,
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

      const safe = await Safes.findOne({
        where: {
          id: safeid,
          user_id: user.id,
        },
      });

      if (!safe) {
        return res.status(404).json({
          status: "failed",
          message: "Safe not found",
          data: null,
        });
      }

      const limit = await Limits.findOne({
        where: {
          safe_id: safeid,
          category_id: body.category_id,
          user_id: user.id,
        },
      });

      if (!limit) {
        return res.status(404).json({
          status: "failed",
          message:
            "Limit in this category is not found. Please set limit first",
          data: null,
        });
      }

      const create = await Transactions.create({
        user_id: user.id,
        category_id: body.category_id,
        safe_id: safeid,
        detailExpense: body.detailExpense,
        expense: body.expense,
        type: "expense",
        amount: limit.dataValues.newLimit - body.expense,
      });

      if (!create) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to save data to database",
          data: null,
        });
      }

      // to count all transaction type expense
      const expense = await Transactions.findAll({
        where: {
          user_id: user.id,
          safe_id: safeid,
          type: "expense",
        },
      });

      let allExpenses = expense.map((e) => {
        return e.dataValues.expense;
      });

      let sumExpense;
      if (allExpenses.length == 1) sumExpense = allExpenses[0];
      if (allExpenses.length > 1)
        sumExpense = allExpenses.reduce((a, b) => a + b);

      //to count all transaction type addIncome
      const addIncome = await Transactions.findAll({
        where: {
          user_id: user.id,
          safe_id: safeid,
          type: "addIncome",
        },
      });

      const allAddIncomes = addIncome.map((e) => {
        return e.dataValues.expense;
      });

      let sumIncome;
      if (allAddIncomes.length == 0) sumIncome = 0;
      if (allAddIncomes.length == 1) sumIncome = allAddIncomes[0];
      if (allAddIncomes.length > 1)
        sumIncome = allAddIncomes.reduce((a, b) => a + b);

      //hitung nilai safe baru
      const newSafe = safe.openingBalance + sumIncome - sumExpense;

      //update nilai safe
      const updateSafe = await Safes.update(
        {
          amount: newSafe,
        },
        {
          where: {
            id: safeid,
            user_id: user.id,
          },
        }
      );

      const findLimit = await Transactions.findAll({
        where: {
          safe_id: safeid,
          category_id: body.category_id,
          user_id: user.id,
        },
      });

      let limitTransaction = findLimit.map((e) => {
        return e.dataValues.expense;
      });

      let sumLimitTransaction;
      if (limitTransaction.length == 1)
        sumLimitTransaction = limitTransaction[0];
      if (limitTransaction.length > 1)
        sumLimitTransaction = limitTransaction.reduce((a, b) => a + b);

      const newLimit = limit.limit - sumLimitTransaction;

      const updateLimit = await Limits.update(
        {
          newLimit: newLimit,
        },
        {
          where: {
            category_id: body.category_id,
            user_id: user.id,
            safe_id: safeid,
          },
        }
      );

      const data = await Transactions.findOne({
        where: {
          id: create.dataValues.id,
          user_id: user.id,
        },
        include: [
          {
            model: Categories,
            as: "Categories",
            include: [
              {
                where: {
                  user_id: user.id,
                },
                model: Limits,
                as: "Limit",
                where: {
                  safe_id: safeid,
                },
              },
            ],
          },
          {
            model: Safes,
          },
        ],
      });

      if (newLimit < 0) {
        return res.status(201).json({
          status: "success",
          message: `Over limit ${newLimit}`,
          data: { data },
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Successfully saved data to database",
        data: { data },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
        data: null,
      });
    }
  },
  getAllTransactionDaily: async (req, res) => {
    const user = req.user;
    let date = req.query.date;
    let where;
    try {
      if (date) {
        if (!date.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)) {
          return res.status(400).json({
            status: "failed",
            message: "Date format not match",
          });
        }
        let dateFrom = new Date(date);
        let dateTo = new Date(date).setDate(new Date(date).getDate() + 1);
        where = {
          user_id: user.id,
          createdAt: {
            [Op.between]: [dateFrom, dateTo],
          },
        };
      } else {
        where = {
          user_id: user.id,
          createdAt: new Date(),
        };
      }
      const safe = await Transactions.findAll({
        where: {
          user_id: user.id,
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        attributes: ["safe_id"],
        raw: true,
      });
      const safeid = safe.map((e) => e.safe_id);
      const transactions = await Transactions.findAll({
        where: where,
        include: [
          {
            model: Categories,
            as: "Categories",
            include: [
              {
                where: {
                  user_id: user.id,
                  safe_id: safeid,
                },
                model: Limits,
                as: "Limit",
              },
            ],
          },
          {
            model: Safes,
          },
        ],
      });

      if (transactions.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
          data: null,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved data transactions",
        data: { transactions },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null,
      });
    }
  },
  getAllTransactionMonthly: async (req, res) => {
    const user = req.user;
    let date = req.query.date;

    try {
      if (date == null) date = new Date();
      const safe = await Transactions.findAll({
        where: {
          user_id: user.id,
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        attributes: ["safe_id"],
        raw: true,
      });
      const safeid = safe.map((e) => e.safe_id);

      const transactions = await Transactions.findAll({
        where: {
          user_id: user.id,
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        include: [
          {
            model: Categories,
            as: "Categories",
            include: [
              {
                where: {
                  user_id: user.id,
                  safe_id: safeid,
                },
                model: Limits,
                as: "Limit",
              },
            ],
          },
          {
            model: Safes,
          },
        ],
      });
      if (transactions.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
          data: null,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved data transactions",
        data: { transactions },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null,
      });
    }
  },
  updateTransaction: async (req, res) => {
    const user = req.user;
    const body = req.body;
    const { id } = req.params;
    try {
      const schema = Joi.object({
        category_id: Joi.number(),
        safe_id: Joi.number(),
        detailExpense: Joi.string(),
        expense: Joi.number(),
      });

      const { error } = schema.validate(
        {
          category_id: body.category_id,
          safe_id: body.safe_id,
          detailExpense: body.detailExpense,
          expense: body.expense,
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

      const before = await Transactions.findOne({
        where: {
          id: id,
          user_id: user.id,
        },
      });

      const updateTransaction = await Transactions.update(
        { ...body },
        { where: { id: id } }
      );

      if (!updateTransaction[0]) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to update transaction",
          data: null,
        });
      }

      const after = await Transactions.findOne({
        where: { id: id, user_id: user.id },
      });

      const safe = await Safes.findOne({
        where: {
          id: after.dataValues.safe_id,
          user_id: user.id,
        },
      });
      const newSafe =
        safe.dataValues.amount +
        before.dataValues.expense -
        after.dataValues.expense;

      const updateSafe = await Safes.update(
        {
          amount: newSafe,
        },
        {
          where: {
            id: after.dataValues.safe_id,
            user_id: user.id,
          },
        }
      );

      const update = await Transactions.update(
        {
          amount: newSafe,
        },
        {
          where: {
            id,
          },
        }
      );

      const data = await Transactions.findOne({
        where: { id: id, user_id: user.id },
      });

      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved data transactions",
        data: { data },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
        data: null,
      });
    }
  },
  deleteTransaction: async (req, res) => {
    const user = req.user;
    const id = req.params.id;
    try {
      const transaction = await Transactions.findOne({
        where: {
          id,
          user_id: user.id,
        },
      });

      const safe = await Safes.findOne({
        where: {
          user_id: user.id,
          id: transaction.dataValues.safe_id,
        },
      });

      const sum = safe.dataValues.amount + transaction.dataValues.expense;

      const updateSafe = await Safes.update(
        {
          amount: sum,
        },
        {
          where: {
            user_id: user.id,
            id: transaction.dataValues.safe_id,
          },
        }
      );

      const check = await Transactions.destroy({
        where: {
          user_id: user.id,
          id: id,
        },
      });

      if (!check) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to delete the data",
          data: null,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
        data: null,
      });
    }
  },
  postAddIncome: async (req, res) => {
    const user = req.user;
    const body = req.body;
    try {
      const schema = Joi.object({
        user_id: Joi.number().required(),
        safe_id: Joi.number().required(),
        expense: Joi.number().required(),
      });

      const { error } = schema.validate(
        {
          user_id: user.id,
          safe_id: body.safe_id,
          expense: body.expense,
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

      const safe = await Safes.findOne({
        where: {
          id: body.safe_id,
          user_id: user.id,
        },
      });

      if (!safe) {
        return res.status(404).json({
          status: "failed",
          message: "Safe not found",
          data: null,
        });
      }

      const create = await Transactions.create({
        user_id: user.id,
        safe_id: body.safe_id,
        expense: body.expense,
        amount: safe.dataValues.amount + body.expense,
        type: "addIncome",
      });

      if (!create) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to save add income to database",
          data: null,
        });
      }

      //hitung all expense type
      const expense = await Transactions.findAll({
        where: {
          user_id: user.id,
          safe_id: body.safe_id,
          type: "expense",
        },
      });

      let allExpenses = expense.map((e) => {
        return e.dataValues.expense;
      });

      let sumExpense;
      if (allExpenses.length == 0) sumExpense = 0;
      if (allExpenses.length == 1) sumExpense = allExpenses[0];
      if (allExpenses.length > 1)
        sumExpense = allExpenses.reduce((a, b) => a + b);

      //to count all transaction type addIncome -> hitung addIncome
      const addIncome = await Transactions.findAll({
        where: {
          user_id: user.id,
          safe_id: body.safe_id,
          type: "addIncome",
        },
      });

      const allAddIncomes = addIncome.map((e) => {
        return e.dataValues.expense;
      });

      let sumIncome;
      if (allAddIncomes.length == 1) sumIncome = allAddIncomes[0];
      if (allAddIncomes.length > 1)
        sumIncome = allAddIncomes.reduce((a, b) => a + b);

      //hitung nilai safe baru
      const newSafe = safe.openingBalance + sumIncome - sumExpense;

      //update nilai safe
      const updateSafe = await Safes.update(
        {
          amount: newSafe,
        },
        {
          where: {
            id: body.safe_id,
            user_id: user.id,
          },
        }
      );

      const data = await Transactions.findOne({
        where: {
          id: create.dataValues.id,
          user_id: user.id,
        },
        include: [
          {
            model: Safes,
          },
        ],
      });

      return res.status(200).json({
        status: "success",
        message: "Successfully saved add income to database",
        data: { data },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
        data: null,
      });
    }
  },
};
