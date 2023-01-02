<template>
  <div class="editor">
    <button @click="saveFile">Save file</button>
    <div class="table">
      <div class="row header">
        <div class="column">String ID</div>
        <div class="column">Text</div>
      </div>
      <div class="row" v-for="entry in text.textEntries" :key="entry.id" :id="entry.id">
        <div class="column">
          <div class="string-id" :class="{ wrong: !entry.isValid, marked: entry.marked }">
            {{ entry.id }}
          </div>
          <div class="actions">
            <span title="Toggle text capitalisation" class="clickable" @click="toggleCapitalization(entry)">Aa</span>
            <span title="Replace all occurrences of this string" class="clickable" @click="replaceOccurrences(entry)">
              🔍
            </span>
            <span title="Mark this entry for reference" class="clickable" @click="markEntry(entry)">✅</span>
          </div>
        </div>
        <div class="column">
          <textarea v-model="entry.text"></textarea>
          <div class="char-count">{{ entry.text.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DLTextFile, ansiRegex } from "@/utils/DLText";
export default {
  props: {
    text: DLTextFile,
  },
  emits: ["save", "replace"],
  methods: {
    saveFile() {
      this.$emit("save");
    },
    toggleCapitalization(textEntry) {
      if (textEntry.text.toUpperCase() === textEntry.text) {
        textEntry.text = textEntry.text.toLowerCase();
        textEntry.text = textEntry.text
          .split(" ")
          .map((word) => word[0].toUpperCase() + word.substring(1))
          .join(" ");
      } else {
        textEntry.text = textEntry.text.toUpperCase();
      }
    },
    replaceOccurrences(textEntry) {
      const occurrenceIndices = [];
      const occurrenceIDs = [];
      for (const textEntriesKey in this.text.textEntries) {
        if (this.text.textEntries[textEntriesKey].text === textEntry.text) {
          occurrenceIndices.push(textEntriesKey);
          occurrenceIDs.push(this.text.textEntries[textEntriesKey].id);
        }
      }
      const replaceWith = prompt(
        `Found ${occurrenceIndices.length} occurrences of "${textEntry.text}", replace them with what text?`
      );

      if (!replaceWith) {
        return;
      }

      if (!ansiRegex.test(replaceWith)) {
        alert("Value is invalid. The value is empty or is not ANSI-compatible.");
        return;
      }

      if (
        !confirm(
          `This will replace entries ${occurrenceIDs}. Are you sure you want to replace them all with "${replaceWith}"?`
        )
      ) {
        return;
      }

      this.$emit("replace", { indices: occurrenceIndices, replaceWith });
    },
    markEntry(textEntry) {
      textEntry.marked = !textEntry.marked;
      console.log(textEntry);
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
  margin-bottom: 10px;
}

.row > .column:first-child {
  width: 100px;
}

.row > .column:last-child {
  flex-grow: 1;
}

textarea {
  width: 100%;
  resize: vertical;
}

.wrong {
  animation: 0.15s ease-in-out 0s 4 alternate both blink;
}

.marked {
  color: limegreen;
}

.clickable {
  cursor: pointer;
  color: aqua;
  user-select: none;
  margin-right: 5px;
}

.char-count {
  font-size: 10px;
}

.string-id {
  transition: color 0.2s;
}

* {
  line-height: 1.1;
}
</style>
