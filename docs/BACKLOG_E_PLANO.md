# Backlog Inicial e Plano de Implementacao

## 1. Estrategia de entrega

A recomendacao e dividir o trabalho em 4 frentes paralelas:

- base de plataforma e seguranca;
- operacao interna;
- portal do cliente;
- extracao e notificacoes.

## 2. Epicos

### EP-01 Fundacao tecnica

Historias:

- configurar aplicacao web e backend;
- configurar PostgreSQL, migrations e seeds;
- configurar storage privado;
- configurar observabilidade basica;
- configurar pipeline CI basico.

Criterios de aceite:

- projeto sobe localmente;
- migrations executam;
- healthcheck responde;
- upload de arquivo para storage privado funciona.

### EP-02 Identidade e acesso

Historias:

- login interno com senha;
- reset de senha;
- OTP e magic link para cliente final;
- middleware de sessao;
- RBAC por perfil;
- segregacao por tenant.

Criterios de aceite:

- usuario interno loga e encerra sessao;
- cliente final acessa com token temporario;
- rotas negam acesso cross-tenant;
- falhas de login sao auditadas.

### EP-03 Cadastro base

Historias:

- CRUD de Empresa B;
- CRUD de cliente final;
- CRUD de usuario interno;
- configuracoes de branding.

Criterios de aceite:

- admin plataforma cria tenant;
- admin Empresa B ajusta branding;
- operador cadastra cliente valido.

### EP-04 Gestao de boletos

Historias:

- criacao manual de boleto;
- upload PDF;
- status de documento;
- substituicao;
- cancelamento;
- listagem e detalhe interno.

Criterios de aceite:

- operador cria boleto e visualiza no painel;
- documento fica em storage privado;
- substituicao preserva historico;
- auditoria registra alteracoes.

### EP-05 Extracao automatica

Historias:

- parser textual de PDF;
- fallback OCR;
- score de confianca;
- revisao manual;
- reprocessamento;
- painel de falhas.

Criterios de aceite:

- upload aciona extracao assincrona;
- execucao fica gravada;
- operador enxerga campos automaticos e manuais;
- boleto nao vai para `available` sem validacao minima.

### EP-06 Notificacoes

Historias:

- template de e-mail por tenant;
- disparo ao disponibilizar boleto;
- reenvio manual;
- log de entrega;
- clique em link auditado.

Criterios de aceite:

- cliente recebe e-mail com branding da Empresa B;
- erro de envio entra em fila de falha;
- reenvio manual funciona.

### EP-07 Portal do cliente

Historias:

- dashboard;
- lista de boletos;
- detalhe do boleto;
- download PDF;
- copia da linha digitavel;
- historico.

Criterios de aceite:

- cliente autenticado acessa apenas seus boletos;
- download funciona com seguranca;
- copia da linha gera evento.

### EP-08 Tickets e atendimento

Historias:

- abertura de ticket pelo cliente;
- lista interna de tickets;
- atribuicao;
- mudanca de status;
- mensagens e historico.

Criterios de aceite:

- ticket nasce a partir de boleto;
- operador enxerga fila por tenant;
- cliente acompanha status simplificado.

### EP-09 Auditoria e compliance

Historias:

- trilha de auditoria centralizada;
- tela de consulta;
- mascaramento parcial;
- retencao minima configuravel.

Criterios de aceite:

- eventos criticos aparecem na auditoria;
- filtros por tenant, usuario e entidade funcionam.

## 3. Ordem sugerida por sprint

### Sprint 1

- fundacao tecnica;
- schema inicial;
- autenticacao interna;
- cadastro de Empresa B;
- cadastro de cliente final;
- upload privado de documento.

### Sprint 2

- pipeline de extracao;
- revisao manual;
- listagem interna de boletos;
- estados e auditoria basica.

### Sprint 3

- autenticacao do cliente final;
- dashboard do cliente;
- lista e detalhe de boletos;
- download e copia de linha digitavel.

### Sprint 4

- notificacoes por e-mail;
- tickets;
- dashboard operacional;
- filtros e reenvios.

## 4. Historias prioritarias com aceite

### H-01 Como operador quero enviar um PDF de boleto para que o sistema extraia seus metadados

Aceite:

- upload aceita PDF valido;
- arquivo fica em storage privado;
- execucao de extracao e criada automaticamente;
- operador recebe feedback do status.

### H-02 Como operador quero revisar campos extraidos para evitar erro de publicacao

Aceite:

- campos mostram origem automatica ou manual;
- score de confianca e exibido;
- ao confirmar, boleto pode seguir para `available`.

### H-03 Como cliente final quero acessar meus boletos sem senha para consultar rapidamente

Aceite:

- recebo OTP ou link magico;
- apos validacao vejo apenas meus boletos;
- sessao expira automaticamente.

### H-04 Como cliente final quero baixar o PDF e copiar a linha digitavel

Aceite:

- PDF abre ou baixa com seguranca;
- linha digitavel pode ser copiada;
- eventos sao auditados.

### H-05 Como cliente final quero pedir ajuda a partir de um boleto para resolver problemas

Aceite:

- ticket fica vinculado ao boleto;
- escolho motivo;
- vejo status simplificado depois do envio.

## 5. Dependencias externas

- provedor de e-mail transacional;
- storage S3 compativel;
- biblioteca de OCR e parsing de PDF;
- politica de branding de cada Empresa B;
- decisao sobre canal adicional futuro como WhatsApp.

## 6. Testes recomendados

### Unitarios

- validacao de linha digitavel;
- score de confianca;
- regras de permissao;
- expiracao de token.

### Integracao

- login interno;
- OTP cliente final;
- upload e extracao;
- troca de status de boleto;
- abertura de ticket.

### E2E

- jornada completa operador -> cliente -> ticket;
- reenvio de notificacao;
- protecao cross-tenant.

## 7. Riscos de execucao

- subestimar a variabilidade dos PDFs de boleto;
- atrasar a definicao de branding por tenant;
- nao cobrir autorizacao com testes;
- acoplar auth ao provider cedo demais.

## 8. Definicoes prontas antes de codar forte

- formato real dos PDFs recebidos;
- campos obrigatorios para publicar boleto;
- politicas de expurgo e LGPD;
- SLA do atendimento;
- limites de tentativas e expiracao de token;
- provedores de e-mail e storage.
