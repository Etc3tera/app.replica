var fs = require('fs')
var shell = require('shelljs')

export default {
  processScript: function(scriptPath){
    const rawContent = fs.readFileSync(scriptPath).toString()
    const lines = rawContent.split('\r\n').filter(r => r.length > 0)
    const results = []
    for (let i = 0; i < lines.length; i += 2) {
      const originalFiles = new Set(fs.readdirSync(lines[i]))
      const delList = []
      fs.readdirSync(lines[i + 1]).forEach(file => {
        if (originalFiles.has(file))
          originalFiles.delete(file)
        else 
          delList.push(file)
      })
      const addList = Array.from(originalFiles)

      results.push({
        'id': (i / 2) + 1,
        'sourcePath': lines[i],
        'targetPath': lines[i + 1],
        'add': addList,
        'delete': delList
      })
    }

    return results
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