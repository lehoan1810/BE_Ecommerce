const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");

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

//export for using in app
module.exports = router;
