const gulp = require('gulp');
const mergeJson = require('gulp-merge-json');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

// Build typescript files
gulp.task('tsBuild', () => tsProject.src().pipe(tsProject()).pipe(gulp.dest('build')));

// Merge and move server config
gulp.task('config', () =>
	gulp
		.src(['src/game-server/Config/server.config.default.json', 'server.config.json'], {
			allowEmpty: true,
		})
		.pipe(
			mergeJson({
				fileName: 'server.config.json',
				transform: o => {
					delete o.$schema;
					return o;
				},
			}),
		)
		.pipe(gulp.dest('build/game-server')),
);

// Build once
gulp.task('build', gulp.series('config', 'tsBuild'));
