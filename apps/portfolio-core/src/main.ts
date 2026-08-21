import express from 'express';

import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { chatRouter } from './routes/chat.routes';
import { filesRouter } from './routes/files.routes';

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

app.use(
  cors({
    origin: allowedOrigins,
    exposedHeaders: ['authToken'],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/files', filesRouter);

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
