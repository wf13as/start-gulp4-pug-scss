"use strict";


import gulp from "gulp";
import autoprefixer from "gulp-autoprefixer";
import cssbeautify from "gulp-cssbeautify";
import removeComments from "gulp-strip-css-comments";
import rename from "gulp-rename";
import sass from "gulp-sass";
import cssnano from "gulp-cssnano";
import rigger from "gulp-rigger";
import uglify from "gulp-uglify";
import plumber from "gulp-plumber";
import imagemin from "gulp-imagemin";
import babel from 'gulp-babel';
import pug from 'gulp-pug';
import del from "del";
import browserSync from "browser-sync";



// Paths to source/build/watch files
//=========================


const paths = {
	build: 'build/',
	fonts: {
		src: 'src/assets/fonts/**/*.*',
		dest: 'build/assets/fonts/'
	},
	images: {
		src: 'src/assets/images/**/*.{jpg,jpeg,png,svg,ico}',
		dest: 'build/assets/img/'
	},
	scripts: {
		src: 'src/assets/js/*.js',
		dest: 'build/assets/js/'
	},
	styles: {
		src: 'src/assets/sass/style.scss',
		w_src: 'src/assets/sass/**/*.scss',
		dest: 'build/assets/css/'
	},
	views: {
		src: 'src/view/*.pug',
		dest: 'build/'
	}
};

function clean() {
	return del(paths.build);
}


function styles () {
	return gulp.src(paths.styles.src)
	.pipe(plumber())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ["last 8 versions"],
		cascade: true
	}))
	.pipe(cssbeautify())
	.pipe(gulp.dest(paths.styles.dest))
	.pipe(cssnano({
		zindex: false,
		discardComments: {
			removeAll: true
		}
	}))
	.pipe(removeComments())
	.pipe(rename("style.min.css"))
	.pipe(gulp.dest(paths.styles.dest))
	.on('end', browserSync.reload)
}

function scripts () {
	return gulp.src(paths.scripts.src, { sourcemaps: true })
	.pipe(babel())
	.pipe(plumber())
	.pipe(rigger())
	.pipe(gulp.dest(paths.scripts.dest))
	.pipe(uglify())
	.pipe(rename("main.min.js"))
	.pipe(gulp.dest(paths.scripts.dest))
	.pipe(browserSync.stream())
}


function fonts () {
	return gulp.src(paths.fonts.src, {since: gulp.lastRun('fonts')})
	.pipe(gulp.dest(paths.fonts.dest))
	.pipe(browserSync.stream())
}

function images () {
	return gulp.src(paths.images.src)
	.pipe(imagemin({
		optimizationLevel: 3,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		interlaced: true
	}))
	.pipe(gulp.dest(paths.images.dest))
	.pipe(browserSync.stream())
}

function views () {
	return gulp.src(paths.views.src)
	.pipe(pug({pretty:true}))
	.pipe(gulp.dest(paths.views.dest))
	.on('end', browserSync.reload)
}

function watchAssets () {
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.styles.w_src, styles);
	gulp.watch(paths.fonts.src, fonts);
	gulp.watch(paths.images.src, images);
	gulp.watch(paths.views.src, views);

	browserSync.init({
		server: {
			baseDir: paths.build
		}
	})
}


exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.fonts = fonts;
exports.images = images;
exports.views = views;
exports.watchAssets = watchAssets;


const build = gulp.series(clean, gulp.parallel(styles, scripts, images, fonts, views));

gulp.task('watch', gulp.series(build, watchAssets));
