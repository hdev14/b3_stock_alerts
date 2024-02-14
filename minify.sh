echo "Copying CSS files...\n"

cp -rf src/application/public/css/ build/src/application/public/css/

echo "Minifying JS...\n"

npx esbuild build/src/application/public/js/*.js --minify --out-extension:.js=.min.js --outdir=build/src/application/public/js/

echo "Minifying CSS...\n"

npx esbuild build/src/application/public/css/*.css --minify --out-extension:.css=.min.css --outdir=build/src/application/public/css/
