import path         from 'path'
import gulp         from 'gulp'
import less         from 'gulp-less'
import livereload   from 'gulp-livereload'
import rename       from 'gulp-rename'
import sourcemaps   from 'gulp-sourcemaps'
import gutil        from 'gulp-util'
import gulpWebpack  from 'gulp-webpack'
import webpack      from 'webpack'

const files = [{
  src: 'scripts/src/field/index.js',
  dest: 'scripts',
  basename: 'acf-audio-video-field'
}, {
  src: 'styles/src/acf-audio-video-field.less',
  dest: 'styles'
}, {
  src: 'scripts/src/edit-field/index.js',
  dest: 'scripts',
  basename: 'acf-audio-video-edit-field'
}, {
  src: 'styles/src/acf-audio-video-edit-field.less',
  dest: 'styles'
}]

files.forEach(file => {
  if (!isScript(file))
    gulp.task(`${file.src}-watch`, () => compile(file, true))
  
  gulp.task(`${file.src}-build`, () => compile(file))
})

gulp.task('watch', () => {
  livereload.listen()

  files.forEach(file =>
    isScript(file)
      ? compile(file, true)
      : gulp.watch(file.src, [`${file.src}-watch`])
  )
})

gulp.task('default',
  files.map(file => `${file.src}-build`)
)

function compile(file, watch = false) {
  if (isScript(file)) {
    const filename = file.basename+(watch ? '' : '.min')+'.js'
    const config = {
      watch,
      module: {
        loaders: [{
          test: /\.(es6|js)$/,
          loader: 'babel-loader'
        }]
      },
      resolve: {
        extensions: ['', '.js', '.jsx', '.es6', '.css', '.scss', '.local']
      },
      output: { filename },
      devtool: 'source-map'
    }

    if (watch)
      gulp.watch(file.dest+'/'+filename, (evt) =>
        livereload.changed(evt.path)
      )
    else
      config.plugins = [new webpack.optimize.UglifyJsPlugin()]

    return gulp.src(file.src)
      .pipe(gulpWebpack(config))
      .on('error', error)
      .pipe(gulp.dest(file.dest))
    
  } else
    return gulp.src(file.src)
      /* not using sourcemaps when watching and livereloading
       * as the .map files cause full browser reload defeating
       * the live css injection
       */
      .pipe(watch ? gutil.noop() : sourcemaps.init())
      .pipe(
        less({
          compress: !watch,
          paths: [path.join(__dirname, 'node_modules')]
        })
      )
      .on('error', error)
      .pipe(watch ? gutil.noop() : rename(path => path.extname = '.min.css'))
      .pipe(watch ? gutil.noop() : sourcemaps.write('.'))
      .pipe(gulp.dest(file.dest))
      .pipe(watch ? livereload() : gutil.noop())
}

function isScript(file) {
  return /\.(es6|js)$/.test(file.src)
}

function error(err) {
  console.error(err.stack || err)
  this.emit('end')
}