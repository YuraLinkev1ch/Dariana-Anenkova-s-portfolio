const {src, dest, parallel, series, watch} = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglifyEs = require('gulp-uglify-es').default;
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');
const sourcemaps = require('gulp-sourcemaps');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const revDel = require('gulp-rev-delete-original');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const notify = require('gulp-notify');
const image = require('gulp-image');
const { readFileSync } = require('fs');
const concat = require('gulp-concat');
const pug = require('gulp-pug');
const pugLinter = require('gulp-pug-linter');
const gulpStylelint = require('gulp-stylelint');

let isProd = false; // dev by default

const clean = () => {
	return del(['./docs/*'])
}

//svg sprite
const svgSprites = () => {
  return src('./src/img/svg/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg" //sprite file name
        }
      },
    }))
    .pipe(dest('./docs/img'));
}

const pug2html = () => {
  return src('./src/*.pug')
    .pipe(pugLinter({ reporter: 'default' }))
    .pipe(pug({pretty: true}))
    .pipe(dest('./docs'))
    .pipe(browserSync.stream());
}

const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(gulpStylelint({
      failAfterError: false,
      reporters: [
        {
          formatter: 'string',
          console: true
        }
      ]
    }))
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(sass().on("error", notify.onError()))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false,
    }))
    .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('./docs/css/'))
    .pipe(browserSync.stream());
};

const stylesBackend = () => {
	return src('./src/scss/**/*.scss')
		.pipe(sass().on("error", notify.onError()))
    .pipe(autoprefixer({
      cascade: false,
		}))
		.pipe(dest('./docs/css/'))
};

const scripts = () => {
	src('./src/js/vendor/**.js')
		.pipe(concat('vendor.js'))
		.pipe(gulpif(isProd, uglifyEs().on("error", notify.onError())))
		.pipe(dest('./docs/js/'))
  return src(
    ['./src/js/main.js'])
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(gulpif(isProd, uglifyEs().on("error", notify.onError())))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('./docs/js'))
    .pipe(browserSync.stream());
}

const scriptsBackend = () => {
	src('./src/js/vendor/**.js')
    .pipe(concat('vendor.js'))
    .pipe(gulpif(isProd, uglifyEs().on("error", notify.onError())))
		.pipe(dest('./docs/js/'))
	return src(['./src/js/functions/**.js', './src/js/components/**.js', './src/js/main.js'])
    .pipe(dest('./docs/js'))
};

const resources = () => {
  return src('./src/resources/**')
    .pipe(dest('./docs/resources'))
}

const fonts = () => {
  return src('./src/fonts/**')
    .pipe(dest('./docs/fonts'))
}

const images = () => {
  return src(['./src/img/**'])
    .pipe(gulpif(isProd, image()))
    .pipe(dest('./docs/img'))
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./docs"
    },
  });

  watch('./src/scss/**/*.scss', styles);
  watch('./src/js/**/*.js', scripts);
  watch('./src/resources/**', resources);
  watch('./src/img/*.{jpg,jpeg,png,svg}', images);
  watch('./src/img/svg/**.svg', svgSprites);
  watch('./src/*.pug', pug2html);
  watch('./src/pug-partials/**/*.pug', pug2html);
}

const cache = () => {
  return src('docs/**/*.{css,js,svg,png,jpg,jpeg,woff2,woff}', {
    base: './docs'})
    .pipe(rev())
    .pipe(dest('./docs'))
    .pipe(revDel())
    .pipe(rev.manifest('rev.json'))
    .pipe(dest('./docs'));
};

const rewrite = () => {
  const manifest = readFileSync('./docs/rev.json');

  return src('./docs/**/*.html')
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest('./docs'));
}

const htmlMinify = () => {
	return src('./docs/**/*.html')
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(dest('./docs'));
}

const toProd = (done) => {
  isProd = true;
  done();
};

exports.default = series(clean, pug2html, scripts, styles, fonts, resources, images, svgSprites, watchFiles);

exports.build = series(toProd, fonts, clean, pug2html, scripts, styles, fonts, resources, images, svgSprites, htmlMinify);

exports.cache = series(cache, rewrite);

exports.backend = series(toProd, fonts, clean, pug2html, scriptsBackend, stylesBackend, fonts, resources, images, svgSprites);
