import { BadRequestError, UnauthenticatedError } from "../../errors";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { StatusCodes } from "http-status-codes";
import User from "../../models/user";
import jwksClient from "jwks-rsa";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const jwksClientInstance = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  timeout: 30000,
});

async function getKey(kid) {
  return new Promise((resolve, reject) => {
    jwksClientInstance.getSigningKey(kid, (err, key) => {
      if (err) {
        return reject(err);
      }
      const signingKey = key.getPublicKey();
      resolve(signingKey);
    });
  });
}

const signInWithOauth = async (req, res) => {
  const { id_token, provider } = req.body;

  if (!id_token || !provider) {
    throw new BadRequestError("Invalid request");
  }

  try {
    let email, user;

    if (provider === "apple") {
      const { header } = jwt.decode(id_token, { complete: true });
      const kid = header.kid;
      const publicKey = await getKey(kid);
      ({ email } = jwt.verify(id_token, publicKey));
    }

    if (provider === "google") {
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;

      if (!email_verified) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Email not verified by google" });
      }

      user = await User.findOneAndUpdate(
        { email },
        { email_verified: true, name },
        { new: true, upsert: true }
      );

      const accessToken = user.createAccessToken();
      const refreshToken = user.createRefreshToken();

      let phone_exist = false;
      let login_pin_exist = false;

      if (user.phone_number) phone_exist = true;
      if (user.login_pin) login_pin_exist = true;

      res.status(StatusCodes.OK).json({
        success: true,
        user: {
          email: user.email,
          name: user.name,
          userId: user.id,
          phone_exist,
          login_pin_exist,
        },
        tokens: { access_token: accessToken, refresh_token: refreshToken },
      });
    }
  } catch (error) {
    console.error(error);
    throw new UnauthenticatedError("Something went wrong..");
  }
};

export { signInWithOauth };
