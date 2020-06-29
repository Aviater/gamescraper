const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
	image: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	standardPrice: {
		type: Number,
		required: true,
	},
	discount: {
		type: String,
		required: true,
	},
	discountPrice: {
		type: Number,
		required: true,
	},
	historicalPrices: {
		type: Object,
	}
}, {
	timestamps: true
});

const Game = mongoose.model('game', gameSchema);

module.exports = Game;