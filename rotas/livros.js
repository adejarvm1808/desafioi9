const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

router.post('/inserir_livro', login, (req, res, next) => {

    mysql.getConnection((error, conn)=>{

        conn.query(

            'INSERT INTO livros (titulo, autor, id_usuario_cadastro, ativo) VALUES (?,?,?, 1);',
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

router.post('/listar_livros', login, (req, res, next) => {

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
                    msg: 'Consulta executada com sucesso!',
                    retorno: resultado
                });
            }
        );
    });

});

router.post('/inativar_livro', login, (req, res, next) => {

    mysql.getConnection((error, conn)=>{

        conn.query(

            'SELECT * FROM livros WHERE id = ? ;',
            [req.body.id_livro],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        status: false,
                        msg: error
                    });
                }

                if(resultado.length < 1){

                    return res.status(409).send({
                        status: false,
                        msg: 'Livro não encontrado'
                    });

                }else{

                    if (resultado.id_usuario_cadastro != req.usuario.id) {
                        return res.status(409).send({
                            status: false,
                            msg: 'Somente o usuário que cadastrou o livro pode inativá-lo!',
                            id_usuario_cadastro: resultado.id_usuario_cadastro
                        });
                    }

                    conn.query(

                        'UPDATE livros SET ativo = 0 WHERE id = ?',
                        [req.body.id_livro],
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
                                msg: 'Inativado com sucesso!'
                            });
                        }
                    );

                }

            }
        );
    });

});

module.exports = router;