import { Strategy as LocalStrategy } from "passport-local";
import { validateUser } from "./auth.service";

const strategy = new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
  },
  async (username, password, done) => {
    try {
      const user = await validateUser(username, password);
      if (!user) return done(null, false, { message: "Invalid credentials" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);

export default strategy;
