const Category = require("../models/category");
const slugify = require("slugify");
const catchAsync = require("./../utils/catchAsync");

const createCategories = (categories, parentId = null) => {
	const categoryList = [];
	let category;
	if (parentId == null) {
		category = categories.filter((cat) => cat.parentId == undefined);
	} else {
		category = categories.filter((cat) => cat.parentId == parentId);
	}

	for (let cate of category) {
		categoryList.push({
			_id: cate._id,
			name: cate.name,
			slug: cate.slug,
			imageCategory: cate.imageCategory,

			children: createCategories(categories, cate._id),
		});
	}
	return categoryList;
};

exports.addCategory = (req, res) => {
	const categoryObj = {
		name: req.body.name,
		slug: slugify(req.body.name),
		imageCategory: req.body.imageCategory,
	};
	if (req.body.parentId) {
		categoryObj.parentId = req.body.parentId;
	}
	const cat = new Category(categoryObj);
	cat.save((error, category) => {
		if (error) return res.status(400).json({ error });
		if (category) {
			return res.status(201).json({ category });
		}
	});
};

exports.getCategories = (req, res) => {
	const { haveProduct } = req.query;
	Category.find({}).exec((error, categories) => {
		if (error) return res.status(400).json({ error });
		if (categories) {
			let categoryList = createCategories(categories);
			console.log("show categoryList: ", haveProduct);
			if (+haveProduct === 1) {
				categoryList = categoryList.filter((item) => {
					return item.children.length === 0;
				});
			}
			if (+haveProduct === 2) {
				categoryList = categoryList.filter((item) => {
					return item.children.length > 0;
				});
			}

			return res.status(201).json({ categoryList });
		}
	});
};

exports.getAllBrand = (req, res) => {
	const { id } = req.params;
	// Category.findOne({ id: id }).exec((error, categories) => {
	// 	if (error) {
	// 		return res.status(400).json({ error });
	// 	}

	// 	return res.status(200).json({ categories });
	// });

	Category.find({}).exec((error, categories) => {
		if (error) return res.status(400).json({ error });
		if (categories) {
			const categoryList = createCategories(categories, id);
			return res.status(201).json({ categoryList });
		}
	});
};

exports.deleteCategory = catchAsync(async (req, res, next) => {
	const category = await Category.findByIdAndDelete(req.params.id);
	console.log(category);
	if (!category) {
		return next(new AppError(`No category found with this ID`, 404));
	}
	res.status(200).json({
		status: "x??a category th??nh c??ng",
		data: null,
	});
});
