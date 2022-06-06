const User = require("../models/userModel");
var express = require("express");
var router = express.Router();
var $ = require("jquery");
const { parse } = require("path");

//  router.get('/', function(req, res, next){
//      res.render('orderlist', { title: 'Danh sách đơn hàng' })
//  });

//  router.get('/create_payment_url', function (req, res, next) {

//  var dateFormat = require('dateformat.');
//  var date = new Date();

//      var desc = 'Thanh toan don hang thoi gian: ' + dateFormat(date, 'yyyy-mm-dd HH:mm:ss');
//      console.log()
//      res.render('order', {title: 'Tạo mới đơn hàng', amount: 10000, description: desc})
//  });

router.post("/create_payment_url", function (req, res, next) {
	// cần truyền
	/**
	 * UserId: Id của người dùng
	 *
	 */
	console.log({ data: req.body });
	var ipAddr =
		req.headers["x-forwarded-for"] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;

	var config = require("config");
	//  var dateFormat = require('dateformat');

	var tmnCode = config.get("vnp_TmnCode");
	var secretKey = config.get("vnp_HashSecret");
	var vnpUrl = config.get("vnp_Url");
	var returnUrl = config.get("vnp_ReturnUrl");

	var date = new Date();

	var createDate =
		date.getFullYear() +
		("0" + (date.getMonth() + 1)).slice(-2) +
		("0" + date.getDate()).slice(-2) +
		("0" + date.getHours()).slice(-2) +
		("0" + date.getMinutes()).slice(-2) +
		("0" + date.getSeconds()).slice(-2); //dateFormat(date, 'yyyymmddHHmmss');
	var orderId = Number(new Date());
	var amount = req.body.amount || 100000;
	var bankCode = req.body.bankCode;

	var orderInfo = JSON.stringify(req.body.orderDescription);
	console.log(orderInfo);
	var orderType = req.body.orderType || "billpayment";
	var locale = req.body.language;
	if (locale === null || locale === "") {
		locale = "vn";
	}
	var currCode = "VND";
	var vnp_Params = {};
	vnp_Params["vnp_Version"] = "2.1.0";
	vnp_Params["vnp_Command"] = "pay";
	vnp_Params["vnp_TmnCode"] = tmnCode;
	// vnp_Params['vnp_Merchant'] = ''
	vnp_Params["vnp_Locale"] = locale;
	vnp_Params["vnp_CurrCode"] = currCode;
	vnp_Params["vnp_TxnRef"] = orderId;
	vnp_Params["vnp_OrderInfo"] = orderInfo;
	vnp_Params["vnp_OrderType"] = orderType;
	vnp_Params["vnp_Amount"] = amount * 100;
	vnp_Params["vnp_ReturnUrl"] = returnUrl;
	vnp_Params["vnp_IpAddr"] = ipAddr;
	vnp_Params["vnp_CreateDate"] = createDate;
	// if(bankCode !== null && bankCode !== ''){
	//     vnp_Params['vnp_BankCode'] = bankCode;
	// }

	vnp_Params = sortObject(vnp_Params);
	console.log(vnp_Params);

	var querystring = require("qs");
	var signData = querystring.stringify(vnp_Params, { encode: false });
	var crypto = require("crypto");
	var hmac = crypto.createHmac("sha512", secretKey);
	var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
	vnp_Params["vnp_SecureHash"] = signed;
	vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
	console.log(vnpUrl);
	//res.redirect(vnpUrl)
	return res.status(200).json({ url: vnpUrl });
});

router.get("/vnpay_return", async function (req, res, next) {
	var vnp_Params = req.query;

	var secureHash = vnp_Params["vnp_SecureHash"];

	delete vnp_Params["vnp_SecureHash"];
	delete vnp_Params["vnp_SecureHashType"];

	vnp_Params = sortObject(vnp_Params);

	var config = require("config");
	var tmnCode = config.get("vnp_TmnCode");
	var secretKey = config.get("vnp_HashSecret");

	var querystring = require("qs");
	var signData = querystring.stringify(vnp_Params, { encode: false });
	var crypto = require("crypto");
	var hmac = crypto.createHmac("sha512", secretKey);
	var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
	let drawData = JSON.parse(decodeURIComponent(vnp_Params?.vnp_OrderInfo));
	Object.keys(drawData).forEach((key) => {
		console.log(drawData[key]);
		drawData[key] = drawData[key].toString().replaceAll("+", " ");
	});
	vnp_Params.vnp_OrderInfo = drawData;

	if (secureHash === signed) {
		//Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
		// console.log(vnp_Params);

		// lấy thông tin người dùng
		let infoUser = await User.findOne({
			_id: vnp_Params?.vnp_OrderInfo?.userId,
		}).select({ "cart.items._id": 0 });
		// await User.findOneAndUpdate({ _id: vnp_Params?.vnp_OrderInfo?.userId }, {$set: {cart: {items: []}}})
		// console.log({ infoUser });
		const cart = infoUser.cart?.items;
		if (cart?.length > 0) {
			const dataCreate = {
				date: new Date(),
				items: cart || [],
				name: vnp_Params?.vnp_OrderInfo?.name,
				shippingAddress: vnp_Params?.vnp_OrderInfo?.shippingAddress,
				totalPrice: parseInt(vnp_Params?.vnp_OrderInfo?.totalPrice),
				status: 0,
			};
			const dataUpdate = [...infoUser?.purchasingHistory, { ...dataCreate }];
			console.log({ dataUpdate: dataUpdate });

			const signalUpdate = await User.updateOne(
				{ _id: vnp_Params?.vnp_OrderInfo?.userId },
				{
					$set: {
						cart: { item: [] },
						purchasingHistory: dataUpdate,
					},
				}
			);
			// console.log({signalUpdate});
			infoUser = await User.findOne({
				_id: vnp_Params?.vnp_OrderInfo?.userId,
			}).select({ "cart.items._id": 0 });
			// console.log({ infoUser });
		}
		// tao dữ liệu lưu vô purchangeHistory.
		res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
	} else {
		res.render("unsuccess", { code: "97" });
	}
});

router.get("/vnpay_ipn", function (req, res, next) {
	var vnp_Params = req.query;
	var secureHash = vnp_Params["vnp_SecureHash"];

	delete vnp_Params["vnp_SecureHash"];
	delete vnp_Params["vnp_SecureHashType"];

	vnp_Params = sortObject(vnp_Params);
	var config = require("config");
	var secretKey = config.get("vnp_HashSecret");
	var querystring = require("qs");
	var signData = querystring.stringify(vnp_Params, { encode: false });
	var crypto = require("crypto");
	var hmac = crypto.createHmac("sha512", secretKey);
	var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

	if (secureHash === signed) {
		var orderId = vnp_Params["vnp_TxnRef"];
		var rspCode = vnp_Params["vnp_ResponseCode"];
		//Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
		res.status(200).json({ RspCode: "00", Message: "success" });
	} else {
		res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
	}
});

function sortObject(obj) {
	var sorted = {};
	var str = [];
	var key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			str.push(encodeURIComponent(key));
		}
	}
	str.sort();
	for (key = 0; key < str.length; key++) {
		sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
	}
	return sorted;
}

module.exports = router;
