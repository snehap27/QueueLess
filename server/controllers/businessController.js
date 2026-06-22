const Business = require("../models/Business");

const createBusiness = async (req, res) => {
  try {
    const { name, code } = req.body;

    const business = await Business.create({ // Create a new business with the provided and stores the business in the database. The ownerId is set to the ID of the currently authenticated user (req.user._id).
      name,
      code,
      ownerId: req.user._id
    });

    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBusiness };