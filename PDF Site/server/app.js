import express from 'express';
import cors from 'cors';
import processRouter from './routes/process.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', processRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`PDF Site server listening on http://localhost:${PORT}`);
});

export default app;
