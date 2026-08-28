import app from "./app.js";

const port = process.env.PORT || 4000;

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
  });
}