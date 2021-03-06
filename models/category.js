const mongoose = require("mongoose");
const categoryShema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		parentId: {
			type: String,
		},

		imageCategory: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);
module.exports = mongoose.model("category", categoryShema);
