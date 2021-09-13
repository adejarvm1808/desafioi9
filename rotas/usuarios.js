const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');

router.post('/cadastrar_usuario', (req, res, next) => {

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
                            status: false,
                            msg: error
                        });
                    }

                    if(resultado.length > 0){
                        return res.status(409).send({
                            status: false,
                            msg: 'Usuário já cadastrado'
                        });
                    }else{

                        conn.query(
                            'INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?);',
                            [req.body.nome,req.body.email, hash],
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
                    }
    
        
                }
            );
            
        });
        
    });

});

router.post('/login', (req, res, next) => {

    mysql.getConnection((error, conn)=>{

        const query = 'SELECT * FROM usuarios WHERE email = ?;'

        conn.query(
            
            query,
            [req.body.email],
            (error, resultado, field) => {

                conn.release(); //Limpa o pool

                if (error) {
                    return res.status(500).send({
                        status: false,
                        msg: error
                    });
                }

                //Verifica se o e-mail existe
                if (resultado.length < 1) {
                    return res.status(500).send({
                        status: false,
                        msg: 'E-mail incorreto!'
                    });
                }

                bcrypt.compare(req.body.senha, resultado[0].senha, (err, result) =>{

                    if(err){
                        return res.status(401).send({
                            status: false,
                            msg: 'Senha inválida!'
                        });
                    }

                    if(result){
                        const token = jwt.sign({
                            email: resultado[0].email,

                        },'i9_key', {
                            expiresIn: '1h'
                        });
                        return res.status(200).send({
                            status: true,
                            msg: 'Autenticado com sucesso!',
                            token: token
                        });
                    }

                    return res.status(401).send({
                        status: false,
                        msg: 'Senha inválida!'
                    });

                });
            }
        );
    });

});

router


module.exports = router;