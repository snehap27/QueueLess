const Business = require("../models/Business");


const createBusiness = async (req, res) => {
  console.log(req.headers);
  console.log(req.body);

  if (!req.body) {
    return res.status(400).json({
      message: "Request body is missing",
    });
  }
  try {
    const { name, code } = req.body;

    const business = await Business.create({
      name,
      code,
      ownerId: req.user._id,
    });

    res.status(201).json({
      message: "Business created successfully",
      business,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id });

    if (!business) {
      return res.status(404).json({ message: "No business found" });
    }

    return res.status(200).json(business);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const approveBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    business.isApproved = true;
    await business.save();

    res.status(200).json({
      message: "Business approved successfully",
      business,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const openQueue = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your business" });
    }

    if (!business.isApproved) {
      return res.status(400).json({ message: "Business not approved yet" });
    }

    business.queueOpen = true;
    await business.save();

    res.status(200).json({
      message: "Queue opened",
      business,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closeQueue = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your business" });
    }

    business.queueOpen = false;
    await business.save();

    res.status(200).json({
      message: "Queue closed",
      business,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({
      isApproved: true,
    }).select("name code queueOpen currentToken");

    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createBusiness,
  getMyBusiness,
  approveBusiness,
  openQueue,
  closeQueue,
  getBusinesses,
};
