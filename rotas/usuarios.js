const express = require('express');
const router = express.Router();
const login = require('../middleware/login');
const UsuariosController = require('../controllers/usuarios-controller');

router.post('/', UsuariosController.PostUsuarios);

router.post('/login', UsuariosController.PostUsuariosLogin) ;

router.get('/historico', login, UsuariosController.GetUsuariosHistorico);

module.exports = router;