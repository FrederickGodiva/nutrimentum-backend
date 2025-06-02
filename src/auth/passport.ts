import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { VerifyCallback, Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { undefined } from "zod";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return done(null, false, { message: "Incorrect username." });

      const isValid = await bcrypt.compare(password, user.password!);
      if (!isValid)
        return done(null, false, { message: "Incorrect password." });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8000/api/auth/google',
      scope: [ 'profile', 'email'],
  }, 
  async(accessToken: string, refreshToken: string, profile:any, done:VerifyCallback ) => {
    try{
      if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
        return done(new Error('Email not provided by Google'), false);
      }

      const email = profile.emails[0].value;

      const row = await prisma.federatedIdentity.findUnique({
        where : {
          provider_identity_unique: { 
            provider: 'google',
            providerId: profile.id,
          }
        }
      })

      if(!row){
        const result = await prisma.$transaction(async (prisma) => {
          const user = await prisma.user.create({
            data: {
              username : profile.id,
              email: email, 
              FederatedIdentity: {
                create: {
                  provider: 'google',
                  providerId: profile.id,
                  profileData: profile._json
                }
              }
            },
            include: {
              FederatedIdentity: true
            }
          });
    
          return user;
        });

        return done(null, result);
      }else{
        const user = await prisma.user.findUnique({ where: { id : row.userId} });
        if (!user) return done(null, false);
        return done(null, user);
      }
    }catch(err){
      return done(err, false);
    }
  }));

export default passport;
