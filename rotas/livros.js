const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

router.post('/inserir_livro', login, (req, res, next) => {

    const livro = {

        titulo: req.body.titulo,
        autor: req.body.autor

    }

    mysql.getConnection((error, conn)=>{

        conn.query(

            'INSERT INTO livros (titulo, autor, id_usuario_cadastro) VALUES (?,?,?);',
            [req.body.titulo,req.body.autor, req.usuario.id],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        status: false,
                        msg: error
                    });
                }

                res.status(201).send({
                    status: true,
                    msg: 'Inserido com sucesso!',
                    id_livro: resultado.insertId
                });
            }
        );
    });

});

router.post('/listar_livros', (req, res, next) => {

    mysql.getConnection((error, conn)=>{
        conn.query(
            'SELECT * FROM livros;',
            [],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        status: false,
                        msg: error
                    });
                }

                res.status(201).send({
                    status: true,
                    msg: 'Inserido com sucesso!',
                    retorno: resultado
                });
            }
        );
    });

});

module.exports = router;