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

## DNS ve yayın

DNS Cloudflare üzerinden yönetilir. Ana site ve `/econ/` arayüzü GitHub Pages üzerinde yayımlanır. Kök alan adı ve `www` için GitHub Pages hedefi `akgularda.github.io` kullanılır.

`arda-edge` Worker’ı `/econ/api/` için DNS çözümlemesini `econ-origin.arda-akgul.com` tüneline yönlendirir ve özgün Host başlığını korur. Bu sayede Windows sunucusunun mevcut yerel tünel kuralları kullanılabilir. Worker kaynak kodu `infra/arda-edge.mjs` dosyasındadır. Sunucu çevrimdışıyken tek kişilik oyun ve ana site Pages’ten çalışır.

## Ekonomi Laboratuvarı

`static/econ/`, [oyun kaynak deposunun](https://github.com/akgularda/ekonomi-laboratuvari) yayımlanabilir arayüzünü içerir. Kaynak commit `static/econ/version.json` içinde kayıtlıdır. Oyunu güncellerken deponun `public/` dosyalarını buraya eşitle ve kaynak commit’i güncelle. Sınıf veritabanı ayrı sunucuda kalır.

## Portfolio content

- Homepage: `layouts/index.html`; navigation: `hugo.toml`.
- Shared editorial styles: `assets/portfolio.css` (combined with the existing stylesheet).
- Writing filters use title, description, and tags; topic, language, and year are reflected in the URL. The archive remains readable without JavaScript. Set `contentlang: "tr"` on Turkish articles.
- Project case studies: `content/projects/`. The economic simulation in `static/econ/` is preserved.
- Publication records: `data/publications.json`. The publication page and Markdown/LLM content use this shared data.
- CV and short biography: `data/cv.json`. Run `python scripts/build_cv.py` (requires ReportLab and Arial on Windows or DejaVu Sans on Linux) after changing the CV data, then commit the regenerated `static/downloads/arda-akgul-cv.pdf`.
- The PR workflow runs Hugo 0.169.0 and both verification scripts before review.

Search SEO validation after a production build: `python scripts/verify-search-seo.py`. The same check runs before deployment; maintain canonical/indexability policy in `layouts/partials/seo-indexable.html`. See `docs/seo/README.md` for Search Console maintenance.
