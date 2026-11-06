# Publicação no GitHub

Repositório de destino: https://github.com/Hashzin-0/Avee

O repositório remoto foi verificado e está vazio (sem commits ou arquivos). Para publicar esta versão local, execute na raiz do projeto:

```bash
git init
git add .
git commit -m "chore: migrate Granja to Next.js App Router"
git branch -M main
git remote add origin https://github.com/Hashzin-0/Avee.git
git push -u origin main
```

Não publique `.env` ou credenciais. O `.gitignore` exclui arquivos `.env*`, mantendo apenas `.env.example`.
