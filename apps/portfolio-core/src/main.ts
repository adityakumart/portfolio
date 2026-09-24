import express from 'express';

import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { chatRouter } from './routes/chat.routes';
import { filesRouter } from './routes/files.routes';
import { rrRouter } from './app/rr/rr.routes';
import { apiRateLimiter } from './middlewares/rate-limit.middleware';

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;


const allowedOrigins = process.env['CORS_ORIGIN']
  ? process.env['CORS_ORIGIN'].split(',').map((origin) => {
      try {
        return new URL(origin.trim()).origin;
      } catch {
        return origin.trim();
      }
    })
  : '*';

const app = express();

// Trust reverse proxy (Vercel, Render) for accurate client IP resolution in rate-limiting
app.set('trust proxy', 1);

app.use(
  cors({
    origin: allowedOrigins,
    exposedHeaders: [
      'authToken',
      'RateLimit',
      'RateLimit-Policy',
      'Retry-After',
    ],
  }),
);
// Body parsers with strict size limits to prevent Denial-of-Service via huge payloads
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiter on all /api routes (skips /api/ping and OPTIONS)
app.use('/api', apiRateLimiter);

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/files', filesRouter);
app.use('/api/rr', rrRouter);

app.get('/api/ping', (req, res) => {
  res.send({ status: 'ok', message: 'ping' });
});

app.get(['/', '/api'], (req, res) => {
  res.send({ message: `portfolio-core API` });
});

if (!process.env['VERCEL']) {
  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });

  // Keep Render app awake by pinging itself every 13 minutes
  const selfUrl = process.env['RENDER_EXTERNAL_URL'];
  if (selfUrl) {
    const THIRTEEN_MINUTES = 13 * 60 * 1000;
    setInterval(() => {
      fetch(`${selfUrl}/api/ping`)
        .then((res) => res.json())
        .then((data) => console.log('Self-ping - success:', data))
        .catch((err) => console.error('Self-ping - failed:', err));
    }, THIRTEEN_MINUTES);
  }
}

export default app;
