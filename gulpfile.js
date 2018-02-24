var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var fileUrl = require('file-url');

var sassSrc = ["./WebExtension/**/*.scss"];
function compileSass() {
	return gulp.src(sassSrc, {base: "./WebExtension/"})
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write('./sourcemaps/', {
			includeContent: false,
			sourceMappingURLPrefix: fileUrl("WebExtension"),
			destPath: "./WebExtension/"
		}))
		.pipe(gulp.dest("./WebExtension/"));
}

gulp.task("build", gulp.parallel(compileSass));
gulp.task("watch", gulp.series("build", function watchSass() {
	gulp.watch(sassSrc, compileSass);
}));