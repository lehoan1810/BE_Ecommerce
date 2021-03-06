const express = require("express");
const reviewRoutes = require("./../routes/reviewRoutes");
const authController = require("../controllers/authController");
const {
	createProduct,
	getProductsById,
	getProductDetail,
	updateProductById,
	deleteProductById,
	getAllProducts,
	get5ProductsNew,
	sortProductMinMax,
	sortProductMaxMin,
	sortTwoPrice,
	paginationProducts,
	paginationSort,

	getAllFiltered,
} = require("../controllers/product");
const router = express.Router();

router.post(
	"/addproduct",
	authController.protect,
	authController.restrictTo("assistant"),
	createProduct
);
router.get("/getProductsId/:id", getProductsById);
router.get("/getProductDetail/:id", getProductDetail);
router.patch(
	"/updateProductById/:id",
	authController.protect,
	updateProductById
);
router.get("/getAllProduct", getAllProducts);
router.get("/get5ProductsNew", get5ProductsNew);
router.delete("/deleteProductById", authController.protect, deleteProductById);
router.get("/sortMinMax/:id", sortProductMinMax);
router.get("/sortMaxMin/:id", sortProductMaxMin);
router.get("/sortTwoPrice/:id", sortTwoPrice);
router.get("/pagination/:id", paginationProducts);
router.get("/paginationSort/:id", paginationSort);

router.get("/:brandId/products", getAllFiltered);
//

// review product
router.use("/:productId/reviews", reviewRoutes);

module.exports = router;
