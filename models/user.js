const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    rollno: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      default: "",
    },
    lastname: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: 'student',
    },
    phone: {
      type: String,
      default: "",
    },
    course: {
      type: String,
      default: "MCA",
    },
    semester: {
      type: String,
      default: "",
    },
    passwordupdated: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: "",
    },
    fathersname: {
      type: String,
      default: "",
    },
    mothersname: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    hasresume: {
      type: Boolean,
      default: false,
    },
    accountactivated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
