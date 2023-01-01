<script>
export default {
  data() {
    return {
      file: null,
      offset: "",
      errors: [],
    };
  },
  emits: ["file-change"],
  methods: {
    emitData() {
      this.errors = [];
      if (!this.file) {
        this.errors.push("Please select a file first.");
      }
      if (!this.offset) {
        this.errors.push("Setting a text block offset is mandatory.");
      } else if ((Number(`0x${this.offset}`) - 0x04) % 8 !== 0) {
        this.errors.push("Offset value is invalid. Metadata length would be non-dividable by 8.");
      }
      if (this.errors.length > 0) {
        return;
      }
      this.$emit("file-change", { file: this.file, offset: Number(`0x${this.offset}`) });
    },
    updateFile(event) {
      this.file = event.target.files[0];
    },
  },
};
</script>

<template>
  <h2 class="title">File loader</h2>

  <p class="info">
    Please start by loading your file here. Then, define the hex offset at which the text block starts.
  </p>

  <div>
    <input type="file" @change="updateFile" />
    <input type="text" v-model="offset" placeholder="Text block hex offset" />
    <p v-for="(error, key) in errors" class="error" v-bind:key="key">
      {{ error }}
    </p>
  </div>
  <button @click="emitData">Import text</button>
</template>

<style scoped>
.error {
  color: red;
}
.title {
  margin-top: 20px;
}
</style>
