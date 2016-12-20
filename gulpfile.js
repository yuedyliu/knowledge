var gulp = require('gulp'),
    less = require('gulp-less'),
    fs = require('fs'),
    path = require('path'),
    merge = require('merge-stream'),
    concat = require('gulp-concat'),
// rename = require('gulp-rename');
// uglify = require('gulp-uglify');
    plumber = require('gulp-plumber'),
    connect = require('gulp-connect'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    tmod = require('gulp-tmod');

var scriptPath = 'page',
    componentsPath = 'components';


//获取子文件夹
function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

//模板编译
gulp.task('template', ['css'], function () {
    var folders = getFolders(scriptPath);
    var tasks = folders.map(function (folder) {
        //console.log(path.join(scriptPath, folder, '/tpl/*.js'));
        return gulp.src(scriptPath + "/" + folder + "/tpl/*.html")
            .pipe(plumber())
            .pipe(tmod({
                templateBase: 'page/'
            }))
            .pipe(gulp.dest('dist/' + folder + '/tpl'));
    });
    return merge(tasks);
})

gulp.task('script', ['template'], function () {
    var folders = getFolders(scriptPath);
    var tasks = folders.map(function (folder) {
        return gulp.src([
            './components/global/api.js',
            path.join(scriptPath, folder, '/*.js'),
            'dist/'+folder+'/tpl/*.js'
        ])
            .pipe(concat('index.js'))
            .pipe(gulp.dest('dist/' + folder));
    });
    return merge(tasks);
});

gulp.task('css', ['clean'], function () {
    var folders = getFolders(scriptPath);
    var tasks = folders.map(function (folder) {
        return gulp.src(path.join(scriptPath, folder, '/*.less'))
            .pipe(less())
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(gulp.dest('dist/' + folder));

    });
    return merge(tasks);
});

gulp.task('html', ['clean'], function () {
    var folders = getFolders(scriptPath);
    var tasks = folders.map(function (folder) {
        return gulp.src(path.join(scriptPath, folder, '/*.html'))
            .pipe(gulp.dest('dist/' + folder));
    });
    return merge(tasks);
});

gulp.task('lib', ['clean'], function () {
    return gulp.src('components/lib/**/*')
        .pipe(gulp.dest('dist/lib'));
});

//监听改变的文件
gulp.task('watch', ['clean'], function () {
    return gulp.watch([
        'components/global/*',
        'page/**/*'
    ], [
        'clean', 'script', 'css', 'html', 'lib'
    ])
});

//  清除dist
gulp.task('clean', function (cb) {
    return del(['dist/**'], cb);

});

//起server
gulp.task('connect', ['clean'], function () {
    connect.server({
        root: 'dist',
        port: 3000
    });
});

gulp.task('default', ['connect', 'clean', 'template', 'script', 'css', 'html', 'lib', 'watch']);