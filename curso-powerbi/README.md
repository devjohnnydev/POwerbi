# Curso Power BI · Braga Treinamentos

Site estático com as 13 aulas do curso, pronto para hospedar no Railway.

## Estrutura

```
curso-powerbi/
├── server.js            # servidor Node sem dependências (lê a variável PORT)
├── package.json         # "npm start" -> node server.js
├── railway.json         # comando de start e health check (/healthz)
└── site/
    ├── index.html       # página inicial com as 13 aulas e o progresso do aluno
    ├── assets/          # curso.css, curso.js, favicon.svg (comuns a todas as aulas)
    ├── arquivos/        # bases, tema JSON e fundo PNG para download (ver LEIA-ME.txt)
    ├── aula-01/ … aula-13/
    │   ├── index.html   # a aula completa
    │   └── img/         # prints usados na aula
```

| Aula | Pasta | Tema |
|---|---|---|
| 01 | aula-01 | Power BI para Business Intelligence |
| 02 | aula-02 | Importando dados do Excel e o Power Query |
| 03 | aula-03 | Atualizando os dados |
| 04 | aula-04 | Relacionamentos |
| 05 | aula-05 | Primeiros passos com DAX |
| 06 | aula-06 | Projeto Dashboard de Vendas |
| 07 | aula-07 | Power BI com dados reais do IBGE |
| 08 | aula-08 | Inspiração e design (Pinterest, Dribbble, Figma) |
| 09 | aula-09 | Power Query intermediário |
| 10 | aula-10 | Calendário e inteligência de tempo |
| 11 | aula-11 | DAX intermediário |
| 12 | aula-12 | Interatividade e storytelling |
| 13 | aula-13 | Publicação, segurança e projeto final |

## Antes do deploy

Copie o pacote de bases para `site/arquivos/` com este nome exato:

```
site/arquivos/Aula_1_-_Importando_Base_de_Dados_1.zip
```

Sem ele, o link de download mostra uma página “Arquivo não encontrado” pedindo o arquivo ao professor.

## Rodar no seu computador

```bash
node server.js
# abra http://localhost:3000
```

Também funciona abrindo `site/index.html` direto no navegador.

## Deploy no Railway

### Opção 1: pelo GitHub (recomendada)

1. Crie um repositório no GitHub e envie esta pasta:
   ```bash
   git init
   git add .
   git commit -m "Curso Power BI - 13 aulas"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/curso-powerbi.git
   git push -u origin main
   ```
2. No Railway: **New Project → Deploy from GitHub repo** → escolha o repositório.
3. O Railway detecta o Node pelo `package.json` e roda `npm start`.
4. Em **Settings → Networking → Generate Domain** para ganhar um endereço público.
5. A cada `git push`, o Railway publica de novo.

### Opção 2: Railway CLI

```bash
npm i -g @railway/cli
railway login
railway init
railway up
railway domain
```

## Editar uma aula

Cada aula é um HTML autônomo em `site/aula-XX/index.html`. Os estilos e o comportamento (checklist, copiar código, ampliar prints, tema claro/escuro) ficam em `site/assets/`. O progresso do aluno é salvo no navegador dele (localStorage), por aula.
