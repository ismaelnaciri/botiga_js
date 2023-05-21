const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const uuid = require('uuid')

const app = express();

const cors=require('cors');
const fs = require("fs");

const Sequelize = require("sequelize");
const {NOW} = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// sequelize.authenticate().then(() => {
//   console.log('Conexió establerta');
// }).catch((error) => {
//   console.error("No s'ha pogut connectar", error);
// });

const Product = sequelize.define("productes", {
  idproducte:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },nom: {
    type: Sequelize.STRING,
    allowNull: false
  },preu:{
    type: Sequelize.INTEGER,
    allowNull: false
  },img:{
    type: Sequelize.STRING,
    allowNull: false
  },tipus:{
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Compras = sequelize.define("compres",{
  idfactura:{
    type: Sequelize.STRING,
    primaryKey: true
  },usuari:{
    type: Sequelize.STRING,
    allowNull: true
  },idproducte:{
    type: Sequelize.INTEGER,
    primaryKey: true
  },oferta:{
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },quantitat:{
    type: Sequelize.INTEGER,
    allowNull: false
  },data:{
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  }
});

// sequelize.sync().then(()=>{
//   console.log('Base de dades sincroniotzada');
// }).catch((error) => {
//   console.error("No s'ha pogut sincronitzar", error);
// });


app.use(cors());
app.use(express.json());

port = 3080;

app.listen(port, ()=>{
  console.log(`el port::${port} funciona`)
});

app.get('/productes', async (req, res) => {

  Product.findAll().then((data)=>{
    res.json(data)
  }).catch((error)=>{
    console.error("Han fallat els productes", error)
  })

});

app.get('/imatges/:nom',(req,res)=>{
  const nomImatge = req.params.nom;
  const rutaImatge = `../IMG/${nomImatge}`;
  const stream = fs.createReadStream(rutaImatge);
  stream.pipe(res);
});


app.post('/compres', async (req, res) => {
  const items = req.body.json;
  const idFactura = uuid.v4();
  items.forEach(function(item) {
    Compras.create({
      idfactura: idFactura,
      usuari: '',
      idproducte: item.idproducte,
      oferta: item.oferta,
      quantitat: item.quantity
    }).catch((err)=>{
      if (err){
        console.error('Ha hagut un error ', err)
      }
    })
  });

});


//prueba numero 1


const {FieldValue} = require("firebase-admin/firestore");
var admin = require("firebase-admin");
var serviceAccount = require("./botiga-danisma-firebase-adminsdk-my3wq-9d1b270bca.json");
const {getFirestore} = require("firebase-admin/firestore");
const ap = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = getFirestore(ap);


app.post('/api/login',async (req,res)=> {
  console.log("fino")
  const dades = req.body.json;

  console.log(dades)
    dades.forEach(function(dada) {
      db.collection('iniciar-registre').doc('yWikbVf2wyCyqnyRkE8z').set(
        {
          clients: FieldValue.arrayUnion({
            nom: dada.nom,
            email: dada.correu,
            password: dada.contrasenya
          })
        }, {merge: true}).then(r => {
        console.log("dades inserides")
      }).catch((err) => {
        if (err) {
          console.error(err)
        }
      })
    })
})


// app.get("/api/getCoinPrice", async (req, res) => {
//
// })
/*



baseDades();
async function baseDades() {


  app.get('/api/firebase', async (req, res) => {
    const conn = db.collection("iniciar-registrar").doc("8X8qyKzfzPYPdqlUA6Ut");
    const doc = await conn.get();
    const document = doc.data();

    res.json(document);
  })
}

app.post('/registrar', async (req, res) => {
  const respostaUser = await admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
    disabled: false,
  })
  res.json(respostaUser);
});

app.post('/datausers', async (req, res) => {
  db.collection('iniciar-registrar').doc('8X8qyKzfzPYPdqlUA6Ut').set(
    {
      client: FieldValue.arrayUnion({
        Nom: req.body.nom,
        email: req.body.correu,
        password: 'patata'
      })
    }, {merge: true}).then(r => {
      console.log("dades inserides");
    })
});



*/


/*
app.post('/api/formulario', (req, res) => {

  const datos = req.body;


  const nombreArchivo = `datos_${new Date().toISOString()}.txt`;


  fs.writeFile(nombreArchivo, JSON.stringify(datos), (error) => {
    if (error) {
      console.error(`Error al escribir en el archivo ${nombreArchivo}: ${error}`);
      res.status(500).send('Error interno del servidor');
    } else {
      console.log(`Los datos se han guardado en el archivo ${nombreArchivo}`);
      res.status(200).send('Los datos se han guardado correctamente');
    }
  });
});*/
