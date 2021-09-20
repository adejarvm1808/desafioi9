const express = require('express');
const router = express.Router();
const login = require('../middleware/login');
const LivrosControler = require('../controllers/livros-controller');

router.post('/', login, LivrosControler.PostLivros) ;

router.get('/', login, LivrosControler.GetLivros);

router.get('/:id_livro', login, LivrosControler.GetLivrosUm);

router.post('/inativar/:id_livro', login, LivrosControler.PostLivrosInativar);

router.post('/locar/:id_livro', login, LivrosControler.PostLivrosLocar);

router.post('/devolver/:id_livro', login, LivrosControler.PostLivrosDevolver);

module.exports = router;