import dotenv from "dotenv";
import app from "./app.js";
import connectToDb from "./db/index.js";
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectToDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Unexpected error while connecting to database", err);
    process.exit(1);
  });
