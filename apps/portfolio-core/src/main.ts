import express from 'express';

import cors from 'cors';
import { authRouter } from './routes/auth.routes';

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;

const app = express();

app.use(
  cors({
    exposedHeaders: ['authToken'],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send({ message: `portfolio-core API` });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
