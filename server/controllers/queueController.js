// this file contains the logic for joining a queue for a business
// It will check if the business exists, if the queue is open, 
// and then add the customer to the queue with a token number.
const Queue = require("../models/Queue");
const Business = require("../models/Business");

// This function will allow a customer to join the queue for a business.
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

    let queue = await Queue.findOne({ businessId }); // await the queue for the business. If it doesn't exist, create a new one.

    if (!queue) {
      queue = await Queue.create({
        businessId,
        customers: [],
      });
    }

    // Checks if current user already exists in queue with:
    // status=waiting. If so, return an error message. This prevents a user from joining the same queue multiple times.
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

    // Emit a "queueUpdated" event to all clients in the business room to notify them of the queue update.
    const io = req.app.get("io");

    io.to(`business:${business._id}`).emit("queueUpdated");

    res.status(200).json({
      message: "Joined queue successfully",
      tokenNumber: business.currentToken, // return the token number to the customer
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// This function returns the current queue status for a business.


const getQueueStatus = async (req, res) => {
  try {
    const { businessId } = req.params;

    const queue = await Queue.findOne({ businessId });

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
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

    const peopleAhead = queue.customers.filter(
      (c) =>
        c.status === "waiting" &&
        c.tokenNumber < customer.tokenNumber
    ).length;

    const currentServing =
      queue.customers
        .filter((c) => c.status === "served")
        .sort((a, b) => b.tokenNumber - a.tokenNumber)[0]
        ?.tokenNumber || 0;

    res.status(200).json({
      businessName: business.name,
      tokenNumber: customer.tokenNumber,
      status: customer.status,
      peopleAhead,
      currentServing,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// this function will serve the next customer in the queue for a business.
// works by finding the queue for the business, then finding the next customer with status "waiting" 
// and changing their status to "served".
const serveNextCustomer = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not your business",
      });
    }

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

    const io = req.app.get("io"); // Get the Socket.IO server instance from the Express app

    io.to(`business:${business._id}`).emit("queueUpdated");

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

const getQueue = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not your business",
      });
    }

    const queue = await Queue.findOne({ businessId }).populate(
      "customers.customerId",
      "name email"
    );

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    res.status(200).json(queue);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// exports the joinQueue, getQueueStatus, and serveNextCustomer functions to be used in other files

module.exports = {
  joinQueue,
  getQueueStatus,
  getQueue,
  serveNextCustomer,
};
