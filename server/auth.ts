import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      isAdmin: boolean;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to check if user is authenticated
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        username: string;
        isAdmin: boolean;
      };
      req.user = {
        id: decoded.id,
        username: decoded.username,
        password: "", // Password is not included in the token
        isAdmin: decoded.isAdmin,
      };
      return next();
    } catch (error) {
      console.error("JWT verification error:", error);
    }
  }

  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  isAuthenticated(req, res, () => {
    if (req.user && req.user.isAdmin) {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Admin access required" });
  });
};

// Generate JWT token
export const generateToken = (user: Express.User): string => {
  return jwt.sign(
    { id: user.id, username: user.username, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export function setupAuth(app: Express) {
  // Configure session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: storage.sessionStore,
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.post(
    "/api/register",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { username, password, isAdmin } = req.body;

        // Check if username already exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }

        // Create new user
        const user = await storage.createUser({
          username,
          password, // Store plain text password
          isAdmin: !!isAdmin,
        });

        // Generate token
        const token = generateToken(user);

        // Login the user
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(201).json({
            user: {
              id: user.id,
              username: user.username,
              isAdmin: user.isAdmin,
            },
            token,
          });
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (err: Error, user: Express.User, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Authentication failed" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);

          // Generate token
          const token = generateToken(user);

          return res.json({
            user: {
              id: user.id,
              username: user.username,
              isAdmin: user.isAdmin,
            },
            token,
          });
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", isAuthenticated, (req: Request, res: Response) => {
    const { id, username, isAdmin } = req.user!;
    res.json({
      id,
      username,
      isAdmin: !!isAdmin, // Make sure isAdmin is boolean
    });
  });
}
