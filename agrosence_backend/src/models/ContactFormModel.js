// models/ContactFormModel.js
const mongoose = require('mongoose');

const ContactFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ContactForm', ContactFormSchema);
