# Fluxos e Telas

## 1. Jornada ponta a ponta

### 1.1 Insercao e disponibilizacao do boleto

1. Operador entra no painel interno.
2. Seleciona Empresa B.
3. Seleciona ou cria cliente final.
4. Faz upload do PDF ou cadastra dados manuais.
5. Sistema salva arquivo em storage privado.
6. Sistema cria registro do boleto com status inicial `processing`.
7. Pipeline de extracao e validacao e acionado.
8. Operador revisa dados quando necessario.
9. Sistema muda status para `available`.
10. Sistema envia notificacao por e-mail.
11. Evento entra na trilha de auditoria.

### 1.2 Acesso do cliente final

1. Cliente clica no link recebido ou informa documento + e-mail.
2. Sistema emite OTP ou valida magic link.
3. Sessao curta e criada.
4. Cliente ve dashboard com boletos.
5. Cliente acessa detalhe, copia linha ou baixa PDF.
6. Todas as acoes criticas sao auditadas.

### 1.3 Ticket de ajuda

1. Cliente abre detalhe do boleto.
2. Clica em `Preciso de ajuda com este boleto`.
3. Escolhe motivo.
4. Envia mensagem opcional.
5. Sistema cria ticket.
6. Fila interna e atualizada.
7. Operador trata o caso.
8. Cliente acompanha status simplificado.

### 1.4 Substituicao de boleto

1. Operador identifica problema no documento.
2. Novo boleto e inserido.
3. Documento antigo recebe status `replaced`.
4. Novo boleto referencia o anterior.
5. Cliente recebe nova notificacao.

## 2. Estados do boleto

Estados recomendados:

- `draft`: registro criado mas incompleto.
- `processing`: arquivo recebido e em extracao.
- `review_pending`: extracao parcial ou falha aguardando revisao.
- `available`: pronto para consulta do cliente.
- `viewed`: ja acessado pelo cliente ao menos uma vez.
- `paid`: quitado ou marcado manualmente.
- `overdue`: vencido e ainda nao quitado.
- `cancelled`: cancelado.
- `replaced`: substituido por novo documento.

Regra: `viewed`, `paid` e `overdue` podem coexistir com historico ou derivar de eventos, mas o modelo persistido pode usar um status principal e eventos auxiliares.

## 3. Telas do portal do cliente

### 3.1 Tela de acesso

Objetivo: iniciar autenticacao passwordless.

Componentes:

- logo e nome da Empresa B;
- titulo orientado a acao;
- campo documento;
- campo e-mail ou telefone conforme politica;
- CTA `Receber codigo`;
- opcao `Entrar com link recebido`;
- links de privacidade e suporte.

Estados:

- carregando;
- credenciais invalidas;
- limite de tentativas atingido;
- envio realizado com sucesso.

### 3.2 Tela de validacao de codigo

Componentes:

- campo OTP de 6 digitos;
- contador de expiracao;
- CTA confirmar;
- CTA reenviar.

Regra UX: nao informar se o documento existe ou nao antes da validacao final, para evitar enumeracao de usuarios.

### 3.3 Dashboard do cliente

Cards recomendados:

- boletos em aberto;
- boletos vencidos;
- proximos vencimentos;
- ultimas solicitacoes.

Lista resumida:

- referencia;
- valor;
- vencimento;
- status;
- acao `Ver boleto`.

### 3.4 Lista de boletos

Filtros:

- em aberto;
- vencidos;
- pagos;
- cancelados;
- substituidos;
- periodo.

Tabela ou cards:

- referencia;
- valor;
- vencimento;
- status;
- disponibilizado em;
- acao de detalhe.

### 3.5 Detalhe do boleto

Blocos:

- resumo financeiro;
- linha digitavel;
- QR/Pix se houver;
- botoes `Baixar PDF`, `Copiar linha digitavel`, `Preciso de ajuda`;
- historico resumido do documento.

Estados especiais:

- boleto substituido;
- boleto cancelado;
- boleto indisponivel temporariamente;
- boleto vencido.

### 3.6 Minhas solicitacoes

Lista:

- protocolo;
- boleto;
- motivo;
- data;
- status;
- ultima atualizacao.

## 4. Telas do painel interno

### 4.1 Login interno

Campos:

- e-mail;
- senha;
- esqueci minha senha.

Controles:

- bloqueio por tentativas;
- auditoria de falha;
- opcao futura de MFA.

### 4.2 Dashboard operacional

Widgets:

- boletos inseridos hoje;
- extracoes com falha;
- extracoes aguardando revisao;
- notificacoes falhas;
- tickets abertos;
- tickets fora do SLA;
- boletos vencendo nas proximas 48 horas.

### 4.3 Gestao de boletos

Colunas:

- referencia;
- empresa;
- cliente;
- valor;
- vencimento;
- status;
- origem;
- extracao;
- notificado;
- visualizado;
- ticket associado.

Acoes:

- abrir detalhe;
- revisar extracao;
- editar metadados;
- reenviar notificacao;
- substituir;
- cancelar.

### 4.4 Detalhe interno do boleto

Blocos:

- dados principais;
- documento e hash;
- cliente e tenant;
- logs de extracao;
- notificacoes;
- eventos de visualizacao;
- tickets relacionados;
- trilha de alteracoes.

### 4.5 Tela de revisao de extracao

Campos lado a lado:

- valor extraido;
- valor confirmado;
- origem do campo;
- score de confianca por campo.

Acoes:

- confirmar;
- corrigir;
- reprocesar;
- marcar como invalido.

### 4.6 Gestao de tickets

Campos:

- protocolo;
- empresa;
- cliente;
- motivo;
- prioridade;
- responsavel;
- SLA;
- status;
- ultima atualizacao.

### 4.7 Gestao de clientes finais

Campos:

- nome;
- documento;
- empresa;
- e-mail;
- telefone;
- canal preferido;
- total de boletos;
- total de tickets;
- status.

### 4.8 Gestao de empresas B

Blocos:

- dados cadastrais;
- branding;
- canais de suporte;
- status;
- politicas de notificacao.

### 4.9 Auditoria

Filtros:

- periodo;
- usuario;
- tipo de usuario;
- empresa;
- cliente;
- boleto;
- acao.

## 5. Permissoes por perfil

### Cliente final

- pode ver apenas seus boletos e tickets;
- nao pode editar dados estruturais;
- nao pode ver Empresa A.

### Operador Empresa B

- ve dados apenas da propria Empresa B;
- trata tickets;
- reenvia notificacoes;
- consulta boletos e clientes;
- nao administra plataforma.

### Admin Empresa B

- tudo do operador Empresa B;
- gerencia usuarios da propria empresa;
- configura branding e templates da empresa.

### Operador Empresa A

- insere e revisa boletos;
- trata falhas operacionais;
- pode atuar em multiplas empresas conforme escopo.

### Admin da plataforma

- acesso global;
- gerencia tenants, politicas e configuracoes compartilhadas;
- ve auditoria global.

## 6. Regras de experiencia

- A interface do cliente deve ser objetiva e pouco carregada.
- A linguagem deve falar de boleto, vencimento e ajuda, sem jargao interno.
- O nome e suporte da Empresa B devem estar sempre visiveis.
- O fluxo de ajuda deve ser acionavel a partir do contexto do boleto.
- O painel interno deve priorizar excecao operacional e fila de trabalho.
