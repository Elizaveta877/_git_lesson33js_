
import { src, dest, watch, task, series, parallel } from 'gulp'
import gulpSass from 'gulp-sass'
import * as sass from 'sass'
import browserSync from 'browser-sync' 
import cssnano from 'cssnano'
import rename from 'gulp-rename'
import postcss from 'gulp-postcss'
import csscomb from 'gulp-csscomb' 
import autoprefixer from 'autoprefixer'
import mqpacker from 'css-mqpacker' 


const sassCompiler = gulpSass(sass)
const browserSyncInstance = browserSync.create()

const {default: sortCSSmq} = await import('sort-css-media-queries')


const PATH = {
  scssFolder: './assets/scss',
  scssRootFile: './assets/scss/style.scss',
  scssALlFiles: './assets/scss/**/*.scss',
  cssFolder: './assets/css',
  htmlAllFiles: './**/*.html',
  jsAllFiles: './assets/js/**/*.js'

}


const PLUGINS = [
  autoprefixer({ overrideBrowserslist: ['last 5 versions', '> 1%'] }), 
  mqpacker({ sort: sortCSSmq })
]
 
function scssBase() {
return src(PATH.scssRootFile)
.pipe(sassCompiler().on('error', sassCompiler.logError))
.pipe(postcss(PLUGINS))
.pipe(dest(PATH.cssFolder))
.pipe(browserSyncInstance.stream())
}


function scssDev() {
  const postcssPluginsBaseDev = [...PLUGINS]
  postcssPluginsBaseDev.splice(0, 1)
return src(PATH.scssRootFile, { sourcemaps: true })
.pipe(sassCompiler().on('error', sassCompiler.logError))
.pipe(postcss(postcssPluginsBaseDev))
.pipe(dest(PATH.cssFolder,{ sourcemaps: true } ))
.pipe(browserSyncInstance.stream())
}




function scssMin() {
   const minifyPlugins = [cssnano()]
  const postcssPluginsBaseMin = [...PLUGINS, ...minifyPlugins]
return src(PATH.scssRootFile)
.pipe(sassCompiler().on('error', sassCompiler.logError))
.pipe(postcss(postcssPluginsBaseMin))
.pipe(rename({ suffix: '.min' }))
.pipe(dest(PATH.cssFolder))
.pipe(browserSyncInstance.stream())
}

function scssComb() {
 return src(PATH.scssALlFiles)
  .pipe(csscomb('./.csscomb.json'))
  .pipe(dest(PATH.scssFolder))
}


function syncInit() {
  browserSyncInstance.init({
    server: {
      baseDir: './'
    }
  })
}


function watchTasks() {
  syncInit()
watch(PATH.scssALlFiles, series(scssBase, scssMin))
watch(PATH.htmlAllFiles).on('change', browserSyncInstance.reload)
watch(PATH.jsAllFiles).on('change', browserSyncInstance.reload)
}

export const scss = series(scssBase, scssMin)
export const dev = series(scssDev)
export const comb = series(scssComb)
export const min = series(scssMin)
export { watchTasks as watch }

export default watchTasks