<script>
export default {
  data() {
    return {
      file: null,
      offset: "",
      displayHelp: false,
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
    toggleHelp() {
      this.displayHelp = !this.displayHelp;
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
    <button @click="toggleHelp">Offset help</button>
    <p v-for="(error, key) in errors" class="error" v-bind:key="key">
      {{ error }}
    </p>
  </div>
  <button @click="emitData">Import text</button>
  <div class="offset-help" :class="{ displayed: displayHelp }">
    <p>Here's a list of known text files and their text block hex offsets for Dungeon Lords version C1.5:</p>
    <ul>
      <li>D6STRING.DAT: 4284</li>
      <li>mname.dat: D9C</li>
      <li>iname.dat: 1DA4</li>
      <li>pname.dat: 1184</li>
    </ul>
    <p>
      For other versions or files, use a hex viewer program like HxD to find what offset to use by locating the offset
      of the first string. For example, in version 1.5C, mname.dat starts with "Occult Wizard" at offset 4284.
    </p>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
.offset-help {
  display: none;
}
.offset-help.displayed {
  display: block;
}
.title {
  margin-top: 20px;
}
</style>
