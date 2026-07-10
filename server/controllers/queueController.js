// this file contains the logic for joining a queue for a business
const Queue = require("../models/Queue");
const Business = require("../models/Business");

// Join a customer to the queue
const joinQueue = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    if (!business.queueOpen) {
      return res.status(400).json({
        message: "Queue is closed",
      });
    }

    let queue = await Queue.findOne({ businessId });

    if (!queue) {
      queue = await Queue.create({
        businessId,
        customers: [],
      });
    }

    const alreadyInQueue = queue.customers.find(
      (customer) =>
        customer.customerId.toString() === req.user._id.toString() &&
        customer.status === "waiting"
    );

    if (alreadyInQueue) {
      return res.status(400).json({
        message: "You are already in this queue",
      });
    }

    business.currentToken += 1;

    const newCustomer = {
      customerId: req.user._id,
      tokenNumber: business.currentToken,
      status: "waiting",
      joinedAt: new Date(),
    };

    queue.customers.push(newCustomer);

    await queue.save();
    await business.save();

    res.status(200).json({
      message: "Joined queue successfully",
      tokenNumber: business.currentToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get queue status
const getQueueStatus = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    const queue = await Queue.findOne({ businessId });

    if (!queue) {
      return res.status(200).json({
        businessId,
        businessName: business.name,
        queueOpen: business.queueOpen,
        currentToken: business.currentToken,
        customers: [],
        waitingCount: 0,
        currentServing: null,
      });
    }

    const customer = queue.customers.find(
      (c) => c.customerId.toString() === req.user._id.toString()
    );

    if (!customer) {
      return res.status(404).json({
        message: "You are not in this queue",
      });
    }

    const waitingCustomers = queue.customers.filter(
      (c) => c.status === "waiting"
    );

    const servedCustomers = queue.customers.filter(
      (c) => c.status === "served"
    );

    const peopleAhead = waitingCustomers.filter(
      (c) => c.tokenNumber < customer.tokenNumber
    ).length;

    res.status(200).json({
      businessId,
      businessName: business.name,
      queueOpen: business.queueOpen,
      currentToken: business.currentToken,
      customers: queue.customers,
      waitingCount: waitingCustomers.length,
      currentServing:
        servedCustomers.length > 0
          ? servedCustomers[servedCustomers.length - 1]
          : null,
      tokenNumber: customer.tokenNumber,
      status: customer.status,
      peopleAhead,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Serve next customer
const serveNextCustomer = async (req, res) => {
  try {
    const { businessId } = req.params;

    const queue = await Queue.findOne({ businessId });

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    const nextCustomer = queue.customers.find(
      (customer) => customer.status === "waiting"
    );

    if (!nextCustomer) {
      return res.status(400).json({
        message: "No waiting customers",
      });
    }

    nextCustomer.status = "served";

    await queue.save();

    res.status(200).json({
      message: "Next customer served",
      servedCustomer: nextCustomer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  joinQueue,
  getQueueStatus,
  serveNextCustomer,
};