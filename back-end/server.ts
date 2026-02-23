import express, { type Request, type Response } from 'express';

const app = express();
const PORT = 3000;

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: "Hello from Express!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});