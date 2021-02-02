'use strict';

const {src, dest} = require('gulp');
const gulp = require('gulp');
const webpack = require('webpack-stream');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

sass.compiler = require('node-sass');

const srcPath = 'src/',
      distPath = 'dist/';
      
const path = {
    build: {
        html:   distPath,
        js:     distPath + "js/",
        css:    distPath + "assets/css/",
        img:    distPath + "assets/img/",
        fonts:  distPath + "assets/fonts/"
    },
    src: {
        html:   srcPath + "index.html",
        js:     srcPath + "js/script.js",
        css:    srcPath + "assets/scss/style.scss",
        img:    srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html:   srcPath + "**/*.html",
        js:     srcPath + "js/**/*.js",
        css:    srcPath + "assets/scss/**/*.scss",
        img:    srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
};

function clean() {
    return del(path.clean);
}

function sync() {
    browserSync.init({
        server: {
            baseDir: './' + distPath
        }
    });
}

let isDev = true;
let webpackConfig = {
    mode: isDev ? 'development' : 'production',
    output: {
        filename: 'script.min.js'
    },
    devtool: isDev ? "source-map" : "none",
    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      }
};

function js() {
    return src(path.src.js)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
          }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function css() {
    return src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

function img() {
    return src(path.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 85, progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream());
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));
}

function watchFiles() {
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.css, css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], img);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(js, img, fonts, html, css));
const watch = gulp.parallel(build, sync, watchFiles);

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;