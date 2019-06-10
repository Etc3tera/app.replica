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
        <compare-result v-bind:result="r.data" @sync="onSync(r.data)"></compare-result>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  const { dialog } = require('electron').remote
  import CompareResult from '../components/CompareResult'
  import core from '../modules/core'
  import delay from 'delay'
  
  function newCompareResult(result, index) {
    return {
      id: index,
      data: Object.assign(result, { syncing: false })
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
        activeTab: 1
      }
    },
    components: {
      CompareResult
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
      async onSync(vm) {
        vm.syncing = true
        await delay(250)
        core.sync(vm.sourcePath, vm.targetPath).then(() => {
          vm.add = []
          vm.delete = []
        })
        .catch(err => {
          alert(err)
        }).finally(() => {
          vm.syncing = false
        })
      },
      syncAll: function() {
        this.previewResults.forEach(e => {
          this.onSync(e.data)
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

</style>
