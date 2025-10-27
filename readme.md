# Live Inventory Plugin

Images from:
https://ingress.fandom.com/wiki/Item_Images

----

#### Convert images

Convert from webp to jpg

```shell
# bash
for f in *.webp; do magick "$f" "${f%.webp}.png"; done
```
```shell
# fish
for f in *.webp; magick "$f" (string replace .webp .png "$f"); end
```

Resize png images to `ico` dir
```shell
magick mogrify -path ico -resize 64x64 *.png
```