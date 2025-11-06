import * as client from "openid-client";
import { Strategy, type AuthenticateOptions, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

type AuthProvider = "replit" | "google";

interface NormalizedClaims {
  sub: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  exp?: number;
}

declare global {
  namespace Express {
    interface User {
      authProvider: AuthProvider;
      claims: NormalizedClaims;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}

const getReplitConfig = memoize(
  async () =>
    await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!,
    ),
  { maxAge: 3600 * 1000 },
);

const getGoogleConfig = memoize(
  async () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars");
    }

    return await client.discovery(
      new URL("https://accounts.google.com"),
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  },
  { maxAge: 3600 * 1000 },
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

function normalizeClaims(provider: AuthProvider, rawClaims: Record<string, any>): NormalizedClaims {
  const subClaim = rawClaims["sub"];
  if (typeof subClaim !== "string" || subClaim.length === 0) {
    throw new Error('Missing subject claim');
  }

  const givenName = rawClaims["first_name"] ?? rawClaims["given_name"] ?? undefined;
  const familyName = rawClaims["last_name"] ?? rawClaims["family_name"] ?? undefined;

  return {
    sub: provider === "google" ? `google:${subClaim}` : subClaim,
    email: rawClaims["email"],
    first_name: givenName,
    last_name: familyName,
    profile_image_url: rawClaims["profile_image_url"] ?? rawClaims["picture"],
    exp: rawClaims["exp"],
  };
}

function updateUserSession(
  user: Express.User,
  provider: AuthProvider,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
  rawClaims: Record<string, any>,
) {
  const claims = normalizeClaims(provider, rawClaims);
  user.authProvider = provider;
  user.claims = claims;
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = claims.exp;
}

async function upsertUser(provider: AuthProvider, claims: NormalizedClaims, rawSub: string) {
  await storage.upsertUser({
    id: claims.sub,
    email: claims.email ?? null,
    firstName: claims.first_name ?? null,
    lastName: claims.last_name ?? null,
    profileImageUrl: claims.profile_image_url ?? null,
    authProvider: provider,
    providerId: rawSub,
  });
}

function createVerify(provider: AuthProvider): VerifyFunction {
  return async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback,
  ) => {
    try {
      const rawClaims = tokens.claims();
      if (!rawClaims) {
        throw new Error('Missing token claims');
      }

      const user = {} as Express.User;
      updateUserSession(user, provider, tokens, rawClaims);
      await upsertUser(provider, user.claims, rawClaims["sub"] as string);
      verified(null, user);
    } catch (error) {
      verified(error as Error);
    }
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const registeredStrategies = new Set<string>();
  const replitVerify = createVerify("replit");
  const googleVerify = createVerify("google");

  const ensureReplitStrategy = async (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config: await getReplitConfig(),
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback/replit`,
        },
        replitVerify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  const ensureGoogleStrategy = async () => {
    const strategyName = "googleauth";
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config: await getGoogleConfig(),
          scope: "openid email profile",
          callbackURL: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:5000/api/callback/google",
        },
        googleVerify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", async (req, res, next) => {
    try {
      await ensureReplitStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/login/replit", async (req, res, next) => {
    try {
      await ensureReplitStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/login/google", async (req, res, next) => {
    try {
      await ensureGoogleStrategy();
      const host = req.get("host") ?? req.hostname;
      const options: AuthenticateOptions = {
        scope: ["openid", "email", "profile"],
        prompt: "select_account",
        callbackURL: `${req.protocol}://${host}/api/callback/google`,
      };
      passport.authenticate("googleauth", options)(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  const replitCallbackHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureReplitStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  app.get("/api/callback", replitCallbackHandler);
  app.get("/api/callback/replit", replitCallbackHandler);

  app.get("/api/callback/google", async (req, res, next) => {
    try {
      await ensureGoogleStrategy();
      const host = req.get("host") ?? req.hostname;
      const options: AuthenticateOptions = {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login",
        callbackURL: `${req.protocol}://${host}/api/callback/google`,
      };
      passport.authenticate("googleauth", options)(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/logout", async (req, res, next) => {
    try {
      const user = req.user as Express.User | undefined;
      const provider = user?.authProvider;

      req.logout(async () => {
        if (provider === "replit") {
          const host = req.get("host") ?? req.hostname;
          const endSessionUrl = client.buildEndSessionUrl(await getReplitConfig(), {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${host}/login`,
          });
          res.redirect(endSessionUrl.href);
        } else {
          res.redirect("/login");
        }
      });
    } catch (error) {
      next(error);
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as Express.User | undefined;

  if (!req.isAuthenticated() || !user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (user.authProvider !== "replit") {
    return next();
  }

  if (!user.expires_at) {
    return next();
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
    const tokenResponse = await client.refreshTokenGrant(await getReplitConfig(), refreshToken);
    const rawClaims = tokenResponse.claims();
    if (!rawClaims) {
      throw new Error('Missing token claims');
    }
    updateUserSession(user, "replit", tokenResponse, rawClaims);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
