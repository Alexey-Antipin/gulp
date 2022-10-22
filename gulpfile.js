const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const newer = require("gulp-newer");
const gulppug = require("gulp-pug");
const browsersync = require("browser-sync").create();
const del = require("del");

const paths = {
  pug: {
    src: "src/*.pug",
    dest: "dist",
  },
  pugmodule: {
    modules: "src/modules/**/*.pug",
    components: "src/components/**/*.pug",
  },
  styles: {
    src: [
      "src/styles/**/*.scss",
      "src/modules/**/*.scss",
      "src/components/**/*.scss",
    ],
    dest: "dist/css/",
  },
  scripts: {
    src: ["src/scripts/**/*.ts", "src/scripts/**/*.js"],
    dest: "dist/js/",
  },
  images: {
    src: "src/img/**",
    dest: "dist/img/",
  },
};

function clean() {
  return del(["dist/*", "!dist/img"]);
}

function pug() {
  return gulp
    .src(paths.pug.src)
    .pipe(gulppug())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browsersync.stream());
}

function pugblocks() {
  return gulp
    .src([paths.pugmodule.modules, paths.pugmodule.components])
    .pipe(gulppug())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(browsersync.stream());
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(
      rename({
        basename: "style",
        suffix: ".min",
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browsersync.stream());
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream());
}

function img() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin({
        progressive: true,
      })
    )
    .pipe(gulp.dest(paths.images.dest));
}

function watch() {
  browsersync.init({
    server: {
      baseDir: "./dist/",
    },
  });
  gulp.watch(paths.pug.src).on("change", browsersync.reload);
  gulp.watch(
    [paths.pugmodule.modules, paths.pugmodule.components],
    pug
  );
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
}

exports.clean = clean;
exports.pug = pug;
exports.pugblocks = pugblocks;
exports.styles = styles;
exports.scripts = scripts;
exports.img = img;
exports.watch = watch;

exports.default = gulp.series(
  clean,
  pug,
  pugblocks,
  gulp.parallel(styles, scripts, img),
  watch
);
