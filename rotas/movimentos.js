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

router.post('/locar_livro', login, (req, res, next) => {
    if(req.body.previsao_devolucao == '' || typeof(req.body.previsao_devolucao) === 'undefined' || req.body.id_livro == '' || typeof(req.body.id_livro) === 'undefined'){
        console.log('ccc');
        return res.status(401).send({
            status: false,
            msg: 'Verifique os campos obrigatórios na documentação!'
        });
    }

    mysql.getConnection((error, conn)=>{

        conn.query(

            'SELECT * FROM livros WHERE id = ?;',
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
                    return res.status(401).send({
                        status: false,
                        msg: 'Livro não encontrado'
                    });
                }else{

                    if (resultado[0].ativo != 1) {
                        return res.status(401).send({
                            status: false,
                            msg: 'O livro está inativo'
                        });
                    }

                    conn.query(
                        'SELECT * FROM movimentos WHERE id_usuario = ? AND previsao_devolucao <= ? AND devolucao  is null ;',
                        [req.usuario.id,data_atual_formatada],
                        (error, resultado, field) => {
                            conn.release(); //Limpa o pool
            
                            if (error) {
                                return res.status(500).send({
                                    status: false,
                                    msg: error
                                });
                            }

                            if(resultado.length > 0){
                                return res.status(401).send({
                                    status: false,
                                    msg: 'Você está inadimplente, devolva o livro '+resultado[0].id_livro
                                });
                            }else{
                                
                                conn.query(
                                    'SELECT * FROM movimentos WHERE id_livro = ? AND devolucao is null;',
                                    [req.body.id_livro],
                                    (error, resultado, field) => {
                                        conn.release(); //Limpa o pool
                        
                                        if (error) {
                                            return res.status(500).send({
                                                status: false,
                                                msg: error
                                            });
                                        }
                                        
                                        if(resultado.length > 0){

                                            return res.status(401).send({
                                                status: false,
                                                msg: "O livro já está alugado!"
                                            });

                                        }else{

                                            if(req.body.previsao_devolucao <= data_atual_formatada){
                                                return res.status(401).send({
                                                    status: false,
                                                    msg: 'A previsão de devolução deve ser maior que o dia atual!'
                                                });
                                            }
                                            
                                            conn.query(
                                                'INSERT INTO movimentos (id_usuario, id_livro, locacao, dt_locacao, previsao_devolucao, status) VALUES (?,?,1,?,?,\'ABERTO\');',
                                                [req.usuario.id, req.body.id_livro, data_atual_formatada, req.body.previsao_devolucao],
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
                                                        msg: 'Livro locado com sucesso!',
                                                    });
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

router.post('/devolver_livro', login, (req, res, next) => {
    if(req.body.id_livro == '' || typeof(req.body.id_livro) === 'undefined'){
        console.log('ccc');
        return res.status(401).send({
            status: false,
            msg: 'Verifique os campos obrigatórios na documentação!'
        });
    }
    mysql.getConnection((error, conn)=>{
        conn.query(
            'SELECT * FROM livros WHERE id = ?;',
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
                    return res.status(401).send({
                        status: false,
                        msg: 'Livro não encontrado'
                    });
                }else{
                    conn.query(
                        'SELECT * FROM movimentos WHERE id_livro = ? AND id_usuario = ? AND dt_devolucao is null;',
                        [req.body.id_livro,req.usuario.id],
                        (error, resultado, field) => {
                            conn.release(); //Limpa o pool
            
                            if (error) {
                                return res.status(500).send({
                                    status: false,
                                    msg: error
                                });
                            }
            
                            if(resultado.length < 1){
                                return res.status(401).send({
                                    status: false,
                                    msg: 'Você não locou este livro'
                                });
                            }else{
                                conn.query(
                                    'UPDATE movimentos SET dt_devolucao = ?, devolucao = 1, status = \'CONCLUIDO\';',
                                    [data_atual_formatada],
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
                                            msg: 'Livro devolvido com sucesso!',
                                        });
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

router.post('/meu_historico', login, (req, res, next) => {

    mysql.getConnection((error, conn)=>{
        conn.query(
            'SELECT * FROM movimentos WHERE id_usuario = ?;',
            [req.usuario.id],
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

module.exports = router;