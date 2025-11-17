// Replit Auth integration - from blueprint:javascript_log_in_with_replit
// NOTE: Replit Auth is now optional - if REPL_ID is not set, auth will be disabled
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check if Replit Auth is enabled
export const isReplitAuthEnabled = (): boolean => {
  return !!process.env.REPL_ID && process.env.REPL_ID.trim() !== "";
};

const getOidcConfig = memoize(
  async () => {
    if (!isReplitAuthEnabled()) {
      throw new Error("Replit Auth is not enabled: REPL_ID is not set");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only setup Replit Auth if REPL_ID is configured
  if (!isReplitAuthEnabled()) {
    console.warn("[Auth] Replit Auth is disabled: REPL_ID is not set. Authentication will be limited.");
    console.warn("[Auth] To bypass authentication for testing, set AUTH_BYPASS=true or DEV_MODE_AUTH_BYPASS=true");
    
    // Setup basic passport serialization even without Replit Auth
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    
    // Provide placeholder routes that return appropriate errors
    app.get("/api/login", (req, res) => {
      res.status(503).json({ 
        message: "Replit Auth is not configured. Please set REPL_ID environment variable.",
        error: "AUTH_NOT_CONFIGURED"
      });
    });
    
    app.get("/api/callback", (req, res) => {
      res.status(503).json({ 
        message: "Replit Auth is not configured. Please set REPL_ID environment variable.",
        error: "AUTH_NOT_CONFIGURED"
      });
    });
    
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });
    
    return;
  }

  // Replit Auth is enabled, proceed with normal setup
  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Auth bypass: Allow bypassing auth if explicitly enabled (for migration from Replit)
  // This is useful when migrating away from Replit Auth to another auth system
  const authBypass = process.env.DEV_MODE_AUTH_BYPASS === 'true' || process.env.AUTH_BYPASS === 'true';
  
  if (!isReplitAuthEnabled()) {
    // If Replit Auth is not enabled, check for bypass
    if (authBypass) {
      console.warn("[Auth] Authentication bypass enabled (DEV_MODE_AUTH_BYPASS or AUTH_BYPASS is set)");
      // Create a mock user for development/testing
      if (!req.user) {
        (req as any).user = {
          claims: {
            sub: process.env.AUTH_BYPASS_USER_ID || 'dev-user',
            email: process.env.AUTH_BYPASS_USER_EMAIL || 'dev@example.com',
            first_name: process.env.AUTH_BYPASS_USER_FIRST_NAME || 'Dev',
            last_name: process.env.AUTH_BYPASS_USER_LAST_NAME || 'User',
          },
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        };
      }
      return next();
    }
    
    // When bypass is disabled, return error
    return res.status(503).json({ 
      message: "Authentication is not configured. Please set REPL_ID environment variable or enable AUTH_BYPASS=true for testing.",
      error: "AUTH_NOT_CONFIGURED"
    });
  }

  // Normal Replit Auth flow
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
