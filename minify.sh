echo "Copying pages files...\n"

cp -rf ./src/application/pages/ build/./src/application/pages/
find ./build/src/application/pages -name "*.ts" | xargs rm -r
find ./src/application/public -name "*.png" | xargs -i cp {} ./build/src/application/public/
cp ./src/application/public/favicon.ico ./build/src/application/public/
cp ./src/application/public/site.webmanifest ./build/src/application/public/

echo "Minifying JS...\n"
npx esbuild build/src/application/public/js/*.js --minify --out-extension:.js=.min.js --outdir=build/src/application/public/js/

