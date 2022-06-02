const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");
const storage = require("../firebase/firebase");

const multer = require("multer");
const { ref, uploadBytes, listAll, deleteObject } = require("firebase/storage");

const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

//Create router for review
const router = express.Router({ mergeParams: true });

router
	.route("/")
	.post(
		authController.protect,
		authController.restrictTo("customer"),
		reviewController.setProductUserIds,
		reviewController.createReview
	)
	.get(reviewController.getAllReviews);

router
	.route("/:id")
	.get(reviewController.getReview)
	.patch(
		authController.protect,
		authController.restrictTo("customer"),
		reviewController.updateReview
	)
	.delete(
		authController.protect,
		authController.restrictTo("customer", "admin"),
		reviewController.deleteReview
	);

router.route("/clear").post(upload.single("pic"), async (req, res) => {
	const file = req.file;
	const imageRef = ref(storage, file.originalname);
	const metatype = { contentType: file.mimetype, name: file.originalname };
	await uploadBytes(imageRef, file.buffer, metatype)
		.then((snapshot) => {
			res.send("uploaded!");
		})
		.catch((error) => console.log(error.message));
});
router.route("/pictures").get(async (req, res) => {
	return;
	const listRef = ref(storage);
	console.log("listRef");
	let productPictures = [];
	await listAll(listRef)
		.then((pics) => {
			productPictures = pics.items.map((item) => {
				const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${item._location.bucket}/o/${item._location.path_}?alt=media`;
				return {
					url: publicUrl,
					name: item._location.path_,
				};
			});
			res.send(productPictures);
		})
		.catch((error) => console.log(error.message));
});

//export for using in app
module.exports = router;
