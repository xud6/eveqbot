const gulp = require("gulp");
const merge = require('merge2');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json", { declaration: true });
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const mocha = require('gulp-mocha');
const rename = require('gulp-rename');
const install = require("gulp-install");
const jeditor = require("gulp-json-editor");

gulp.task("test", function () {
    return gulp.src("test/**/*.ts")
        .pipe(mocha({ require: ['ts-node/register'] }))
})

gulp.task("cleanDist", function () {
    return del('dist/**/*')
})

function tsbuild() {
    let tsResult = gulp.src("src/**/*.ts")
        .pipe(tsProject())
    return merge([
        tsResult.js
            .pipe(gulp.dest('dist/app')),
        tsResult.dts
            .pipe(gulp.dest('dist/definitions'))
    ])
}

gulp.task("build", gulp.series("cleanDist", tsbuild));

gulp.task("prePublish", gulp.series("test", "build"));

function fRemoveTypeDefinition() {
    return del('dist/definitions')
}

gulp.task("distbuild", gulp.series("build", fRemoveTypeDefinition));
function fCopyPackageConfig() {
    return gulp.src("package.json")
        .pipe(gulp.dest('dist'))
}

function fCopyPackageLock() {
    return gulp.src("package-lock.json")
        .pipe(gulp.dest('dist'))
}

function fInstallPackages() {
    return gulp.src('dist/package.json')
        .pipe(install({ production: true }));
}

function fHidePackageInfoInDist() {
    return gulp.src("package.json")
        .pipe(jeditor(function (json) {
            return {
                name: json.name,
                version: json.version,
                main: "app/service.js",
                scripts:
                {
                    start: "node app/service.js"
                },
                keywords: [ 'ctrlyare' ],
            }
        }))
        .pipe(gulp.dest('dist'))
}

function fCleanupNodeModulesFolder() {
    return del([
        'dist/**/node_modules/**/*.md'
        , 'dist/**/node_modules/**/*.yml'
        , 'dist/**/node_modules/**/*.sh'
        , 'dist/**/node_modules/**/*.h'
        , 'dist/**/node_modules/**/*.c'
        , 'dist/**/node_modules/**/*.cpp'
        , 'dist/**/node_modules/**/*.ts'
        , 'dist/**/node_modules/**/LICENSE'
        , 'dist/**/node_modules/**/LICENSE.*'
        , 'dist/**/node_modules/**/Makefile'
        , 'dist/**/node_modules/**/.travis.yml'
        , 'dist/**/node_modules/**/.jshintrc'
        , 'dist/**/node_modules/**/.npmignore'
        , 'dist/**/node_modules/**/.jshintignore'
        , 'dist/**/node_modules/**/.eslintrc'
        , 'dist/**/node_modules/**/.jscs.json'
        , 'dist/**/node_modules/**/Dockerfile'
        , 'dist/**/node_modules/**/test'
        , 'dist/**/node_modules/**/examples'
        , 'dist/**/node_modules/**/benchmark'
        , 'dist/**/node_modules/**/typings'
        , 'dist/**/node_modules/**/.github'
        , 'dist/**/node_modules/**/.idea'
        , 'dist/**/node_modules/**/.editorconfig'
        , 'dist/**/node_modules/**/.dockerignore'
        , 'dist/package-lock.json'
    ]).then((paths) => {
        console.log(paths)
    })
}

gulp.task("dist", gulp.series("distbuild", fCopyPackageConfig, fCopyPackageLock, fInstallPackages, fHidePackageInfoInDist, fCleanupNodeModulesFolder));

gulp.task("cleanlog", function () {
    return del('*.log').then((paths) => {
        console.log(paths)
    })
})