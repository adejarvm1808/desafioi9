const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.PostUsuarios = (req, res, next) => {

    if(req.body.nome == '' || typeof(req.body.nome) === 'undefined' || req.body.email == '' || typeof(req.body.email) === 'undefined' || req.body.senha == '' || typeof(req.body.senha) === 'undefined'){

        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });

    }

    bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
        //Verifica se existe alguma falha na criptografia
        if (errBcrypt) {
            return res.status(500).send({
                error: errBcrypt
            });
        }
        mysql.execute("SELECT * FROM usuarios WHERE email = ?;", [req.body.email]).then((result) => {
        
            if(result.length > 0){

                return res.status(422).send({
                    error: 'Usuário já cadastrado'
                });

            }else{

                mysql.execute("INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?);", [req.body.nome,req.body.email, hash]).then((result) => {
        
                    if(result.length < 1){
                        return res.status(204).send({});
                    }
            
                    res.status(201).send({
                        id_usuario: result.insertId
                    });
            
                }).catch((error) =>{
                    return res.status(500).send({
                        error: error
                    });
                });
            }
    
           
    
        }).catch((error) =>{
            return res.status(500).send({
                error: error
            });
        });

    });

}

exports.PostUsuariosLogin = (req, res, next) => {

    if(req.body.email == '' || typeof(req.body.email) === 'undefined' || req.body.senha == '' || typeof(req.body.senha) === 'undefined'){
        
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }

    mysql.execute("SELECT * FROM usuarios WHERE email = ?;", [req.body.email]).then((result) => {
        
        if(result.length < 1){
            return res.status(401).send({
                error: 'E-mail incorreto!'
            });
        }

        bcrypt.compare(req.body.senha, result[0].senha, (err, resultado) =>{

            if(err){
                return res.status(401).send({
                    error: err
                });
            }

            if(resultado){

                const token = jwt.sign({
                    
                    id: result[0].id,
                    email: result[0].email,
                    nome: result[0].nome

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


    }).catch((error) =>{
        return res.status(500).send({
            error: error
        });
    });

}

exports.GetUsuariosHistorico = (req, res, next) => {

    mysql.execute("SELECT * FROM movimentos WHERE id_usuario = ?;", [req.usuario.id]).then((result) => {
        
        if(result.length < 1){
            return res.status(204).send({});
        }

        res.status(200).send({
            retorno: result
        });

    }).catch((error) =>{
        return res.status(500).send({
            error: error
        });
    });

}