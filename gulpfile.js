const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json", { declaration: true });
const del = require("del")
const merge = require("merge")

gulp.task("cleanDist", function () {
    return del('dist/**/*')
})

gulp.task("build", ["cleanDist"], function () {
    let tsResult = gulp.src("src/**/*.ts")
        .pipe(tsProject())
    return merge([
        tsResult.js
            .pipe(gulp.dest('dist')),
        tsResult.dts
            .pipe(gulp.dest('dist/definitions'))
    ])
});