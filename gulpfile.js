var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var fileUrl = require('file-url');
var del = require('del');
var spawn = require('cross-spawn');

var sassSrc = ["./WebExtension/**/*.scss"];
var sassConfig = { includePaths: ["node_modules"] };
function compileSass() {
	return gulp.src(sassSrc, {base: "./WebExtension/"})
		.pipe(sourcemaps.init())
		.pipe(sass(sassConfig).on('error', sass.logError))
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
				"./WebExtension/**/*.esm.js",
				"./WebExtension/**/*.svelte"
			];
			var exclusions = ["./WebExtension/build/**/*", ...sassSrc, ...srcForWebpack];
			return gulp.src(["./WebExtension/**/*"], {ignore: exclusions, nodir: true})
				.pipe(gulp.dest("./release/"));
		},
		function runWebpack() {
			return spawn("webpack", ["--env.release"], {stdio: "inherit"});
		},
		function compileSassForRelease() {
			return gulp.src(sassSrc)
				.pipe(sass(sassConfig))
				.pipe(gulp.dest("./release/build/"));
		}
	)
));