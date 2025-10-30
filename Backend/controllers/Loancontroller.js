const Loan = require("../models/Loan");

exports.getLoanByType = async (req, res) => {
  try {
    const type = req.query.type;
    const loan = await Loan.findOne({ type });

    if (!loan) {
      return res.status(404).json({ message: "Loan type not found" });
    }

    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
