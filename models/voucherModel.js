const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
	code: {
		type: String,
	},
	discountPercent: {
		type: Number,
	},
	describe: {
		type: String,
	},
	valid: {
		type: Boolean,
		default: true,
	},
	dateStart: {
		type: String,
	},
	dateEnd: {
		type: String,
	},
	userVoucher: {
		type: String,
		default: "all",
	},
});

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
