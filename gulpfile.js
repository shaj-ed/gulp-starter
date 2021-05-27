// Select Dependencies
const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const minifyJs = require("gulp-terser");
const imagemin = require("gulp-imagemin");
const browsersync = require("browser-sync").create();

// Compile SCSS to CSS task
function compileScss() {
  return src("src/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss([
        autoprefixer("last 2 versions", { grid: "autoplace" }),
        cssnano(),
      ])
    )
    .pipe(dest("dist/css"));
}

// JS minify
function jsMinfy() {
  return src("src/js/*.js").pipe(minifyJs()).pipe(dest("dist/js"));
}

// Optimize Images
function optimizeImg() {
  return src("src/images/*.{jpg, png, svg}")
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}

// Browsersync task
function browserServe(cb) {
  browsersync.init({
    server: {
      baseDir: ".",
    },
  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch
function watchTasks() {
  watch("index.html", browsersyncReload);
  watch(
    ["src/scss/*.scss", "src/js/*.js"],
    series(compileScss, jsMinfy, browsersyncReload)
  );
  watch("src/images/*.{jpg, png, svg}", optimizeImg);
}

// Default gulp
exports.default = series(
  compileScss,
  jsMinfy,
  optimizeImg,
  browserServe,
  watchTasks
);
