var fs = require('fs')
var shell = require('shelljs')

function compareDirectory(sourcePath, targetPath) {
  const originalFiles = new Set(fs.readdirSync(sourcePath))
  const delList = []
  fs.readdirSync(targetPath).forEach(file => {
    if (originalFiles.has(file))
      originalFiles.delete(file)
    else 
      delList.push(file)
  })
  const addList = Array.from(originalFiles)

  return {
    'sourcePath': sourcePath,
    'targetPath': targetPath,
    'add': addList,
    'delete': delList
  }
}

export default {
  processScript: function(scriptPath){
    const rawContent = fs.readFileSync(scriptPath).toString()
    const lines = rawContent.split('\r\n').filter(r => r.length > 0)
    const results = []
    for (let i = 0; i < lines.length; i += 2) {
      var result = compareDirectory(lines[i], lines[i + 1])
      results.push(result)
    }

    return results
  },
  compare: function(source, target) {
    return compareDirectory(source, target)
  },
  sync: function(source, target) {
    return new Promise(function(resolve, reject){
      try {
        const originalFiles = new Set(fs.readdirSync(source))
        const delList = []
        fs.readdirSync(target).forEach(file => {
          if (originalFiles.has(file))
            originalFiles.delete(file)
          else 
            delList.push(`${target}/${file}`)
        })
        const addList = Array.from(originalFiles).map(f => `${source}/${f}`)

        if (delList.length > 0)
          shell.rm('-rf', delList)
        
        if (addList.length > 0)
          shell.cp('-r', addList, target)

        resolve()
      } catch (err) {
        reject(err)
      }
    })
    
  }
} 