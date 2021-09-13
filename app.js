const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Configurando o CORS
app.use((req, res, next) => {
    res.header('Acces-Control-Allow-Origin', '*');
    res.header(
        'Acces-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Acept, Authorization');
    next();
});

const rotasLivros = require('./rotas/livros');
const rotasUsuarios = require('./rotas/usuarios');


app.use('/', rotasLivros);
app.use('/', rotasUsuarios);

app.use((req, res, next) => {
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
});

app.use((error,req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            status: false,
            msg: error.message
        }
    });
});


module.exports = app;