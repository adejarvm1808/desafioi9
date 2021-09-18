const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const login = require('../middleware/login');

router.post('/', (req, res, next) => {

    if(req.body.nome == '' || typeof(req.body.nome) === 'undefined' || req.body.email == '' || typeof(req.body.email) === 'undefined' || req.body.senha == '' || typeof(req.body.senha) === 'undefined'){

        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });

    }

    mysql.getConnection((error, conn)=>{

        //Encriptação unilateral da senha
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
            //Verifica se existe alguma falha na criptografia
            if (errBcrypt) {
                return res.status(500).send({
                    error: errBcrypt
                });
            }
            //Verifica se o usuário já é cadastrado
            conn.query(

                'SELECT * FROM usuarios WHERE email = ?;',
                [req.body.email],
                (error, resultado, field) => {
                    conn.release(); //Limpa o pool
    
                    if (error) {
                        return res.status(500).send({
                            error: error
                        });
                    }

                    if(resultado.length > 0){
                        return res.status(422).send({
                            error: 'Usuário já cadastrado'
                        });

                    }else{

                        conn.query(

                            'INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?);',
                            [req.body.nome,req.body.email, hash],
                            (error, resultado, field) => {
                                conn.release(); //Limpa o pool
                
                                if (error) {
                                    return res.status(500).send({
                                        error: error
                                    });
                                }
                
                                res.status(201).send({
                                    id_usuario: resultado.insertId
                                });
                            }
                        );
                    }
    
        
                }
            );
            
        });
        
    });

});

router.post('/login', (req, res, next) => {

    if(req.body.email == '' || typeof(req.body.email) === 'undefined' || req.body.senha == '' || typeof(req.body.senha) === 'undefined'){
        
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }

    mysql.getConnection((error, conn)=>{

        const query = 'SELECT * FROM usuarios WHERE email = ?;'

        conn.query(
            
            query,
            [req.body.email],
            (error, resultado, field) => {

                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                //Verifica se o e-mail existe
                if (resultado.length < 1) {
                    return res.status(401).send({
                        error: 'E-mail incorreto!'
                    });
                }

                bcrypt.compare(req.body.senha, resultado[0].senha, (err, result) =>{

                    if(err){
                        return res.status(401).send({
                            error: 'Senha inválida!'
                        });
                    }

                    if(result){

                        const token = jwt.sign({
                            
                            id: resultado[0].id,
                            email: resultado[0].email,
                            nome: resultado[0].nome

                        },'i9_key', {

                            expiresIn: '1h'

                        });
                        return res.status(200).send({
                            token: token
                        });
                    }

                    return res.status(401).send({
                        error: 'Senha inválida!'
                    });

                });
            }
        );
    });

});

router.get('/historico', login, (req, res, next) => {

    mysql.getConnection((error, conn)=>{
        conn.query(
            'SELECT * FROM movimentos WHERE id_usuario = ?;',
            [req.usuario.id],
            (error, resultado, field) => {
                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        error: error
                    });
                }

                res.status(200).send({
                    retorno: resultado
                });
            }
        );
    });

});

module.exports = router;