const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const uuid = require('uuid')

const app = express();
const fs = require('fs');

const cors = require('cors');

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

sequelize.authenticate().then(() => {
  console.log('Conexió establerta');
}).catch((error) => {
  console.error("No s'ha pogut connectar", error);
});

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
  },cost : {
    type: Sequelize.DECIMAL(10,2),
    allowNull: false
  }
  ,moneda: {
    type: Sequelize.STRING,
    allowNull: false
  }
});


sequelize.sync().then(()=>{
  console.log('Base de dades sincroniotzada');
}).catch((error) => {
  console.error("No s'ha pogut sincronitzar", error);
});



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
      quantitat: item.quantity,
      cost: item.price,
      moneda: item.coin
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
const stream = require("stream");
const ap = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = getFirestore(ap);


app.post('/signin',async (req,res)=> {

  const dades = req.body.json;

  console.log(dades)
    dades.forEach(function(dada) {
      db.collection('clients').doc(dada.correu).set(
        {

            nom: dada.nom,
            email: dada.correu,
            password: dada.contrasenya
        }, {merge: true}).then(r => {
        return res.send(true)
      }).catch((err) => {
        if (err) {
          console.error(err)
          return res.send(false)
        }
      })
    })
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;


  const user = await db.collection('clients')
    .where('email', '==', email)
    .where('password', '==', password)
    .get();



  if (user.empty) {

    return res.send(false);
  } else {
    const data = user.docs[0].data();
    console.log(typeof data)
    const info= {
      nomPersona: data.nom,
      emailPersona: data.email,
      contrasenyaPersona: data.password
    }
    return res.send(info);
  }
});


const path = require('path');
const missatgesFoldes = path.join(__dirname, '..', 'missatges');

app.post('/api/contacte', (req, res) => {
  console.log(missatgesFoldes)
  const missatgeObtingut = req.body;
  const id = uuid.v4();
  const nomArxiu = `missatge_${id}.txt`;
  const ruta = path.join(missatgesFoldes, nomArxiu);
  const nice={
    corecto:"nice"
  }


  const contingutMissatge = `Nom: ${missatgeObtingut.name}\nCorreu: ${missatgeObtingut.mail}\nMissatge: ${missatgeObtingut.missatge}`;

  fs.writeFile(ruta, contingutMissatge, (err) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Error');
    } else {
      console.log('Missatge guardat');
      res.send(nice);
    }
  });
});

app.post('/guardar-accio', (req, res) => {
  const accio= req.body;
  const nice={
    corecto:"nice"
  }

  fs.appendFile(`log.txt`, JSON.stringify(accio) + '\n', (err) => {
    if (err) {
      console.error('Error al guardar l\'accio:', err);
      res.status(500).send('Error al guardar l\'accio');
    } else {
      console.log('Accio guardada');
      res.send(nice);
    }
  });
});

