//Requerimientos
const express = require("express");
const mongoose = require("mongoose");


const app = express();

app.use(express.json());

// String de conexión con la base de datos
const uri = "mongodb+srv://grupo_tres:123hola@cluster0.b6m6q.mongodb.net/biblioteca?retryWrites=true&w=majority";

async function conectar() {
    try{
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Conectado a la base de datos metodo: mongoodb - async-await");
    }
    catch(e){
        console.log(e);
    }
};

conectar();

///////********************************/////////
///////********************************/////////
///////********************************/////////

// Definición de esquema de libro
const BookSchema = new mongoose.Schema({
    name: String,
    author: String,
    gender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "generos"
    },
    lended: String,
    deleted: Number
});

// Armado del modelo
const LibroModel = mongoose.model("libros", BookSchema);

///////********************************/////////
///////********************************/////////

// CRUD de Libro - Create Read Update Delete
// POST
app.post("/libro", async (req, res)=>{
    try {
        // verificacion de la info que recibo;
        let name = req.body.name;
        let author = req.body.author;
        let gender = req.body.gender;

        //validaciones
        if(name == undefined){
            throw new Error("No enviaste nombre");
        }
        if(author == undefined){
            throw new Error("No enviaste autor");
        }
        if( gender == undefined){
            throw new Error("No enviaste genero");
        }
        if(name == ''){
            throw new Error("El nombre no puede estar vacio");
        }
        if(author == ''){
            throw new Error("El autor no puede estar vacio");
        }
        if(gender == '' ){
            throw new Error("El  genero no puede estar vacio");
        }

        //evitar que cargue dos veces el mismo libro
        libroExiste = await LibroModel.find({name:name});
        if(libroExiste){
            throw new Error("El libro ya existe");
        }
        

        let book = {
        name:  name,
        author: author,
        gender: gender,
        lended: "",
        deleted: 0
        //Quedó el deleted: 0 en los libros de la base de datos por haber implementado inicialmente el borrado lógico, pero la consigna pedía un DELETE que borra físicamente

        }

        let bookSave = await LibroModel.create(book);
        
        console.log(bookSave);
        res.status(200).send(bookSave);
    }
     catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});


// Get, para todos los libros
app.get("/libro", async (req, res)=>{
    try{
        let respuesta = null;

        respuesta = await LibroModel.find({deleted:0});

        res.status(200).send(respuesta);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e})
    }
});

// Get para los libros por id
app.get("/libro/:id", async (req, res)=>{
    try{
        let id = req.params.id;
        let respuesta = null;

        respuesta = await LibroModel.findById(id);

        res.status(200).send(respuesta);

    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e})
    }
});

//  Put para prestar los libros
app.put("/libro/:id", async (req, res)=>{
    try{
        // verificacion de la info que recibo;
        let id = req.params.id;
        let lended = req.body.lended;
        let prestamo = {
            lended: lended
        }
        let libroPrestado = await LibroModel.findById(id)
        console.log(libroPrestado)
        if(lended != ""){
            if(libroPrestado.lended != ""){
                throw new Error("El libro está prestado a otra persona", libroPrestado.lended)
            }
        }

        await LibroModel.findByIdAndUpdate(id, prestamo);

        console.log(prestamo);
        res.status(200).send(prestamo);


    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e})
    }
});
//Delete
app.delete("/libro/:id", async (req, res)=>{
    try{
        let id = req.params.id;
        await LibroModel.findByIdAndDelete(id);
        res.status(200).send({message: "Se borró correctamente"});
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});

///////********************************/////////
///////********************************/////////
///////********************************/////////
//Definición de esquema Género
const GeneroSchema = new mongoose.Schema({
    name : String,
    deleted: Number
});

//Armado del modelo
const GeneroModel = mongoose.model("generos", GeneroSchema);

///////********************************/////////
///////********************************/////////


// CRUD /genero
//POST nuevo género
app.post("/genero", async (req, res)=>{
    try{
        let name = req.body.name;

        if(name == undefined){
            throw new Error("Tenes que enviar un titulo");
        }

        if(name == ""){
            throw new Error("El titulo no puede ser vacio");
        }

        let existeName = null;

        existeName = await GeneroModel.find({name: name.toUpperCase()});

        if(existeName.length > 0){
          throw new Error("Ese genero ya existe");  
        }

        let genero = {
            name: name.toUpperCase(),
            deleted: 0
        }

        await GeneroModel.create(genero);

        res.status(200).send(genero);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});
//Get todos los géneros
app.get("/genero", async (req, res)=>{
    try{
        let respuesta = null;

        respuesta = await GeneroModel.find({deleted: 0});
        
        res.status(200).send(respuesta);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});
//GET género por id
app.get("/genero/:id", async (req, res)=>{
    try{
        let id = req.params.id;
        let respuesta = null;

        respuesta = await GeneroModel.findById(id);

        res.status(200).send(respuesta);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});
/* Esta parte no estaba en la consigna!


//DELETE borrar género
app.delete("/genero/:id", async (req, res)=>{
    try{
        let id = req.params.id;

        let respuesta = null;

        respuesta = await GeneroModel.findByIdAndDelete(id);

        let generoGuardado = await GeneroModel.findById(id);

        generoGuardado.deleted = 1;

        await GeneroModel.findByIdAndUpdate(id, generoGuardado);

        res.status(200).send({"message": "OK"})
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});
//PUT modifica el nombre de un género, siempre que no tenga libros asociados
app.put("/genero/:id", async (req, res)=>{
    try{
        // Validación de datos
        let name = req.body.name;
        let id = req.params.id;

        if(name == undefined){
            throw new Error("Tenes que enviar titulo");            
        }

        if(name = ""){
            throw new Error("El titulo no puede ser vacio");
        }

        // Verificamos condiciones para poder modificar
        let generoExiste = await GeneroModel.find({"name": name});

        if(generoExiste.length > 0){
            generoExiste.forEach(unGenero => {
                if(unGenero.id != id){
                    throw new Error("Ya existe ese genero");
                }
            });
        }

        let librosConEseGenero = null;
        
        librosConEseGenero = await LibroModel.find({"genero": id});

        if(librosConEseGenero.length > 0){
            throw new Error("No se puede modificar, hay libros asociados");
        }

        let generoModificado = {
            name: name
        }

        await GeneroModel.findByIdAndUpdate(id, generoModificado);

        res.status(200).send(generoModificado);

    
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});*/

///////********************************/////////
///////********************************/////////

//Conexión al servidor

app.listen(3000, ()=>{
    console.log("Servidor escuchando en el puerto 3000");
});





