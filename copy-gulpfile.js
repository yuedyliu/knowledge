/*
 created by sunzongzheng 2016年10月19号
 */

'use strict';
var gulp = require('gulp'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    htmlminify = require("gulp-html-minify"),
    replace = require('gulp-replace-pro'),
    del = require('del'),
    fs = require('fs'),
    path = require('path'),
    merge = require('merge-stream'),
    autoprefixer = require('gulp-autoprefixer'),
    tmodjs = require('gulp-tmod'),
    glob = require("glob"),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon'),
    $ = require('gulp-load-plugins')();

//获取子文件夹
function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}
//获取配置文件数据
function getReplaceConfig() {
    try {
        fs.statSync('./cdn_replace.json', 'utf-8');
        return JSON.parse(fs.readFileSync("./cdn_replace.json", 'utf-8'));
    } catch (e) {
        return [];
    }
}
//获取路径中的文件夹
function getFolder(path) {
    return path.split("/");
}

//目录
var pagePath = "page",
    compoentsPath = "components",
    destPath = "dist";
var folders = glob.sync(pagePath + "/*/*");
var destFolders = glob.sync(destPath + "/*/*");
/*
 开发
 */
{
    //lib文件
    gulp.task('lib-dev', ['clean'], function () {
        var folders = getFolders(compoentsPath);
        var tasks = folders.map(function (folder) {
            return gulp.src([
                compoentsPath + "/public/lib/**/*",
                compoentsPath + "/" + folder + '/lib/**/*'
            ])
                .pipe(gulp.dest(destPath + "/" + folder + "/lib"));
        });
        return merge(tasks);
    });
    //html
    gulp.task('html-dev', ['lib-dev'], function () {

        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src(pagePath + "/" + folder_array[1] + "/" + folder_array[2] + '/index.html')
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]));
        });
        return merge(tasks);
    });
    //反向替换静态文件url
    gulp.task('replace-html-dev', ['html-dev'], function () {
        var config = getReplaceConfig();
        //反转
        for (var key in config) {
            config[config[key]] = key;
            delete config[key];
        }
        var tasks = destFolders.map(function (folder) {
            return gulp.src(folder + '/index.html')
                .pipe(replace(config))
                .pipe(gulp.dest(folder))
        });
        return merge(tasks);
    });
    // css
    gulp.task('less-dev', ['replace-html-dev'], function () {
        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src(pagePath + "/" + folder_array[1] + "/" + folder_array[2] + '/*.less')
                .pipe(plumber(function (error) {
                    console.log(error);
                    this.emit('end');
                }))
                .pipe(less())
                .pipe(autoprefixer({
                    browsers: ['last 10 versions', 'Android >= 4.0'],
                    cascade: true,
                    remove: true
                }))
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]))
        });
        return merge(tasks);
    });
    //模板编译
    gulp.task('templates-dev', ['less-dev'], function () {

        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src([
                compoentsPath + "/" + folder_array[1] + "/global/tpl/*.html",
                compoentsPath + "/" + folder_array[1] + "/" + folder_array[2] + '/tpl/*.html'
            ])
                .pipe(plumber())
                .pipe(tmodjs({
                    templateBase: 'components/'
                }))
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]));
        });
        return merge(tasks);
    });
    // js
    gulp.task('js-dev', ['templates-dev'], function () {

        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src([
                destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/template.js",
                compoentsPath + "/public/global/*.js",
                compoentsPath + "/" + folder_array[1] + "/global/*.js",
                compoentsPath + "/" + folder_array[1] + "/" + folder_array[2] + "/*.js",
                pagePath + "/" + folder_array[1] + "/" + folder_array[2] + "/index.js"
            ])
                .pipe(concat('index.js'))
                .pipe(plumber())
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]))
        });
        return merge(tasks);
    });
    //清除临时文件
    gulp.task('clean-tmp-dev', ['js-dev'], function (cb) {
        return del([
            'dist/public',
            'dist/**/global',
            'dist/**/lib/index.js',
            'dist/**/**/template.js'
        ], cb);
    });
    //only less
    {
        gulp.task('only-less', function () {
            var tasks = folders.map(function (folder) {
                var folder_array = getFolder(folder);
                return gulp.src(pagePath + "/" + folder_array[1] + "/" + folder_array[2] + '/*.less')
                    .pipe(plumber(function (error) {
                        console.log(error);
                        this.emit('end');
                    }))
                    .pipe(less())
                    .pipe(autoprefixer({
                        browsers: ['last 10 versions', 'Android >= 4.0'],
                        cascade: true,
                        remove: true
                    }))
                    .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]))
            });
            return merge(tasks);
        });
    }
    //only js
    {
        gulp.task('only-templates', function () {

            var tasks = folders.map(function (folder) {
                var folder_array = getFolder(folder);
                return gulp.src([
                    compoentsPath + "/" + folder_array[1] + "/global/tpl/*.html",
                    compoentsPath + "/" + folder_array[1] + "/" + folder_array[2] + '/tpl/*.html'
                ])
                    .pipe(plumber())
                    .pipe(tmodjs({
                        templateBase: 'components/'
                    }))
                    .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]));
            });
            return merge(tasks);
        });
        gulp.task('only-js', ['only-templates'], function () {
            var tasks = folders.map(function (folder) {
                var folder_array = getFolder(folder);
                return gulp.src([
                    destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/template.js",
                    compoentsPath + "/public/global/*.js",
                    compoentsPath + "/" + folder_array[1] + "/global/*.js",
                    compoentsPath + "/" + folder_array[1] + "/" + folder_array[2] + "/*.js",
                    pagePath + "/" + folder_array[1] + "/" + folder_array[2] + "/index.js"
                ])
                    .pipe(concat('index.js'))
                    .pipe(plumber())
                    .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]))
            });
            return merge(tasks);
        });
    }
    //only html
    {
        gulp.task('only-move-html', function () {

            var tasks = folders.map(function (folder) {
                var folder_array = getFolder(folder);
                return gulp.src(pagePath + "/" + folder_array[1] + "/" + folder_array[2] + '/index.html')
                    .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]));
            });
            return merge(tasks);
        });
        gulp.task('only-html', ['only-move-html'], function () {
            var config = getReplaceConfig();
            //反转
            for (var key in config) {
                config[config[key]] = key;
                delete config[key];
            }
            var tasks = destFolders.map(function (folder) {
                return gulp.src(folder + '/index.html')
                    .pipe(replace(config))
                    .pipe(gulp.dest(folder))
            });
            return merge(tasks);
        });
    }
}
/*
 发布
 */
{
    //lib文件
    gulp.task('lib-pub', function () {
        var folders = getFolders(compoentsPath);
        var tasks = folders.map(function (folder) {
            return gulp.src([
                compoentsPath + "/public/lib/**/*",
                compoentsPath + "/" + folder + '/lib/**/*'
            ])
                .pipe(gulp.dest(destPath + "/" + folder + "/lib"));
        });
        return merge(tasks);
    });
    //html
    gulp.task('html-pub', ['lib-pub'], function () {
        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src(pagePath + "/" + folder_array[1] + "/" + folder_array[2] + '/index.html')
                .pipe(htmlminify())
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]));
        });
        return merge(tasks);
    });
    //替换静态文件url
    gulp.task('replace-html-pub', ['html-pub'], function () {
        var config = getReplaceConfig();
        var tasks = destFolders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src(folder + '/index.html')
                .pipe(replace(config))
                .pipe(gulp.dest(folder))
        });
        return merge(tasks);
    });
    // css
    gulp.task('less-pub', ['replace-html-pub'], function () {
        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src(pagePath + "/" + folder_array[1] + "/" + folder_array[2] + '/*.less')
                .pipe(less())
                .pipe(autoprefixer({
                    browsers: ['last 10 versions', 'Android >= 4.0'],
                    cascade: true,
                    remove: true
                }))
                .pipe(minifyCSS())
                .pipe(plumber())
                .pipe($.rev())
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]))
                .pipe($.rev.manifest())
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/rev/css"))
        });
        return merge(tasks);
    });
    //hash css
    gulp.task('rev-css', ['less-pub'], function () {
        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src([
                destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/rev/css/*.json",
                destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/index.html"
            ])
                .pipe($.revCollector()) //根据对应关系进行替换
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2])); //输出替换后的问题
        });
        return merge(tasks);
    });
    //模板编译
    gulp.task('templates-pub', ['rev-css'], function () {
        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src([
                compoentsPath + "/" + folder_array[1] + "/global/tpl/*.html",
                compoentsPath + "/" + folder_array[1] + "/" + folder_array[2] + '/tpl/*.html'
            ])
                .pipe(plumber())
                .pipe(tmodjs({
                    templateBase: 'components/'
                }))
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]));
        });
        return merge(tasks);
    });
    // js
    gulp.task('js-pub', ['templates-pub'], function () {
        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src([
                destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/template.js",
                compoentsPath + "/public/global/*.js",
                compoentsPath + "/" + folder_array[1] + "/global/*.js",
                compoentsPath + "/" + folder_array[1] + "/" + folder_array[2] + "/*.js",
                pagePath + "/" + folder_array[1] + "/" + folder_array[2] + "/index.js"
            ])
                .pipe(concat('index.js'))
                .pipe(uglify())
                .pipe(plumber())
                .pipe($.rev())
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2]))
                .pipe($.rev.manifest())
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/rev/js"))
        });
        return merge(tasks);
    });
    //hash js
    gulp.task('rev-js', ['js-pub'], function () {
        var tasks = folders.map(function (folder) {
            var folder_array = getFolder(folder);
            return gulp.src([
                destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/rev/js/*.json",
                destPath + "/" + folder_array[1] + "/" + folder_array[2] + "/index.html"
            ])
                .pipe($.revCollector()) //根据对应关系进行替换
                .pipe(gulp.dest(destPath + "/" + folder_array[1] + "/" + folder_array[2])); //输出替换后的问题
        });
        return merge(tasks);
    });
    //清除临时文件
    gulp.task('clean-tmp-pub', ['rev-js'], function (cb) {
        return del([
            'dist/public',
            'dist/**/global',
            'dist/**/lib/index.js',
            'dist/**/**/template.js',
            'dist/**/**/rev'
        ], cb);
    });
}

gulp.task('browser-sync', ['nodemon'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:3003",
        files: ["dist/**/**/*.*"],
        browser: "google chrome",
        port: 3000
    });
});
gulp.task('nodemon', function (cb) {

    var started = false;

    return nodemon({
        script: 'server.js'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    });
});
//清除dist文件
gulp.task('clean', function (cb) {
    return del(['dist'], cb);
});

gulp.task('watch', ['replace-html-dev', 'less-dev'], function () {
    gulp.watch([
        'components/**/**/*.less',
        'page/**/**/*.less'
    ], [
        'only-less'
    ]);
    gulp.watch([
        'components/**/**/*.js',
        'components/**/**/tpl/*.html',
        'page/**/**/*.js'
    ], [
        'only-js'
    ]);
    gulp.watch([
        'page/**/**/index.html'
    ], [
        'only-html'
    ]);
});

gulp.task('default', ['browser-sync', 'clean-tmp-dev', 'watch']);

gulp.task('publish', ['clean-tmp-pub']);
