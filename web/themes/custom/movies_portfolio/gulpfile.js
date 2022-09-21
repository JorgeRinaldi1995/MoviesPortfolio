const gulp = require('gulp')
const gulpif = require('gulp-if')
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps')
const cssnano = require('cssnano')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const postcssInlineSvg = require('postcss-inline-svg')
const browserSync = require('browser-sync').create()
const pxtorem = require('postcss-pxtorem')

const paths = {
  scss: {
    entry: './scss/index.scss',
    dest: './css',
    watch: './scss/**/*.scss',
  },
  js: {
    bootstrap: './node_modules/bootstrap/dist/js/bootstrap.min.js',
    popper: './node_modules/@popperjs/core/dist/umd/popper.min.js',
    dest: './js'
  }
}

function isDevEnv() {
  return process.env.NODE_ENV === 'development'
}

function styles(done) {
  const plugins = [
    postcssInlineSvg({
      removeFill: true,
      paths: ['./node_modules/bootstrap-icons/icons']
    }),
    pxtorem({
			propList: ['*', '!letter-spacing'],
      selectorBlackList: [/^html$/],
      exclude: /node_modules/i
		}),
    autoprefixer(),
    cssnano({
      preset: ['default', {
        discardComments: { removeAll: true }
      }]
    })
  ]

  gulp.src([paths.scss.entry])
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(postcss(plugins))
    .pipe(gulpif(isDevEnv, sourcemaps.write()))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream())

    done()
}

// Move the javascript files into our js folder
function js () {
  return gulp.src([paths.js.bootstrap, paths.js.popper])
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream())
}

function serve() {
  browserSync.init({
    proxy: 'https://movies-portfolio.lndo.site/',
  })

  gulp.watch([paths.scss.watch], styles).on('change', browserSync.reload)
}

// const build = gulp.series(styles, js)
const watch = gulp.series(styles, gulp.parallel(js, serve))

exports.styles = styles
exports.js = js
exports.serve = serve
exports.default = serve