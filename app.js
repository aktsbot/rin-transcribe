import express from "express";
import { configDotenv } from "dotenv";
import fs from "fs";
import path from "path";
import morgan from "morgan";

// node 20.11 and up
const __dirname = import.meta.dirname;

configDotenv();
const app = express();

// -- config start
let hasConfigErrors = false;
const config = {
  port: process.env.PORT || 6745,
  secret: process.env.SECRET || "",
  openApiKey: process.env.OPENAI_API_KEY || "",
};
if (!config.secret) {
  console.error(`env: SECRET not set`);
  hasConfigErrors = true;
}
if (!config.openApiKey) {
  console.error(`env: OPENAI_API_KEY not set`);
  hasConfigErrors = true;
}
if (hasConfigErrors) {
  console.error(`Config errors found. Please fix them and restart server`);
  process.exit(1);
}
// -- config end

// -- auth middleware start
const auth = (req, res, next) => {
  const authSecret = req.headers["rin-transcribe-auth-secret"];

  if (!authSecret) {
    return res.status(401).send({
      message: "No secret found",
    });
  }

  if (authSecret !== config.secret) {
    return res.status(403).send({
      message: "Bad secret found",
    });
  }

  next();
};
// -- auth middleware end

app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("combined"));

const html = {
  index: fs.readFileSync("html/index.html", { encoding: "utf8" }),
};

app.get("/", (req, res) => {
  res.send(html.index);
});

app.post("/upload", auth, (req, res) => {
  return res.send({
    message: "Success",
    data: {
      text: "This is now working",
    },
  });
});

app.listen(config.port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on port ${config.port}`);
});
