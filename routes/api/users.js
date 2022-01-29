const express = require("express");
const path = require("path");
const fs = require("fs");
const { NotFound, BadRequest } = require("http-errors");
const { User } = require("../../model");
const { authenticate, upload } = require("../../middlewares");

const { sendEmail } = require("../../helpers");
const router = express.Router();
const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

const { SITE_NAME } = process.env;

router.get("/logout", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

router.get("/current", authenticate, async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: {
      email,
      subscription,
    },
  });
});

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res) => {
    const { path: tempUpload, filename } = req.file;
    const [extension] = filename.split(".").reverse();
    const newFileName = `${req.user._id}.${extension}`;
    const fileUpload = path.join(avatarsDir, newFileName);
    await fs.rename(tempUpload, fileUpload);
    const avatarURL = path.join("avatars", newFileName);
    await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });
    res.json({ avatarURL });
  }
);

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw new NotFound("User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequest("missing required field email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFound("User not found");
    }

    if (user.verify) {
      throw new BadRequest("Verification has already been passed");
    }

    const { verificationToken } = user;
    const data = {
      to: email,
      subject: "Подтверждение email",
      html: `<a target= "_blank" href ="https://${SITE_NAME}/users/verify/${verificationToken}">Подтвердите email</a>`,
    };
    await sendEmail(data);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
