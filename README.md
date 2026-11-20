# Vice Cover Studio

Vice Cover Studio is a static, offline web app that turns your own photos
into multi-panel GTA-style game cover art: pick a panel layout, drop in one
photo or several, drag and zoom each photo inside its panel, add a bold
cover title, choose a sunset or neon colour grade, and export the finished
cover as a PNG in 1080 x 1080, 1080 x 1350 or 1920 x 1080.

Everything runs in the browser from the files in `app/` — no server, no
uploads, no network calls. Photos are read on your own machine and never
leave it. The cover lettering uses the Anton typeface, bundled under
`app/fonts/` under the SIL Open Font License 1.1.

## Run it

Serve the `app/` folder with any static file server, for example:

    node serve.ts

then open http://localhost:8080 in a desktop browser.

## The bounty

This app is an entry to the make.fun competition
[gta6-cover-art-01](https://make.fun/c/gta6-cover-art-01) — build a GTA 6
cover art maker, judged in the open on make.fun.

![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)
![Vice Cover Studio rank on make.fun](https://make.fun/badge/gta6-cover-art-01/Alf212/vice-cover-studio-4/rank.svg)
![Vice Cover Studio reward on make.fun](https://make.fun/badge/gta6-cover-art-01/Alf212/vice-cover-studio-4/reward.svg)

## Handing it in

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes the dossier the judges read, using the vendored make.fun library:

    mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

## License

MIT — see `LICENSE`.
