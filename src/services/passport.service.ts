import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import prisma from "../prisma";

import { config } from "dotenv";
config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL!;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value;
        let user = await prisma.user.findUnique({
          where: { providerId }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              provider: "GOOGLE",
              providerId,
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value
            }
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "photos", "email"]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value;
        let user = await prisma.user.findUnique({
          where: { providerId }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              provider: "FACEBOOK",
              providerId,
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value
            }
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// We do not use sessions: serialize/deserialize are optional
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err as Error);
  }
});

export default passport;
