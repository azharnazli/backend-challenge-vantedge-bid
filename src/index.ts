import "dotenv/config";
import express from "express";

const port = Number(process.env.PORT ?? 3000);
const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
