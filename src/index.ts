import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

/* PORT */
const PORT = process.env.PORT || 6001;

/* SERVER */
app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
