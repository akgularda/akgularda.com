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

`arda-edge` Worker’ı `/econ/api/` isteklerini `econ-origin.arda-akgul.com` üzerinden mevcut sınıf sunucusuna iletir. Bu bağlantı mevcut Windows sunucusunun Cloudflare Tunnel servisini kullanır. Sunucu çevrimdışıyken tek kişilik oyun ve ana site Pages’ten çalışır.

## Ekonomi Laboratuvarı

`static/econ/`, [oyun kaynak deposunun](https://github.com/akgularda/ekonomi-laboratuvari) yayımlanabilir arayüzünü içerir. Kaynak commit `static/econ/version.json` içinde kayıtlıdır. Oyunu güncellerken deponun `public/` dosyalarını buraya eşitle ve kaynak commit’i güncelle. Sınıf veritabanı ayrı sunucuda kalır.
