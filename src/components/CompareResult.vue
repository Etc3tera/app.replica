<template>
  <v-card v-bind:class="{ syncing: result.syncing, finished: hasFinished }">
    <v-card-title>
      <div style="width: 100%">
        <p class="mb-0">
          <strong>Source: </strong>{{ result.sourcePath }} <span class="link blue--text text--lighten-1 ml-2" @click="openFolder(result.sourcePath)">(View in Explorer)</span><br>
          <strong>Target: </strong>{{ result.targetPath }} <span class="link blue--text text--lighten-1 ml-2" @click="openFolder(result.targetPath)">(View in Explorer)</span><br>
          <span class="white--text green darken-1">
            {{ result.add.length }} Addition
          </span> 
          &nbsp;with 
          <span class="white--text red darken-1">
            {{ result.delete.length }} Deletion
          </span>
          <span 
            class="link blue--text text--lighten-1 ml-3" 
            @click="showDetail()" 
            v-show="!hasFinished">
            {{ hasShowDetail ? 'Hide' : 'Show' }} Detail
          </span>
        </p>
        <div v-if="hasShowDetail" class="mt-2">
          <ul class="file-table">
            <li v-for="(item, index) in result.add"
              :key="index" class="add">
              <span>{{ item }}</span>
            </li>
          </ul>
          <ul class="file-table">
            <li v-for="(item, index) in result.delete"
              :key="index" class="delete">
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
        <div>
          <v-btn small color="success" class="ma-0 mt-2" @click="sync()" v-show="!hasFinished" :disabled="result.syncing">
            <v-icon small left dark>sync</v-icon>
            Sync
          </v-btn>
        </div>
      </div>
    </v-card-title>
  </v-card>
</template>

<script>
import { shell } from 'electron'

export default {
  data() {
    return {
      hasShowDetail: false
    }
  },
  computed: {
    hasFinished() {
      return this.result.add.length === 0 && this.result.delete.length === 0
    }
  },
  props: ['result'],
  methods: {
    showDetail: function() {
      this.hasShowDetail = !this.hasShowDetail
    },
    sync: function() {            
      this.$emit('sync')
    },
    openFolder(path) {
      shell.openItem(path)
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
