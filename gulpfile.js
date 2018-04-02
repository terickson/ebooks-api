/***
***Commands***
--gulp watch: to compile code and start the node process with a watch on changes to the code
--gulp: to compile code and get ready for deployment
***/

var gulp = require('gulp'),
ts = require('gulp-typescript'),
merge = require('merge2'),
clean = require('gulp-clean'),
runSequence = require('run-sequence'),
tsProject = ts.createProject('tsconfig.json'),
spawn = require('child_process').spawn, node;

gulp.task('clean', function(){
  return gulp.src('release', {read: false})
    .pipe(clean());
})

gulp.task('compile', ['clean'], function() {
    var tsResult = gulp.src([
        "./src/**/*.ts",
        "./custom-typings/**/*.d.ts",
        "./node_modules/@types/**/*.d.ts"
    ]).pipe(tsProject());

	return merge([ // Merge output streams if nesissary
    tsResult.js.pipe(gulp.dest('release'))
	]);
});

gulp.task('server', ['compile'], function() {
  if (node) node.kill()
  node = spawn('node', ['release/server.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

gulp.task('watch', ['server'], function() {
    gulp.watch(['./src/**/*.ts', './lib/**/*.js'], ['server']);
});

gulp.task('default', function() {
   runSequence( 'compile');
});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})
