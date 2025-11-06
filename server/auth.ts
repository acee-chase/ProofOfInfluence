import * as client from "openid-client";
import { Strategy as OidcStrategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface User {
      id: string;
      provider: "replit" | "google";
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      profileImageUrl?: string | null;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
    }
  }
}

const getReplitConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!,
    );
  },
  { maxAge: 3600 * 1000 },
);

const isGoogleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL);

const getGoogleConfig = memoize(
  async () => {
    if (!isGoogleConfigured()) {
      return null;
    }

    return await client.discovery(
      new URL("https://accounts.google.com"),
      process.env.GOOGLE_CLIENT_ID!,
      {
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uris: [process.env.GOOGLE_CALLBACK_URL!],
      },
      client.ClientSecretPost(process.env.GOOGLE_CLIENT_SECRET!),
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

async function upsertUser({
  id,
  email,
  firstName,
  lastName,
  profileImageUrl,
  provider,
}: {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  provider: "replit" | "google";
}) {
  await storage.upsertUser({
    id,
    email: email ?? null,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
    profileImageUrl: profileImageUrl ?? null,
    authProvider: provider,
  });
}

function getStringClaim(claims: Record<string, unknown>, key: string): string | null {
  const value = claims[key];
  return typeof value === "string" ? value : null;
}

function getNumberClaim(claims: Record<string, unknown>, key: string): number | undefined {
  const value = claims[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function updateReplitSessionUser(
  user: Express.User,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
) {
  const claims = tokens.claims() as Record<string, unknown>;
  const sub = getStringClaim(claims, "sub");
  if (!sub) {
    throw new Error("Missing user identifier in Replit claims");
  }

  user.id = sub;
  user.provider = "replit";
  user.email = getStringClaim(claims, "email");
  user.firstName = getStringClaim(claims, "first_name");
  user.lastName = getStringClaim(claims, "last_name");
  user.profileImageUrl = getStringClaim(claims, "profile_image_url");
  user.accessToken = tokens.access_token;
  user.refreshToken = tokens.refresh_token ?? undefined;
  user.expiresAt = getNumberClaim(claims, "exp");
}

function updateGoogleSessionUser(
  user: Express.User,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
) {
  const claims = tokens.claims() as Record<string, unknown>;
  const sub = getStringClaim(claims, "sub");
  if (!sub) {
    throw new Error("Missing user identifier in Google claims");
  }

  const expiresInValue = tokens.expires_in ? Number(tokens.expires_in) : undefined;

  user.id = sub;
  user.provider = "google";
  user.email = getStringClaim(claims, "email");
  user.firstName = getStringClaim(claims, "given_name");
  user.lastName = getStringClaim(claims, "family_name");
  user.profileImageUrl = getStringClaim(claims, "picture");
  user.accessToken = tokens.access_token;
  user.refreshToken = tokens.refresh_token ?? user.refreshToken;
  user.expiresAt =
    (tokens as any).expires_at ??
    (expiresInValue && Number.isFinite(expiresInValue)
      ? Math.floor(Date.now() / 1000 + expiresInValue)
      : undefined) ??
    getNumberClaim(claims, "exp");
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const replitConfig = await getReplitConfig();

  const replitVerify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback,
  ) => {
    const sessionUser: Express.User = {
      id: "",
      provider: "replit",
    };

    updateReplitSessionUser(sessionUser, tokens);
    await upsertUser({
      id: sessionUser.id,
      email: sessionUser.email ?? null,
      firstName: sessionUser.firstName ?? null,
      lastName: sessionUser.lastName ?? null,
      profileImageUrl: sessionUser.profileImageUrl ?? null,
      provider: "replit",
    });
      verified(null, sessionUser);
  };

  const registeredStrategies = new Set<string>();

  const ensureReplitStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new OidcStrategy(
        {
          name: strategyName,
          config: replitConfig,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        replitVerify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  const googleConfig = await getGoogleConfig();

  const googleVerify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback,
  ) => {
    try {
      const sessionUser: Express.User = {
        id: "",
        provider: "google",
      };

      updateGoogleSessionUser(sessionUser, tokens);

      await upsertUser({
        id: sessionUser.id,
        email: sessionUser.email,
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        profileImageUrl: sessionUser.profileImageUrl,
        provider: "google",
      });

      verified(null, sessionUser);
    } catch (error) {
      verified(error as Error, undefined);
    }
  };

  if (googleConfig) {
    passport.use(
      new OidcStrategy(
        {
          name: "google",
          config: googleConfig,
          scope: "openid email profile",
          callbackURL: process.env.GOOGLE_CALLBACK_URL!,
          params: {
            prompt: "consent",
            access_type: "offline",
          },
        } as any,
        googleVerify,
      ),
    );
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureReplitStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
      successReturnToOrRedirect: "/app",
      failureRedirect: "/login",
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureReplitStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/app",
      failureRedirect: "/login",
    })(req, res, next);
  });

  if (googleConfig) {
    app.get(
      "/api/auth/google",
      passport.authenticate(
        "google",
        {
          scope: ["openid", "email", "profile"],
          accessType: "offline",
          prompt: "consent",
        } as any,
      ),
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        successReturnToOrRedirect: "/app",
        failureRedirect: "/login",
      }),
    );
  }

  app.get("/api/logout", async (req, res) => {
    const currentUser = req.user as Express.User | undefined;
    req.logout(() => {
      if (currentUser?.provider === "replit") {
        res.redirect(
          client.buildEndSessionUrl(replitConfig, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href,
        );
      } else {
        res.redirect("/login");
      }
    });
  });
}

async function refreshGoogleToken(user: Express.User) {
  if (!user.refreshToken) {
    throw new Error("Missing Google refresh token");
  }

  const googleConfig = await getGoogleConfig();
  if (!googleConfig) {
    throw new Error("Google OAuth is not configured");
  }

  const tokens = await client.refreshTokenGrant(googleConfig, user.refreshToken);
  updateGoogleSessionUser(user, tokens);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as Express.User | undefined;

  if (!req.isAuthenticated() || !user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (!user.expiresAt || now <= user.expiresAt) {
    return next();
  }

  try {
    if (user.provider === "replit") {
      const refreshToken = user.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const replitConfig = await getReplitConfig();
      const tokenResponse = await client.refreshTokenGrant(replitConfig, refreshToken);
      updateReplitSessionUser(user, tokenResponse);
      return next();
    }

    if (user.provider === "google") {
      await refreshGoogleToken(user);
      return next();
    }
  } catch (error) {
    console.error("Auth refresh failed", error);
  }

  return res.status(401).json({ message: "Unauthorized" });
};
