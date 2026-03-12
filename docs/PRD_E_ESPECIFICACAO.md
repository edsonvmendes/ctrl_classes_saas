# PRD e Especificacao Funcional - Portal de Boletos White-Label

## 1. Visao do produto

O Portal de Boletos White-Label e uma plataforma web multiempresa para disponibilizacao e acompanhamento de boletos emitidos fora da plataforma, com experiencia simples para o cliente final e rastreabilidade completa para a operacao.

O cliente final deve conseguir:

- acessar seus boletos com autenticacao simples e segura;
- visualizar boletos em aberto, vencidos e historico;
- baixar PDF e copiar linha digitavel;
- visualizar Pix QR Code quando existir;
- pedir ajuda sem expor o fluxo entre Empresa A e Empresa B.

O time operacional deve conseguir:

- cadastrar empresas e clientes finais;
- inserir boletos manualmente ou por upload;
- extrair metadados automaticamente;
- revisar inconsistencias;
- notificar clientes;
- acompanhar acessos, eventos e tickets.

## 2. Problema que o produto resolve

Hoje o processo de distribuicao de boletos tende a ser fragmentado, pouco rastreavel e dependente de atendimento manual. Isso gera:

- dificuldade para o cliente final localizar documentos;
- alto volume de suporte por falta de autosservico;
- risco operacional por erro de digitacao;
- baixa auditabilidade de envio, acesso e tratamento de excecoes;
- dependencia de processos internos invisiveis para o usuario final.

## 3. Objetivos do MVP

- Centralizar a disponibilizacao de boletos em um portal white-label.
- Reduzir digitacao manual por meio de extracao automatica de metadados.
- Entregar autenticacao local simples no MVP sem travar evolucao futura.
- Garantir separacao logica por empresa e ocultar a Empresa A do cliente final.
- Registrar auditoria minima de eventos criticos.

## 4. Nao objetivos do MVP

- emissao de boletos dentro da plataforma;
- app mobile nativo;
- conciliacao bancaria avancada;
- omnichannel completo;
- automacoes financeiras complexas;
- integracao profunda com ERPs e bancos na primeira versao.

## 5. Personas e atores

### 5.1 Empresa A

Operacao central ou escritorio financeiro que gera o boleto fora da plataforma e faz a administracao global do sistema.

### 5.2 Empresa B

Cliente corporativo da Empresa A. Seu branding aparece para o cliente final e seus operadores tratam parte dos tickets e consultas.

### 5.3 Cliente final

Pessoa fisica ou juridica associada a uma Empresa B que precisa consultar, baixar e pagar boletos.

## 6. Escopo funcional do MVP

### 6.1 Gestao de empresas B

- cadastro de empresa;
- configuracao de branding;
- configuracao de suporte e canais;
- ativacao e inativacao.

### 6.2 Gestao de clientes finais

- cadastro manual;
- associacao a Empresa B;
- dados de contato;
- canal preferido;
- status ativo ou inativo.

### 6.3 Gestao de boletos

- cadastro manual;
- upload individual de PDF;
- associacao ao cliente correto;
- armazenamento privado;
- estados de ciclo de vida;
- substituicao e cancelamento preservando historico.

### 6.4 Extracao automatica de metadados

- tentativa de extracao textual do PDF;
- fallback para OCR quando necessario;
- consolidacao dos campos extraidos;
- score de confianca por execucao;
- marcacao de campos revisados manualmente;
- bloqueio de publicacao sem validacao minima.

### 6.5 Portal do cliente

- login por OTP ou link magico;
- dashboard com boletos disponiveis;
- lista e detalhe de boletos;
- download PDF;
- copia da linha digitavel;
- visualizacao de historico;
- abertura e acompanhamento simplificado de ticket.

### 6.6 Tickets de suporte

- abertura vinculada a boleto;
- motivos padronizados;
- mensagem opcional;
- fila interna;
- status simplificado para o cliente;
- historico interno completo para a operacao.

### 6.7 Notificacoes

- envio de e-mail transacional;
- templates por Empresa B;
- reenvio manual;
- registro de entrega e falha.

### 6.8 Auditoria

- logins e falhas de login;
- criacao e alteracao de boletos;
- resultados da extracao;
- envio e clique de notificacoes;
- visualizacao e download do boleto;
- abertura e evolucao de tickets;
- mudancas de configuracao critica.

## 7. Requisitos funcionais detalhados

### RF-01 Autenticacao interna local

Usuarios internos devem autenticar com e-mail e senha, com hash forte, expiracao de sessao e fluxo de reset de senha.

### RF-02 Autenticacao externa passwordless

Clientes finais devem autenticar por OTP e/ou link magico de uso temporario, sem senha permanente no MVP.

### RF-03 Segregacao multiempresa

Cada Empresa B deve visualizar apenas seus clientes, boletos, tickets e configuracoes.

### RF-04 White-label

O portal do cliente deve exibir identidade visual da Empresa B, incluindo nome da marca, logo, cores e contatos de suporte.

### RF-05 Insercao de boleto

O sistema deve permitir cadastro manual e upload de PDF, associando o documento a Empresa B e cliente final.

### RF-06 Extracao automatica obrigatoria

Todo boleto enviado por arquivo deve acionar pipeline de extracao automatica antes da disponibilizacao.

### RF-07 Revisao operacional

O operador deve conseguir revisar e corrigir campos extraidos e identificar o que veio automatico e o que foi alterado manualmente.

### RF-08 Consulta pelo cliente final

O cliente final deve conseguir listar, filtrar e abrir apenas boletos aos quais esta vinculado.

### RF-09 Download e copia

O sistema deve permitir download do PDF e copia da linha digitavel, auditando as acoes.

### RF-10 Ticket de ajuda

O cliente final deve abrir solicitacao de ajuda a partir de um boleto, escolhendo motivo e inserindo mensagem opcional.

### RF-11 Notificacao

O sistema deve notificar o cliente final quando um boleto for disponibilizado e permitir reenvio manual.

### RF-12 Auditoria

Todas as acoes criticas devem gerar eventos de auditoria com ator, entidade, acao, momento e origem.

## 8. Requisitos nao funcionais

### RNF-01 Seguranca

- TLS obrigatorio;
- hash de senha com Argon2id ou bcrypt forte;
- tokens armazenados em hash;
- buckets privados para PDFs;
- links assinados e temporarios para download;
- limitacao de tentativas de autenticacao;
- expiracao de sessao e revogacao;
- segregacao por tenant validada no backend.

### RNF-02 Disponibilidade

O MVP deve priorizar simplicidade operacional. Meta inicial recomendada: 99,5% de disponibilidade mensal.

### RNF-03 Performance

- login OTP: resposta media ate 2 segundos, sem considerar entrega externa do e-mail;
- listagem de boletos: resposta media ate 1 segundo em filtros comuns;
- detalhe do boleto: resposta media ate 1 segundo para metadados;
- extracao: processamento assincrono com feedback de status ao operador.

### RNF-04 Observabilidade

- logs estruturados;
- trilha de auditoria;
- metricas de fila e extracao;
- alertas para falhas repetidas de OCR, notificacao e autenticacao.

### RNF-05 LGPD

- minimo necessario de dados pessoais;
- base legal e finalidade registradas;
- controle de acesso por perfil;
- mascaramento parcial em telas internas quando aplicavel;
- politica de retencao para logs e tokens.

## 9. Regras de negocio

- RB-01 O cliente final nunca visualiza a Empresa A no portal.
- RB-02 Um boleto so pode ficar disponivel ao cliente quando tiver validacao minima concluida.
- RB-03 O documento substituido deve continuar no historico, com status que indique substituicao.
- RB-04 O canal de notificacao padrao do MVP e e-mail.
- RB-05 Um ticket sempre nasce associado a boleto.
- RB-06 Um link magico e de uso unico ou deve ser invalidado ao primeiro uso confirmado.
- RB-07 Campos criticos para publicacao do boleto: referencia, valor, vencimento, cliente vinculado e arquivo valido.
- RB-08 Alteracoes manuais em metadados devem registrar usuario, data e valor anterior.
- RB-09 Operador Empresa B nao pode alterar configuracoes globais da plataforma.
- RB-10 Admin da plataforma pode atuar cross-tenant com trilha de auditoria reforcada.

## 10. KPIs recomendados para o MVP

- percentual de boletos com extracao automatica completa;
- percentual de boletos com revisao manual;
- tempo medio entre upload e disponibilizacao;
- taxa de entrega de e-mail;
- taxa de abertura de link seguro;
- percentual de boletos visualizados antes do vencimento;
- tickets por 100 boletos;
- tempo medio de primeira resposta do ticket;
- falhas de autenticacao por cliente e por IP.

## 11. Criticos de aceite do MVP

O MVP pode ser considerado pronto para piloto quando:

- operadores internos conseguem inserir e revisar boletos;
- clientes conseguem acessar e baixar documentos com seguranca;
- a separacao entre empresas funciona no backend;
- auditoria minima esta ativa;
- tickets e notificacoes estao operacionais;
- a extracao automatica cobre o fluxo principal e possui fallback manual claro.

## 12. Riscos principais e mitigacoes

- PDFs de baixa qualidade podem reduzir a acuracia da extracao.
  Mitigacao: fallback OCR, score de confianca e tela forte de revisao.
- Dados cadastrais incompletos podem impedir entrega de notificacoes.
  Mitigacao: validacao de cadastro e fila de falhas de envio.
- Vazamento cross-tenant e o maior risco de seguranca do produto.
  Mitigacao: enforcement por middleware, consultas escopadas e testes automatizados de autorizacao.
- Crescimento do volume pode saturar extracao sincrona.
  Mitigacao: extracao assincrona com fila desde o MVP.
