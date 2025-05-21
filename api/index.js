import serverless from "serverless-http";
import app from "../dist/index";

export default serverless(app);
