<template>
  <div class="editor">
    <button @click="saveFile">Save file</button>
    <div class="table">
      <div class="row header">
        <div class="column">String ID</div>
        <div class="column">Text</div>
      </div>
      <div class="row" v-for="entry in text.textEntries" :key="entry.id">
        <div class="column" :class="{ wrong: !entry.isValid }">
          {{ entry.id }}
        </div>
        <div class="column">
          <textarea v-model="entry.text" @focusout="trim(entry)"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DLTextFile } from "@/utils/DLText";
export default {
  props: {
    text: DLTextFile,
  },
  methods: {
    saveFile() {
      this.$emit("save");
    },
    trim(entry) {
      entry.text = entry.text.trim();
    },
  },
  name: "EditorComponent",
};
</script>

<style scoped>
@keyframes blink {
  from {
    color: var(--color-text);
  }
  to {
    color: red;
  }
}

.editor {
  margin-top: 25px;
}

.table {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.row {
  display: flex;
}

.row > .column:first-child {
  width: 100px;
}

.row > .column:last-child {
  flex-grow: 1;
}

textarea {
  width: 100%;
}

.wrong {
  animation: 0.15s ease-in-out 0s 4 alternate both blink;
}
</style>
