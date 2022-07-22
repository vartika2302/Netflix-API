const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken");

//Update
router.put("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//Delete
router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("Account deleted successfully!");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You are not delete this account!");
  }
});

//Get
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...otherInfo } = user._doc;
    return res.status(200).json(otherInfo);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//Get all
router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const query = req.query.new;
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(1)
        : await User.find();
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You are not allowed to see all users!");
  }
});

//Get all stats
router.get("/stats", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const today = new Date();
    const lastYear = today.setFullYear(today.setFullYear() - 1);
    const monthsArray = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    try {
      const data = await User.aggregate([
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You are not allowed to get user stats!");
  }
});

module.exports = router;
