const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

function dataFormatada(data){

    var data = data;
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return anoF+"/"+mesF+"/"+diaF;

}

var data_atual = new Date();
var data_atual_formatada = dataFormatada(data_atual);

router.post('/', login, (req, res, next) => {

    mysql.getConnection((error, conn)=>{

        if(req.body.autor == '' || typeof(req.body.autor) === 'undefined' || req.body.titulo == '' || typeof(req.body.titulo) === 'undefined'){
            
            return res.status(422).send({
                error: 'Verifique os campos obrigatórios na documentação!'
            });
        }
        conn.query(

            'INSERT INTO livros (titulo, autor, id_usuario_cadastro, ativo) VALUES (?,?,?, 1);',
            [req.body.titulo,req.body.autor, req.usuario.id],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                res.status(201).send({
                    id_livro: resultado.insertId
                });
            }
        );
    });

});

router.get('/', login, (req, res, next) => {

    mysql.getConnection((error, conn)=>{
        conn.query(
            'SELECT * FROM livros;',
            [],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                if(resultado.length < 1){
                    return res.status(204).send({});
                }

                res.status(200).send({
                    retorno: resultado
                });
            }
        );
    });

});

router.get('/:id_livro', login, (req, res, next) => {

    mysql.getConnection((error, conn)=>{

        conn.query(
            'SELECT * FROM livros WHERE id = ?;',
            [req.params.id_livro],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                if(resultado.length < 1){
                    return res.status(204).send({});
                }

                res.status(200).send({
                    retorno: resultado
                });
            }
        );
    });

});

router.post('/inativar/:id_livro', login, (req, res, next) => {
    
    if(req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
     
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }
    
    mysql.getConnection((error, conn)=>{

        conn.query(

            'SELECT * FROM livros WHERE id = ? ;',
            [req.params.id_livro],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                if(resultado.length < 1){

                    return res.status(404).send({
                        error: 'Livro não encontrado'
                    });

                }else{

                    if (resultado[0].id_usuario_cadastro !== req.usuario.id) {
                        return res.status(422).send({
                            error: 'Somente o usuário que cadastrou o livro pode inativá-lo!'
                        });
                    }

                    conn.query(

                        'SELECT * FROM movimentos WHERE  id_livro = ? AND devolucao is null',
                        [req.body.id_livro],
                        (error, resultado, field) => {
                            conn.release(); //Limpa o pool
            
                            if (error) {
                                return res.status(500).send({
                                    error: error
                                });
                            }

                            if(resultado.length > 0){

                                return res.status(422).send({
                                    error: 'O livro não pode ser inativado pois está alugado!'
                                });

                            }else{

                                conn.query(

                                    'UPDATE livros SET ativo = 0 WHERE id = ?',
                                    [req.body.id_livro],
                                    (error, resultado, field) => {
                                        conn.release(); //Limpa o pool
                        
                                        if (error) {
                                            return res.status(500).send({
                                                error: error
                                            });
                                        }
                        
                                        res.status(207).send({});
                                    }
                                );
                            }
            
                            
                        }
                    );
                    
                }

            }
        );
    });

});

router.post('/locar/:id_livro', login, (req, res, next) => {

    if(req.body.previsao_devolucao == '' || typeof(req.body.previsao_devolucao) === 'undefined' || req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
        
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }

    mysql.getConnection((error, conn)=>{

        conn.query(

            'SELECT * FROM livros WHERE id = ?;',
            [req.params.id_livro],
            (error, resultado, field) => {

                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                if(resultado.length < 1){
                    return res.status(404).send({
                        error: 'Livro não encontrado'
                    });
                }else{

                    if (resultado[0].ativo != 1) {
                        return res.status(422).send({
                            error: 'O livro está inativo'
                        });
                    }

                    conn.query(
                        'SELECT * FROM movimentos WHERE id_usuario = ? AND previsao_devolucao <= ? AND devolucao  is null ;',
                        [req.usuario.id,data_atual_formatada],
                        (error, resultado, field) => {
                            conn.release(); //Limpa o pool
            
                            if (error) {
                                return res.status(500).send({
                                    error: error
                                });
                            }

                            if(resultado.length > 0){
                                return res.status(422).send({
                                    error: 'Você está inadimplente, devolva o livro '+resultado[0].id_livro
                                });
                            }else{
                                
                                conn.query(
                                    'SELECT * FROM movimentos WHERE id_livro = ? AND devolucao is null;',
                                    [req.params.id_livro],
                                    (error, resultado, field) => {
                                        conn.release(); //Limpa o pool
                        
                                        if (error) {
                                            return res.status(500).send({
                                                error: error
                                            });
                                        }
                                        
                                        if(resultado.length > 0){

                                            return res.status(422).send({
                                                error: "O livro já está alugado!"
                                            });

                                        }else{

                                            if(req.body.previsao_devolucao <= data_atual_formatada){
                                                return res.status(422).send({
                                                    error: 'A previsão de devolução deve ser maior que o dia atual!'
                                                });
                                            }
                                            
                                            conn.query(
                                                'INSERT INTO movimentos (id_usuario, id_livro, locacao, dt_locacao, previsao_devolucao, status) VALUES (?,?,1,?,?,\'ABERTO\');',
                                                [req.usuario.id, req.params.id_livro, data_atual_formatada, req.body.previsao_devolucao],
                                                (error, resultado, field) => {
                                                    conn.release(); //Limpa o pool
                                    
                                                    if (error) {
                                                        return res.status(500).send({
                                                            error: error
                                                        });
                                                    }
                                    
                                                    res.status(204).send({});
                                                }
                                            );
                                            
                                        }
                                        
                                    }
                                );
                            }
                        }
                    );
                }
                
            }
        );
    });

});

router.post('/devolver/:id_livro', login, (req, res, next) => {

    if(req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
        
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }

    mysql.getConnection((error, conn)=>{
        
        conn.query(
            'SELECT * FROM livros WHERE id = ?;',
            [req.params.id_livro],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                if(resultado.length < 1){
                    return res.status(404).send({
                        error: 'Livro não encontrado'
                    });
                }else{
                    conn.query(
                        'SELECT * FROM movimentos WHERE id_livro = ? AND id_usuario = ? AND dt_devolucao is null;',
                        [req.params.id_livro,req.usuario.id],
                        (error, resultado, field) => {
                            conn.release(); //Limpa o pool
            
                            if (error) {
                                return res.status(500).send({
                                    error: error
                                });
                            }
            
                            if(resultado.length < 1){
                                return res.status(422).send({
                                    error: 'Você não locou este livro'
                                });
                            }else{
                                conn.query(

                                    'UPDATE movimentos SET dt_devolucao = ?, devolucao = 1, status = \'CONCLUIDO\';',
                                    [data_atual_formatada],
                                    (error, resultado, field) => {
                                        conn.release(); //Limpa o pool
                        
                                        if (error) {
                                            return res.status(500).send({
                                                error: error
                                            });
                                        }
                        
                                        res.status(204).send({});
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    });

});

module.exports = router;