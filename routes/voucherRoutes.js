const express = require("express");
const authController = require("../controllers/authController");
const voucherController = require("../controllers/voucherController");

const router = express.Router();

router
	.route("/")
	.get(voucherController.getAllVouchers)
	.post(
		authController.protect,
		authController.restrictTo("admin"),
		voucherController.createVoucher
	);
router
	.route("/getAllCustomerVoucher")
	.get(
		authController.protect,
		authController.restrictTo("admin"),
		voucherController.getAllCustomerVoucher
	);

router
	.route("/:voucherId")
	.patch(
		authController.protect,
		authController.restrictTo("admin"),
		voucherController.updateVoucher
	)
	.delete(
		authController.protect,
		authController.restrictTo("admin"),
		voucherController.deleteVoucher
	)
	.get(authController.protect, voucherController.getOneVoucher);

module.exports = router;
