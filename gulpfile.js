'use strict';

const gulp = require('gulp');
const {series, parallel, watch} = require('gulp');
const del = require('del');
const less = require('gulp-less');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const changed = require('gulp-changed');
const rename = require('gulp-rename');
const cleanHtml = require('gulp-cleanhtml');
const path = require('path'); // 确保引入path模块
// 参数化配置
const isProduction = process.env.NODE_ENV === 'production';
const outputDir = isProduction ? './dist' : './dev';

const paths = {
    static: {
        src: {
            less: ['./src/static/**/*.less', '!./src/static/**/_*.less'],
            sass: ['./src/static/**/*.{scss,sass}', '!./src/static/**/_*.{scss,sass}'],
            css: ['./src/static/**/*.css'],
            scripts: ['./src/static/**/*.js', '!./src/static/**/*.min.js'],
            files: ['./src/static/**/*.{eot,svg,otf,ttf,woff,woff2,json,php,swf,min.js,txt,md,xml}'],
            images: './src/static/**/*.{jpg,jpeg,png,gif}',
            html: './src/static/**/*.{html,tpl}'
        },
        dist: `${outputDir}/static`
    },
    template: {
        src: {
            html: './src/view/**/*.html',
            file: './src/view/**/*.{php,js}'
        },
        dist: `${outputDir}/view`
    }
};

// 清理任务
function cleanStatic() {
    return del([paths.static.dist], {force: true});
}

function cleanTemplate() {
    return del([paths.template.dist], {force: true});
}

// 静态资源处理任务
function buildLess() {
    return gulp.src(paths.static.src.less)
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(isProduction ? cleanCSS() : gulp.dest(paths.static.dist))
        .pipe(gulp.dest(paths.static.dist));
}

function buildSass() {
    return gulp.src(paths.static.src.sass)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(isProduction ? cleanCSS() : gulp.dest(paths.static.dist))
        .pipe(gulp.dest(paths.static.dist));
}

function buildCss() {
    return gulp.src(paths.static.src.css)
        .pipe(isProduction ? cleanCSS() : gulp.dest(paths.static.dist))
        .pipe(gulp.dest(paths.static.dist));
}

function buildScripts() {
    return gulp.src(paths.static.src.scripts)
        .pipe(changed(paths.static.dist))
        .pipe(babel())
        .pipe(isProduction ? uglify({
            output: {
                comments: function (node, comment) {
                    return /@preserve|@license|@cc_on|^\/*!/.test(comment.value);
                }
            }
        }) : gulp.dest(paths.static.dist))
        .pipe(gulp.dest(paths.static.dist));
}

function buildImages() {
    return gulp.src(paths.static.src.images)
        .pipe(changed(paths.static.dist))
        .pipe(gulp.dest(paths.static.dist));
}

function buildFiles() {
    return gulp.src(paths.static.src.files)
        .pipe(changed(paths.static.dist))
        .pipe(gulp.dest(paths.static.dist));
}

function buildStaticHtml() {
    return gulp.src(paths.static.src.html)
        .pipe(changed(paths.static.dist))
        .pipe(cleanHtml())
        .pipe(gulp.dest(paths.static.dist));
}

// 模板文件处理任务
function buildTemplateHtml() {
    return gulp.src(paths.template.src.html)
        .pipe(changed(paths.template.dist))
        .pipe(cleanHtml())
        .pipe(gulp.dest(paths.template.dist));
}

function buildTemplateFile() {
    return gulp.src(paths.template.src.file)
        .pipe(changed(paths.template.dist))
        .pipe(gulp.dest(paths.template.dist));
}

// 监听任务
function watchStatic() {
    watch(paths.static.src.less, buildLess);
    watch(paths.static.src.sass, buildSass);
    watch(paths.static.src.css, buildCss);
    watch(paths.static.src.scripts, buildScripts);
    watch(paths.static.src.images, buildImages);
    watch(paths.static.src.files, buildFiles);
    watch(paths.static.src.html, buildStaticHtml);
}

function watchTemplate() {
    watch(paths.template.src.html, buildTemplateHtml);
    watch(paths.template.src.file, buildTemplateFile);
}

// 默认任务
exports.default = series(
    cleanStatic,
    parallel(buildLess, buildSass, buildCss, buildScripts, buildImages, buildFiles, buildStaticHtml),
    parallel(buildTemplateHtml, buildTemplateFile)
);

// 开发环境任务
exports.dev = series(
    cleanStatic,
    parallel(buildLess, buildSass, buildCss, buildScripts, buildImages, buildFiles, buildStaticHtml),
    parallel(buildTemplateHtml, buildTemplateFile),
    watchStatic,
    watchTemplate
);

// 生产环境任务
exports.prod = series(
    cleanStatic,
    parallel(buildLess, buildSass, buildCss, buildScripts, buildImages, buildFiles, buildStaticHtml),
    parallel(buildTemplateHtml, buildTemplateFile)
);

// 只构建静态资源任务
exports.static = series(
    cleanStatic,
    parallel(buildLess, buildSass, buildCss, buildScripts, buildImages, buildFiles, buildStaticHtml)
);

// 只构建模板任务
exports.template = series(
    cleanTemplate,
    parallel(buildTemplateHtml, buildTemplateFile)
);
