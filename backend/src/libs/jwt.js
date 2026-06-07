import jwt from "jsonwebtoken";

export function createAccessToken(payload) {
  //payload es la información que queremos meter dentro del token (por ejemplo, el ID del usuario). Es como los datos que van impresos en una credencial.
  return new Promise((resolve, reject) => {
    //Envolvemos todo en una Promesa para que en auth.controller.js podamos usar await
    jwt.sign(
      //función que crea el token : recibe el payload (id del usuario guardado) y el TOKEN_SECRET
      payload,
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1d", // El token dura un día
      },
      (err, token) => {
        if (err) reject(err); // si hay un error lo rechaza
        resolve(token); // si todo sale bien, te devuelve el token
      },
    );
  });
}

// esta funcion se importa en el register en auth.controller.js //
