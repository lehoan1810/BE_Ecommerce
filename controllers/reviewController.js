const Review = require("./../models/reviewModel");
const factory = require("./handlerFactory");

// config upload image with firebase
const storage = require("../firebase/firebase");
const multer = require("multer");
const { ref, uploadBytes, listAll, deleteObject } = require("firebase/storage");

const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

exports.uploadPhoto = async (req, res) => {
	const file = req.file;
	const imageRef = ref(storage, file.originalname);
	const metatype = { contentType: file.mimetype, name: file.originalname };
	await uploadBytes(imageRef, file.buffer, metatype)
		.then((snapshot) => {
			res.send("uploaded!");
		})
		.catch((error) => console.log(error.message));
};

exports.setProductUserIds = (req, res, next) => {
	if (!req.body.product) req.body.product = req.params.productId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};

// exports.getAllReviews = factory.getAll(Review);
exports.getAllReviews = (req, res) => {
	const { productId } = req.params;
	console.log(productId);
	Review.find({}).exec((error, data) => {
		if (error) return res.status(400).json({ error });
		if (data) {
			res.status(200).json({ data });
		}
	});
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
