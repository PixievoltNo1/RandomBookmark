var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var fileUrl = require('file-url');
var del = require('del');

var sassSrc = ["./WebExtension/**/*.scss"];
function compileSass() {
	return gulp.src(sassSrc, {base: "./WebExtension/"})
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write('./', {
			includeContent: false,
			sourceMappingURLPrefix: fileUrl("WebExtension/build"),
			destPath: "./WebExtension/build/"
		}))
		.pipe(gulp.dest("./WebExtension/build/"));
}

gulp.task("build", gulp.parallel(compileSass));
gulp.task("watch", gulp.series("build", function watchSass() {
	gulp.watch(sassSrc, compileSass);
}));
gulp.task("makeRelease", gulp.series(
	function delRelease() {
		return del("release");
	},
	gulp.parallel(
		function copyNonBuilt() {
			var srcForWebpack = [
				"./WebExtension/**/*.module.js",
				"./WebExtension/**/svelteComponents{,/**/*}"
			];
			var exclusions = ["./WebExtension/build/**/*", ...sassSrc, ...srcForWebpack]
				.map((excludeMe) => { return "!" + excludeMe; });
			return gulp.src(["./WebExtension/**/*", ...exclusions])
				.pipe(gulp.dest("./release/"));
		},
		function compileSassForRelease() {
			return gulp.src(sassSrc)
				.pipe(sass())
				.pipe(gulp.dest("./release/build/"));
		}
	)
));