import gulp from 'gulp';
import javascriptObfuscator from 'gulp-javascript-obfuscator';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import rollup from 'gulp-better-rollup';
import commonjs from 'rollup-plugin-commonjs';
import zip from 'gulp-zip';
import merge from 'merge-stream';
import del from 'del';


const deployFolder = 'trender-server-zip';

gulp.task('scripts_models', () => {
    return gulp.src(['models/**/*.js'])
        .pipe(javascriptObfuscator())
        .pipe(gulp.dest('dist/models'));
});

gulp.task('scripts_routes', () => {
    return gulp.src(['routes/**/*.js'])
        .pipe(javascriptObfuscator())
        .pipe(gulp.dest('dist/routes'));
});

gulp.task('copy_files', () => {
    return gulp.src(['./**/*', '!./routes', '!./routes/**/*', '!./models', '!./models/**/*', '!./.env',
        '!./.editorconfig', '!./.git', '!./.git/**/*',
        '!./.eslintignore', '!./.eslintrc', '!./.gitignore', '!./dist', '!./dist/**/*', '!./env',
        '!./node_modules', '!./node_modules/**', '!./gulpfile.js', './.npmrc'])
        .pipe(gulp.dest('dist'))
});

gulp.task('copy_ebextensions', () => {
    return gulp.src(['./.ebextensions/**'])
        .pipe(gulp.dest('dist/.ebextensions'))
});

gulp.task('test_concat', () => {
    return gulp.src(['models/Category.js', 'models/Request.js'])
        .pipe(concat('test_concat.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('test_bro', () => {
    return gulp.src('routes/index.js')
        .pipe(rollup({
            plugins: [
                commonjs()
            ],
            external: [
                'keystone',
                'aws-sdk'
            ]
        }, {
            format: 'cjs'
        }))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('zip_dist', () => {
    const stream1 = gulp.src(['dist/**', 'dist/.npmrc']);
    const stream2 = gulp.src(['dist/.ebextensions/**'], {
        base: 'dist'
    });
    return merge(stream1, stream2)
        .pipe(zip('trender_archive.zip'))
        .pipe(gulp.dest(deployFolder));
});

gulp.task('clean', () => {
    return del(['dist/*', deployFolder + '/*'], {
        force: true
    });
});

gulp.task('default', gulp.series('clean', 'scripts_models', 'scripts_routes', 'copy_files', 'copy_ebextensions', 'zip_dist'));
