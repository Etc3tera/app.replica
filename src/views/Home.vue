<template>
  <v-container>
    <v-layout wrap>
      <v-flex xs12>
        <v-tabs 
          v-model="activeTab"
          color="cyan" 
          dark 
          slider-color="yellow"
        >
          <v-tab>Single Folder</v-tab>
          <v-tab>Multiple Folders</v-tab>
          <!-- Single Dir -->
          <v-tab-item>
            <v-layout wrap>
              <v-flex xs6 class="pt-2">
                <v-text-field
                  v-model="selectedDir.sourceDir"
                  label="Source Directory"
                  box
                  hide-details
                  readonly
                ></v-text-field>
                <v-btn class="ml-0" color="info" @click="selectDir('source')">Browse...</v-btn>
              </v-flex>
              <v-flex xs6 class="pt-2 pl-2">
                <v-text-field
                  v-model="selectedDir.targetDir"
                  label="Target Directory"
                  box
                  hide-details
                  readonly
                ></v-text-field>
                <v-btn class="ml-0" color="info" @click="selectDir('target')">Browse...</v-btn>
              </v-flex>
              <v-flex xs12>
                <v-btn color="success" class="ml-0" :disabled="selectedDir.sourceDir === '' || selectedDir.targetDir === ''" @click="compareDir()">Compare</v-btn>
              </v-flex>
            </v-layout>
          </v-tab-item>
          <!-- Multiple Dir -->
          <v-tab-item>
            <div>
              <v-btn color="info" @click="selectFile()" class="ma-0">Browse for Script File...</v-btn>
              <v-btn 
                color="success" 
                :disabled="previewResults.length == 0 || previewResults.every(e => e.hasFinished)" 
                @click="syncAll()">
                Sync All
              </v-btn>
            </div>
          </v-tab-item>
        </v-tabs>
        
      </v-flex>
      <v-flex xs12 v-for="r in previewResults" v-bind:key="r.id" class="mt-2">
        <v-card v-bind:class="{ syncing: r.syncing, finished: r.hasFinished }">
          <v-card-title>
            <div>
              <p class="mb-0">
                <strong>Source: </strong>{{ r.data.sourcePath }}<br>
                <strong>Target: </strong>{{ r.data.targetPath }}<br>
                <span class="white--text green darken-1">
                  {{ r.data.add.length }} Addition
                </span> 
                &nbsp;with 
                <span class="white--text red darken-1">
                  {{ r.data.delete.length }} Deletion
                </span>
                <span 
                  class="link blue--text text--lighten-1 ml-3" 
                  @click="r.showDetail()" 
                  v-show="!r.hasFinished">
                  {{ r.hasShowDetail ? 'Hide' : 'Show' }} Detail
                </span>
              </p>
              <div v-if="r.hasShowDetail" class="mt-2">
                <ul class="file-table">
                  <li v-for="(item, index) in r.data.add"
                    :key="index" class="add">
                    <span>{{ item }}</span>
                  </li>
                </ul>
                <ul class="file-table">
                  <li v-for="(item, index) in r.data.delete"
                    :key="index" class="delete">
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <v-btn small color="success" class="ma-0 mt-2" @click="r.sync()" v-show="!r.hasFinished">
                  <v-icon small left dark>sync</v-icon>
                  Sync
                </v-btn>
              </div>
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  const { dialog } = require('electron').remote
  import core from '../modules/core'
  
  function newCompareResult(result, index) {
    return {
      id: index,
      data: result,
      hasShowDetail: false,
      syncing: false,
      hasFinished: result.add.length === 0 && result.delete.length === 0,
      showDetail: function() {
        this.hasShowDetail = !this.hasShowDetail
      },
      sync: function() {            
        this.syncing = true
        core.sync(this.data.sourcePath, this.data.targetPath).then(() => {
          this.hasFinished = true
        })
        .catch(err => {
          alert(err)
        }).finally(() => {
          this.syncing = false
        })
      }
    }
  }

  export default {
    data() {
      return {
        previewResults: [],
        selectedDir: {
          sourceDir: '',
          targetDir: ''
        },
        activeTab: 0
      }
    },
    components: {
    },
    methods: {
      selectFile: function() {
        const filePath = dialog.showOpenDialog({
          title: 'Select script file',
          properties: ['openFile']
        })
        if (filePath && filePath.length > 0) {
          try {
            this.previewResults = core.processScript(filePath[0]).map((r, idx) => newCompareResult(r, idx))
          } catch (err) {
            alert(err)
          }
        }
      },
      compareDir: function() {
        this.previewResults = [newCompareResult(core.compare(this.selectedDir.sourceDir, this.selectedDir.targetDir), 0)]
      },
      syncAll: function() {
        this.previewResults.forEach(vm => {
          vm.sync()
        })
      },
      selectDir: function(mode) {
        const path = dialog.showOpenDialog({
          title: 'Select Directory',
          properties: ['openDirectory']
        })
        if (path && path.length > 0) {
          if (mode === 'source')
            this.selectedDir.sourceDir = path[0]
          else
            this.selectedDir.targetDir = path[0]
        }
      }
    }
  }
</script>

<style scoped>
span.link {
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
}
.syncing {
  opacity: 0.2;
}
.finished {
  background: #f2ffe9;
}
.file-table {
  list-style: none;
}
.file-table li {
  padding-left: 20px;
  line-height: 16px;
  margin-top: 2px;
}
.file-table li.add {
  background: url('/plus.png') no-repeat;
}
.file-table li.delete {
  background: url('/delete.png') no-repeat;
}
</style>
