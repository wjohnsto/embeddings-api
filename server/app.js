import express from "express";
import { cosinesim, generateEmbeddings } from "./utils/embeddings.js";

const app = express();

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    express.json({ limit: "10mb" })(req, res, next);
  } else {
    next();
  }
});
app.post("/api/embeddings", async (req, res) => {
  let { values, match } = req.body;

  if (!Array.isArray(values)) {
    values = [values];
  }

  if (!match) {
    match = values;
  }

  if (!Array.isArray(match)) {
    match = [match];
  }

  if (values.length !== match.length) {
    return res.status(400).json({
      error: "Values and match arrays must be of the same length",
    });
  }

  const n = values.length;
  const data = await generateEmbeddings(values);
  const matchData = await generateEmbeddings(match);

  for (let i = 0; i < n; ++i) {
    data[i].similarity = cosinesim(data[i], matchData[i]);
  }

  res.json({
    data,
  });
});

export default app;
