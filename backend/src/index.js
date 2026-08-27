import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 4000;

if (process.env.VERCEL !== '1') {
  connectDB();
  app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
  });
}