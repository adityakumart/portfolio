import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Reusable JSON response handler for rate limit violations (HTTP 429).
 */
const createRateLimitHandler = (defaultMessage: string) => {
  return (req: Request, res: Response, _next: any, options: Options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    const resetTime = new Date(Date.now() + options.windowMs).toISOString();
    const message =
      options.message &&
      typeof options.message === 'string' &&
      options.message !== 'Too many requests, please try again later.'
        ? options.message
        : defaultMessage;

    res.status(options.statusCode).json({
      statusCode: options.statusCode,
      error: 'Too Many Requests',
      message,
      retryAfter,
      limit: typeof options.limit === 'function' ? undefined : options.limit,
      remaining: 0,
      resetTime,
    });
  };
};

/**
 * 1. General API Rate Limiter
 * Applied globally across all /api routes to prevent volumetric scraping and automated denial-of-service.
 * Window: 15 minutes
 * Limit: 600 requests per IP (configurable via API_RATE_LIMIT_MAX)
 * Skips: /api/ping (Render health check / keep-alive) and OPTIONS CORS preflight requests.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env['API_RATE_LIMIT_MAX']
    ? Number(process.env['API_RATE_LIMIT_MAX'])
    : 600,
  message: 'Too many requests from this IP address, please try again later after 15 minutes.',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: (req) => req.method === 'OPTIONS' || req.path === '/ping' || req.originalUrl.includes('/api/ping'),
  handler: createRateLimitHandler(
    'Too many requests from this IP address, please try again later after 15 minutes.'
  ),
});

/**
 * 2. Strict Authentication Rate Limiter
 * Applied to login and signup endpoints to mitigate automated brute force & credential stuffing.
 * Window: 15 minutes
 * Limit: 10 attempts per IP (configurable via AUTH_RATE_LIMIT_MAX)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env['AUTH_RATE_LIMIT_MAX']
    ? Number(process.env['AUTH_RATE_LIMIT_MAX'])
    : 10,
  message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: (req) => req.method === 'OPTIONS',
  handler: createRateLimitHandler(
    'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.'
  ),
});

/**
 * 3. AI Chat Rate Limiter
 * Applied to Gemini AI chat endpoints to protect LLM quota and prevent prompt spamming.
 * Window: 15 minutes
 * Limit: 25 requests per IP (configurable via CHAT_RATE_LIMIT_MAX)
 */
export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env['CHAT_RATE_LIMIT_MAX']
    ? Number(process.env['CHAT_RATE_LIMIT_MAX'])
    : 25,
  message: 'Too many AI chat requests. Please slow down and try again later.',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: (req) => req.method === 'OPTIONS',
  handler: createRateLimitHandler(
    'Too many AI chat requests. Please slow down and try again later.'
  ),
});

/**
 * 4. File Upload & Bulk Operations Rate Limiter
 * Applied to file uploads, image attachments, and bulk data imports.
 * Window: 15 minutes
 * Limit: 30 requests per IP (configurable via UPLOAD_RATE_LIMIT_MAX)
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env['UPLOAD_RATE_LIMIT_MAX']
    ? Number(process.env['UPLOAD_RATE_LIMIT_MAX'])
    : 30,
  message: 'Too many file upload requests. Please wait a few minutes before trying again.',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: (req) => req.method === 'OPTIONS',
  handler: createRateLimitHandler(
    'Too many file upload requests. Please wait a few minutes before trying again.'
  ),
});
