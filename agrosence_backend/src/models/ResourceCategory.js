const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  purpose: {type: String, required: true},
  advantages: {type: String, required: true},
  popularbrand: {type: String, required: true},
  howtouse: {type: String, required: true},
  image: { type: String, required: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model("Resource", ResourceSchema);
module.exports = Resource;
