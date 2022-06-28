const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Voucher = require("../models/voucherModel");
const factory = require("./handlerFactory");
const User = require("./../models/userModel");

exports.getAllVouchers = factory.getAllVoucher(Voucher);

exports.createVoucher = factory.createOne(Voucher);

exports.updateVoucher = factory.updateOne(Voucher);

exports.deleteVoucher = factory.deleteOne(Voucher);

exports.getOneVoucher = catchAsync(async (req, res, next) => {
	const voucher = await Voucher.findOne({ code: req.params.voucherId });

	if (!voucher) return next(new AppError("voucher này không tồn tại", 400));

	res.status(200).json({
		status: "success",
		data: {
			voucher,
		},
	});
});

exports.getAllCustomerVoucher = catchAsync(async (req, res, next) => {
	const { amountUser } = req.query;
	console.log("show amount user: ", amountUser);
	const role = "customer";
	let users = await User.find({ role });

	// if (amountUser === "user") {
	// 	return users;
	// }
	// if (amountUser === "all") {
	// 	return (users = null);
	// }
	//Send response
	res.status(200).json({
		status: "success",
		results: users.length,
		data: {
			users,
		},
	});
});
