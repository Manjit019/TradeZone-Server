import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import "../errors/index.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/index.js";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please add a valid email"],
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      maxLength: 50,
      minLength: 3,
    },
    login_pin: {
      type: String,
      minLength: 4,
    },
    phone_number: {
      type: String,
      match: [/^[0-9]{10}$/, "Please add a valid phone number"],
      unique: true,
      sparse: true,
    },
    date_of_birth: Date,
    biometricKey: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    wrong_pin_attempts: {
      type: Number,
      default: 0,
    },
    block_until_pin: {
      type: Date,
      default: null,
    },
    wrong_password_attempts: {
      type: Number,
      default: 0,
    },
    block_until_password: {
      type: Date,
      default: null,
    },
    balance: {
      type: Number,
      default: 50000.0,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

UserSchema.pre("save", async function () {
  if (this.isModified("login_pin")) {
    const salt = await bcrypt.genSalt(10);
    this.login_pin = await bcrypt.hash(this.login_pin, salt);
  }
});

UserSchema.statics.updatePIN = async function (email, newPin) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new NotFoundError("User Not Found");
    }
    const isSamePIN = await bcrypt.compare(newPin, user.login_pin);
    if (isSamePIN) {
      throw new BadRequestError("New PIN must be different from the old PIN");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPIN = await bcrypt.hash(newPin, salt);

    await this.findOneAndUpdate(
      { email },
      {
        login_pin: hashedPIN,
        wrong_pin_attempts: 0,
        block_until_pin: null,
      }
    );

    return { success: true, message: "PIN update successfully" };
  } catch (error) {
    throw error;
  }
};

UserSchema.statics.updatePassword = async function (email, newPassword) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password must be different from the old password"
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        wrong_password_attempts: 0,
        block_until_password: null,
      }
    );

    return { success: true, message: "Password Updated Successfully" };
  } catch (err) {
    throw err;
  }
};

UserSchema.methods.comparePassword = async function (userPassword) {
  if (this.block_until_password && this.block_until_password > new Date()) {
    throw new UnauthenticatedError(
      "Invalid Login attempts exceeded, Please try again after 30 minutes."
    );
  }

  const isMatch = await bcrypt.compare(userPassword, this.password);

  if (!isMatch) {
    this.wrong_password_attempts += 1;
    if (this.wrong_password_attempts >= 3) {
      this.block_until_password = new Date(Date.now() + 30 * 60 * 1000);
      await this.save();
      this.wrong_password_attempts = 0;
    }
    await this.save();
  } else {
    this.wrong_password_attempts = 0;
    this.block_until_password = null;
    await this.save();
  }

  return isMatch;
};

UserSchema.methods.comparePIN = async function (userPIN) {
  if (this.block_until_pin && this.block_until_pin > new Date()) {
    throw new UnauthenticatedError(
      "Limit exceeded, Please try again after 30 minutes."
    );
  }

  const isMatch = await bcrypt.compare(userPIN, this.login_pin);

  if (!isMatch) {
    this.wrong_pin_attempts += 1;
    if (this.wrong_pin_attempts >= 3) {
      this.block_until_pin = new Date(Date.now() + 30 * 60 * 1000);
      await this.save();
      this.wrong_pin_attempts = 0;
    }
    await this.save();
  } else {
    this.wrong_pin_attempts = 0;
    this.block_until_pin = null;
    await this.save();
  }

  return isMatch;
};

UserSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

UserSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const User = mongoose.model("User", UserSchema);

export default User;
