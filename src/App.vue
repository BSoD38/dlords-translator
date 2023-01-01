<script setup>
import Header from "./components/HeaderComponent.vue";
import FileLoader from "@/components/FileLoader.vue";
import EditorComponent from "@/components/EditorComponent.vue";
</script>

<script>
import { DLTextFile } from "@/utils/DLText";
import { defineComponent } from "vue";
export default defineComponent({
  data() {
    return {
      dlFile: null,
      parsedFile: null,
      ready: false,
      error: "",
    };
  },
  methods: {
    async handleFile({ file, offset }) {
      if (this.dlFile !== null && !confirm("Do you want to replace the currently loaded file?")) {
        return;
      }
      this.error = "";
      try {
        this.dlFile = file;
        this.parsedFile = new DLTextFile(offset);
        await this.parsedFile.readFile(file);
        window.onbeforeunload = () => "Are you sure you want to leave this page? Unsaved progress will be lost.";
        this.ready = true;
      } catch (e) {
        console.error(e);
        this.error = e.message;
      }
    },
    encode() {
      const url = window.URL.createObjectURL(this.parsedFile.encodeData());

      const link = document.createElement("a");
      link.href = url;
      link.download = this.dlFile.name[0] === "f" ? this.dlFile.name : `f${this.dlFile.name}`;
      link.click();
      link.remove();
    },
  },
});
</script>

<template>
  <div class="app-container">
    <main>
      <Header></Header>
      <FileLoader @file-change="handleFile"></FileLoader>
      <div v-if="error">
        <p>Woops! Something went wrong when parsing the file! Check the console for more details.</p>
        <p class="error">
          {{ error }}
        </p>
      </div>
      <EditorComponent v-if="ready" :text="parsedFile" @save="encode"></EditorComponent>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  background-color: #282828;
  min-height: 100vh;
  overflow-x: hidden;
}
main {
  background-color: var(--color-background);
  max-width: 1400px;
  margin: auto;
  min-height: 100vh;
  padding: 0 25px;
}
.error {
  color: red;
}
</style>
