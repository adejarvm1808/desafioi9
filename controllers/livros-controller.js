const mysql = require('../mysql');

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


exports.PostLivros = (req, res, next) => {

    if(req.body.autor == '' || typeof(req.body.autor) === 'undefined' || req.body.titulo == '' || typeof(req.body.titulo) === 'undefined'){
            
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }

    mysql.execute("INSERT INTO livros (titulo, autor, id_usuario_cadastro, ativo) VALUES (?,?,?, 1);", [req.body.titulo,req.body.autor, req.usuario.id]).then((result) => {
    
        res.status(201).send({
            id_livro: result.insertId
        });

    }).catch((error) =>{
        return res.status(500).send({
            error: error
        });
    });
    
}

exports.GetLivros = (req, res, next) => {

    mysql.execute("SELECT * FROM livros;").then((result) => {
        
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

exports.GetLivrosUm = (req, res, next) => {

    mysql.execute("SELECT * FROM livros WHERE id = ?;",[req.params.id_livro]).then((result) => {
        
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

exports.PostLivrosInativar = (req, res, next) => {

    if(req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
     
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }
    mysql.execute("SELECT * FROM livros WHERE id = ? ;", [req.params.id_livro]).then((result) => {
        
        if(result.length < 1){
            return res.status(404).send({
                error: 'Livro não encontrado'
            });
        }else{
            if (result[0].id_usuario_cadastro !== req.usuario.id) {
                return res.status(422).send({
                    error: 'Somente o usuário que cadastrou o livro pode inativá-lo!'
                });
            }
            mysql.execute("SELECT * FROM movimentos WHERE  id_livro = ? AND devolucao is null;", [req.params.id_livro]).then((result) => {
        
                if(result.length > 0){

                    return res.status(422).send({
                        error: 'O livro não pode ser inativado pois está alugado!'
                    });

                }else{
                    mysql.execute("UPDATE livros SET ativo = 0 WHERE id = ?;", [req.params.id_livro]).then((result) => {
        
                        res.status(204).send({});
                
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
        }

    }).catch((error) =>{
        return res.status(500).send({
            error: error
        });
    });
}

exports.PostLivrosLocar = (req, res, next) => {

    if(req.body.previsao_devolucao == '' || typeof(req.body.previsao_devolucao) === 'undefined' || req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
        
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });

    }

    mysql.execute("SELECT * FROM livros WHERE id = ?;", [req.params.id_livro]).then((result) => {
        
        if(result.length < 1){
            return res.status(404).send({
                error: 'Livro não encontrado'
            });
        }else{

            if (result[0].ativo != 1) {
                return res.status(422).send({
                    error: 'O livro está inativo'
                });
            }

            mysql.execute("SELECT * FROM movimentos WHERE id_usuario = ? AND previsao_devolucao <= ? AND devolucao  is null ;", [req.usuario.id,data_atual_formatada]).then((result) => {
        
                if(result.length > 0){

                    return res.status(422).send({
                        error: 'Você está inadimplente, devolva o livro '+result[0].id_livro
                    });

                }else{

                    mysql.execute("SELECT * FROM movimentos WHERE id_livro = ? AND devolucao is null;", [req.params.id_livro]).then((result) => {
        
                        if(result.length > 0){

                            return res.status(422).send({
                                error: "O livro já está alugado!"
                            });

                        }else{

                            if(req.body.previsao_devolucao <= data_atual_formatada){

                                return res.status(422).send({
                                    error: 'A previsão de devolução deve ser maior que o dia atual!'
                                });

                            }else{

                                mysql.execute("INSERT INTO movimentos (id_usuario, id_livro, locacao, dt_locacao, previsao_devolucao, status) VALUES (?,?,1,?,?,\'ABERTO\');", [req.usuario.id, req.params.id_livro, data_atual_formatada, req.body.previsao_devolucao]).then((result) => {
                            
                                    res.status(204).send({});
                            
                                }).catch((error) =>{
                                    return res.status(500).send({
                                        error: error
                                    });
                                });

                            }

                        }
                
                
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
        }


    }).catch((error) =>{
        return res.status(500).send({
            error: error
        });
    });
    
}

exports.PostLivrosDevolver = (req, res, next) => {

    if(req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
        
        return res.status(422).send({
            error: 'Verifique os campos obrigatórios na documentação!'
        });
    }

    mysql.execute("SELECT * FROM livros WHERE id = ?;", [req.params.id_livro]).then((result) => {
        
        if(result.length < 1){

            return res.status(404).send({
                error: 'Livro não encontrado'
            });

        }else{

            mysql.execute("SELECT * FROM movimentos WHERE id_livro = ? AND id_usuario = ? AND dt_devolucao is null;", [req.params.id_livro,req.usuario.id]).then((result) => {
        
                if(result.length < 1){

                    return res.status(422).send({
                        error: 'Você não locou este livro'
                    });

                }else{

                    mysql.execute("UPDATE movimentos SET dt_devolucao = ?, devolucao = 1, status = \'CONCLUIDO\';", [data_atual_formatada]).then((result) => {
        
                        res.status(204).send({});
                
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

        }

    }).catch((error) =>{
        return res.status(500).send({
            error: error
        });
    });

}
