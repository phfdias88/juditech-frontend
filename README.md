# 🖥️ JudiTech Frontend

Interface web da plataforma jurídica **JudiTech**, construída com **Next.js + TypeScript + Tailwind CSS**. Oferece dashboards, visualização de documentos e consumo de APIs jurídicas em uma experiência moderna e responsiva.

## ✨ Funcionalidades

- 📊 Dashboards e gráficos interativos (Recharts).
- 📄 Visualização de documentos PDF diretamente no navegador (pdf.js).
- 🔗 Integração com a API backend via Axios.
- 🗂️ Manipulação de arquivos compactados (JSZip).
- 🎨 UI moderna e responsiva com Tailwind CSS e ícones Lucide.
- 🐳 Pronto para deploy via Docker.

## 🛠️ Tecnologias

| Categoria | Tecnologias |
|-----------|-------------|
| Framework | Next.js, React |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Gráficos | Recharts |
| Documentos | pdf.js (pdfjs-dist) |
| HTTP | Axios |
| Ícones | Lucide React |
| Infra | Docker |

## 🚀 Como executar

Pré-requisitos: Node.js 18+ e npm.

```bash
git clone https://github.com/phfdias88/juditech-frontend.git
cd juditech-frontend

npm install
npm run dev
```

Acesse `http://localhost:3000` no navegador.

Para gerar a build de produção:

```bash
npm run build
npm start
```

### 🐳 Com Docker

```bash
docker-compose up --build
```

## 📌 Status

Projeto em desenvolvimento — frontend da plataforma JudiTech.

## 👤 Autor

**Paulo Henrique Ferreira Dias** — [LinkedIn](https://www.linkedin.com/in/phdias-ti)
