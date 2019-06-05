# Replica

Electron App to sync 2 folders

## Script file format:
Line (i * 2): Full Path to Source Directory of job<sub>i</sub>
Line (i * 2) + 1: Full Path to Target Directory of job<sub>i<sub>

```
C:/Users/Etcetera/Desktop/mytestfolder/source           // Source-0
C:/Users/Etcetera/Desktop/mytestfolder/test/target      // Target-0
C:/Users/Etcetera/Desktop/mytestfolder/source           // Source-1
C:/Users/Etcetera/Desktop/mytestfolder/test2            // Target-1
```

Run this script will mirrored detail of `C:/Users/Etcetera/Desktop/mytestfolder/source` to `C:/Users/Etcetera/Desktop/mytestfolder/test/target` and `C:/Users/Etcetera/Desktop/mytestfolder/test/target`

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

### Run tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```