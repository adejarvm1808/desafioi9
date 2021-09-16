
<h1><strong>desafioi9</strong></h1>

<p>
  API REST para:
  <ol>
    <li>inserção de usuários</li>
    <li>cadastro e inativação de livros</li>
    <li>locação e devolução de livros</li>
  </ol>
</p>
<br>
<h3>Metodologia de gestão</h3>
<hr>
<p>
  Separei em 3 ciclos sendoo eles:
  
  <ol>
    <li>Estrutural (Criação do banco de dados e repositório no GitHub)/li>
    <li>Desenvolvimento das rotas e implantação de regras de negócios</li>
    <li>Benchmark e deploy</li>
  </ol>
  
  Criei as sub-tarefas em formato de check-list dentro dos cartões
  
 Segue o link do quadro do trello: https://trello.com/b/uu8h7D54/desafio
 
</p>
<br>
<h3>Informações técnicas:</h3>
<hr>
<p>
  
  Banco de dados: MySQL
  
  Linguagem: JavaScript + NodeJS
  
  Dependências:
  <ol>
    <li>bcrypt (Para criptografar as senhas dos usuários)</li>
    <li>express (Para estrutrua e gerenciamento de rotas)</li>
    <li>jsonwebtoken (Para criação do token de autenticação)/li>
    <li>mysql2 (Para CRUD, optei em não escolher o sequelize para apresentar conhecimentos em SQL)</li>
  </ol>

</p>
<br>
<h3>Estrutura de dados</h3>
<br>
<hr>
<pre>

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `livros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `autor` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `dar_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_cadastro` int(11) NOT NULL,
  `ativo` varchar(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `movimentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` varchar(20) NOT NULL,
  `id_livro` varchar(20) NOT NULL,
  `locacao` varchar(1) DEFAULT NULL,
  `dt_locacao` date DEFAULT NULL,
  `previsao_devolucao` date DEFAULT NULL,
  `devolucao` varchar(1) DEFAULT NULL,
  `dt_devolucao` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


</pre>
<br>
<hr>
Link da documentação com exemplos via Postman: https://documenter.getpostman.com/view/11147383/U16onNCy
