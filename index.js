#!/usr/bin/env node
let fs = require('fs')
let path = require('path')
let childProcess = require('child_process')
let program = require('commander')

program
  .version('1.0.0')
  .option('-i, --input [DIR]', 'Input directory containing PNG images to copy into an appiconset.')
  .option('-o, --output [DIR]', 'Output directory to create appiconset in.')
  .option('-n, --name [NAME]', 'Name of the appiconset.', 'AppIcon')
  .option('-r, --remove', 'If set removes the appiconset if it already exists. Otherwise errors.')
  .parse(process.argv)

// Show help when no option is specified
if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit()
}

// Validate input
validate(program['input'] != null, 'Input directory must be specified.')
validate(program['output'] != null, 'Output directory must be specified.')
validate(fs.existsSync(program['input']), 'Input directory does not exist.')
validate(fs.existsSync(program['output']), 'Output directory does not exist.')
validate(fs.lstatSync(program['input']).isDirectory(), 'Specified input is not a directory.')
validate(fs.lstatSync(program['output']).isDirectory(), 'Specified output is not a directory.')

// Ensures we have a valid name
let appiconsetExt = '.appiconset'
if (program['name'].endsWith(appiconsetExt)) {
  program['name'] = program['name'].substring(0, -appiconsetExt.length)
}

// Find PNG file paths
let dirContent = fs.readdirSync(program['input'])
let pngFilePaths = dirContent.filter(fileName => {
  return fileName.endsWith('.png')
}).map(fileName => {
  return path.join(program['input'], fileName)
})
// Check if identify command is available
try {
  childProcess.execSync('type -p identify')
} catch {
  console.log('The identify command was not found. Make sure that ImageMagick is installed.')
  process.exit(1)
}
// Create files with sizes
let sizeMap = pngFilePaths.map(filePath => {
  let stdout = childProcess
    .execSync('identify -format \'%w %h\' \'' + filePath + '\'')
    .toString('utf8')
  let sizeComponents = stdout.split(' ')
  return {
    width: sizeComponents[0],
    height: sizeComponents[1],
    filePath: filePath,
    filename: path.parse(filePath).base
  }
})
// Define images we'd like to find.
let desiredImages = [{
  "width": 20,
  "height": 20,
  "idiom": "iphone",
  "scales": [2, 3]
}, {
  "width": 29,
  "height": 29,
  "idiom": "iphone",
  "scales": [2, 3]
}, {
  "width": 40,
  "height": 40,
  "idiom": "iphone",
  "scales": [2, 3]
}, {
  "width": 60,
  "height": 60,
  "idiom": "iphone",
  "scales": [2, 3]
}, {
  "width": 20,
  "height": 20,
  "idiom": "ipad",
  "scales": [1, 2]
}, {
  "width": 29,
  "height": 29,
  "idiom": "ipad",
  "scales": [1, 2]
}, {
  "width": 40,
  "height": 40,
  "idiom": "ipad",
  "scales": [1, 2]
}, {
  "width": 76,
  "height": 76,
  "idiom": "ipad",
  "scales": [1, 2]
}, {
  "width": 83.5,
  "height": 83.5,
  "idiom": "ipad",
  "scales": [2]
}, {
  "width": 1024,
  "height": 1024,
  "idiom": "ios-marketing",
  "scales": [1]
}]
// Find images
let filesToCopy = []
let images = []
for (desiredImage of desiredImages) {
  for (scale of desiredImage.scales) {
    let fittingImage = sizeMap.find(s => {
      return s.width == (desiredImage.width * scale) && s.height == (desiredImage.height * scale)
    })
    if (fittingImage != null) {
      let fileToCopy = filesToCopy.find(f => f == fittingImage.filePath)
      if (!fileToCopy) {
        filesToCopy.push({
          filePath: fittingImage.filePath,
          filename: fittingImage.filename
        })
      }
      images.push({
        "size": desiredImage.width + "x" + desiredImage.height,
        "idiom": desiredImage.idiom,
        "filename": fittingImage.filename,
        "scale": scale + "x"
      })
    }
  }
}
let spec = {
  "images": images,
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
// Create appiconset directory
let appiconsetPath = path.join(program['output'], program['name'] + '.appiconset')
if (fs.existsSync(appiconsetPath)) {
  if (program['remove'] == true) {
    rimraf(appiconsetPath)
  } else {
    console.log(program['name'] + '.appiconset already exists in ' + program['output'] + '.')
    console.log('Specify the --remove option to remove the appiconset.')
    process.exit(1)
  }
}
fs.mkdirSync(appiconsetPath)
// Copy image files into appiconset
for (file of filesToCopy) {
  let dst = path.join(appiconsetPath, file.filename)  
  fs.copyFileSync(file.filePath, dst)
}
// Write Contents.json
let contentsFilePath = path.join(appiconsetPath, 'Contents.json')
fs.writeFileSync(contentsFilePath, JSON.stringify(spec, null, 2))

// Validate input. Exit program if invalid.
function validate(predicate, message) {
  var isSuccess = false
  if (typeof (predicate) == 'function') {
    isSuccess = predicate()
  } else {
    isSuccess = predicate
  }
  if (!isSuccess) {
    console.log(message)
    process.exit()
  }
}

// Remove an entire directory.
// https://stackoverflow.com/a/42505874
function rimraf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function (entry) {
      var entry_path = path.join(dir_path, entry)
      if (fs.lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path)
      } else {
        fs.unlinkSync(entry_path)
      }
    })
    fs.rmdirSync(dir_path)
  }
}