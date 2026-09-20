# arda-akgul.com

Arda Akgül'ün kişisel sitesi. Hugo ile üretilen statik site, **GitHub Pages** üzerinde yayınlanır.

- Canlı: https://arda-akgul.com
- Kaynak: bu repo (`master` dalı)

## Yayınlama

`master` dalına her push, `.github/workflows/hugo.yaml` ile otomatik build + deploy eder:

```
git add .; git commit -m "..."; git push origin master
```

`Actions` sekmesinden deploy durumunu izleyebilirsiniz. Custom domain (`static/CNAME`) ve HTTPS, repo `Settings > Pages` üzerinden yönetilir.

## Yerel önizleme

Hugo Extended gerekir: https://gohugo.io/installation/

```powershell
hugo server -D
# http://localhost:1313/
```

## Kontroller

```powershell
# SEO/kimlik doğrulaması (önce `hugo` ile build alınmış olmalı)
powershell -ExecutionPolicy Bypass -File scripts\verify-identity-seo.ps1

# Blog içe aktarma doğrulaması
powershell -ExecutionPolicy Bypass -File scripts\verify-blog-import.ps1

# IndexNow bildirimi (sitemap'teki son değişen URL'ler)
powershell -ExecutionPolicy Bypass -File scripts\submit_indexnow.ps1
```

## DNS

Domain Squarespace DNS'te durur (`domains.squarespace.com`):

- `A @` → GitHub Pages IP'leri (`185.199.108.153/.109/.110/.111`)
- `CNAME www` → `akgularda.github.io`
- Mail (MX/TXT/DKIM, Google Workspace) kayıtlarına dokunulmaz.