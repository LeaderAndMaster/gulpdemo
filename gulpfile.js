//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'),
    // 获取 uglify 模块（用于压缩 JS）
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    //获取 clean-css模块(用于压缩css)
    cleancss = require('gulp-clean-css'),
    //获取imagemin模块(用于压缩图片)
    imagemin = require('gulp-imagemin'),
    // 获取autoprefixer模块(用于添加浏览器前缀)
    autoprefixer = require('gulp-autoprefixer'),
    // JS代码检查工具，可以检测JavaScript中错误和潜在问题
    jshint = require('gulp-jshint'),
    // html清理
    htmlmin = require('gulp-htmlmin'),
    //重命名
    rename = require('gulp-rename'),
    //目标目录清理，在用于gulp任务执行前清空目标目录
    clean = require('gulp-clean'),
    //文件拼接，可用于多个CSS文件或多个JS文件的合并
    concat = require('gulp-concat'),
    //任务通知，可用于某项任务执行完成的在控制台输出通知
    notify = require('gulp-notify'),
    //资源缓存处理，可用于缓存已压缩过的资源，如：图片
    cache = require('gulp-cache'),
    //实时更新
    livereload = require('gulp-livereload'),
    // 浏览器同步刷新,借助node模块Browsersync 
    browserSync = require('browser-sync').create(),
    //页面重新加载
    reload = browserSync.reload;
//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options]) 处理完后文件生成路径

/**build**/
// 复制不需要编译的资源
gulp.task('copy', function() {
    gulp.src('static/fonts/*')
        .pipe(gulp.dest('dist/static/fonts'))
});
//html
gulp.task('htmls', function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: false, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        // minifyJS: true,//压缩页面JS
        // minifyCSS: true//压缩页面CSS
    };
    gulp.src('./*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist'));
});

gulp.task('autopre', function() {
    gulp.src('static/css/index.min.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ios 7', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(gulp.dest('dist/css'));
});


// 样式处理任务
gulp.task('styles', function() {
    return gulp.src('src/css/*.css') //引入所有CSS
        .pipe(concat('index.css')) //合并CSS文件
        .pipe(autoprefixer('last 2 version', 'ios 6', 'android >= 4'))
        .pipe(rename({ suffix: '.min' })) //文件重命名
        // .pipe(cleancss())                  //CSS压缩
        .pipe(gulp.dest('dist/static/css')) //压缩版输出
        // .pipe(notify({ message: '样式文件处理完成' }));
});

// JS处理任务
gulp.task('jsmin', function() {
    gulp.src('src/js/*.js') //多个文件以数组形式传入
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('jsconcat', function() {
    // gulp.src(['static/js/libs/layer.js', 'static/js/libs/index.min.js']) //多个文件以数组形式传入
    gulp.src(['src/js/a.js', 'src/js/b.js', 'src/js/c.js']) //多个文件以数组形式传入
        .pipe(concat('abc.js'))
        .pipe(gulp.dest('src/js'));
});


gulp.task('scripts', function() {
    return gulp.src('src/js/*.js') //引入所有需处理的JSs
        .pipe(jshint.reporter('default')) //S代码检查
        .pipe(concat('index.js')) //合并JS文件
        .pipe(rename({ suffix: '.min' })) //重命名
        .pipe(uglify()) //压缩JS
        .pipe(gulp.dest('dist/js')) //压缩版输出
        // .pipe(notify({ message: 'JS文件处理完成' }));
});

// 图片处理任务
gulp.task('images', function() {
    return gulp.src('static/images/*') //引入所有需处理的image
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })) //压缩图片
        // 如果想对变动过的文件进行压缩，则使用下面一句代码
        // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))) 
        .pipe(gulp.dest('dist/static/images'))
        // .pipe(notify({ message: '图片处理完成' }));
});

// 目标目录清理
gulp.task('clean', function() {
    return gulp.src(['dist/static/css', 'dist/static/js', 'dist/static/images'], { read: false })
        .pipe(clean());
});

// 预设任务，执行清理后build
gulp.task('build', ['clean'], function() {
    gulp.start('copy', 'htmls', 'styles', 'scripts', 'images');
});
//把less文件编译成css
gulp.task('less', function() {
    gulp.src('src/css/*.less')
        .pipe(less())
        .pipe(gulp.dest('src/css')); //将会在src/css下生成index.css
});
//browser-sync初始化,创建静态服务器
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(["src/css/*.css", "src/html/*.html"]).on('change', reload);
});
//监听修改,当less文件发生变化的时候，执行less任务
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('src/css/*.less', ['less']);
});