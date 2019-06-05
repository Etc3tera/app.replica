<template>
  <v-container>
    <v-layout wrap>
      <v-flex xs12>
        <v-btn color="info" @click="selectFile()" class="ma-0">Browse for Script File...</v-btn>
        <v-btn 
          color="success" 
          :disabled="previewResults.length == 0 || previewResults.every(e => e.hasFinished)" 
          @click="syncAll()">
          Sync All
        </v-btn>
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

  export default {
    data() {
      return {
        previewResults: []
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
            this.previewResults = core.processScript(filePath[0]).map(r => ({
              data: r,
              hasShowDetail: false,
              syncing: false,
              hasFinished: r.add.length === 0 && r.delete.length === 0,
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
            }))
          } catch (err) {
            alert(err)
          }
        }
      },
      syncAll: function() {
        this.previewResults.forEach(vm => {
          vm.sync()
        })
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
