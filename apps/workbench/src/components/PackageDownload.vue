<script>
import { strToU8, zipSync } from "fflate";

export default {
  name: "PackageDownload",

  props: {
    files: {
      type: Array,
      required: true
    },

    packageName: {
      type: String,
      required: true
    },

    instructions: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      status: "",
      downloading: false
    };
  },

  watch: {
    files: {
      deep: true,
      handler() {
        this.status = "";
      }
    },

    packageName() {
      this.status = "";
    }
  },

  methods: {
    downloadPackage() {
      if (!this.files.length || this.downloading) return;

      this.downloading = true;
      this.status = "";

      const link = document.createElement("a");
      let url;

      try {
        const entries = Object.create(null);
        const filenames = new Set();

        for (const file of this.files) {
          if (
            typeof file.filename !== "string" ||
            !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(file.filename) ||
            file.filename.includes("..") ||
            file.filename.toLowerCase() === "readme.txt"
          ) {
            throw new Error("An export filename is invalid.");
          }

          const normalizedName = file.filename.toLowerCase();

          if (filenames.has(normalizedName)) {
            throw new Error("The export contains duplicate filenames.");
          }

          if (typeof file.source !== "string") {
            throw new Error("An export file has no text source.");
          }

          filenames.add(normalizedName);
          entries[file.filename] = strToU8(file.source);
        }

        const readme = [
          "Component Factory export",
          "",
          this.instructions,
          "",
          "Included source files:",
          ...this.files.map(file => "- " + file.filename),
          "",
          "Keep the included files together so local imports resolve.",
          "Application-specific actions and destinations remain your responsibility.",
          ""
        ].join("\n");

        entries["README.txt"] = strToU8(readme);

        const archive = zipSync(entries, { level: 6 });

        const blob = new Blob([archive], {
          type: "application/zip"
        });

        url = URL.createObjectURL(blob);

        const safeName = this.packageName
          .replace(/[^a-zA-Z0-9_-]/g, "-") || "component-export";

        link.href = url;
        link.download = safeName + ".zip";

        document.body.append(link);
        link.click();

        this.status =
          `Package download requested: ${safeName}.zip`;
      } catch (error) {
        this.status =
          error.message || "Package creation failed.";
      } finally {
        link.remove();

        if (url) {
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        this.downloading = false;
      }
    }
  }
};
</script>

<template>
  <div class="package-download">
    <button
      type="button"
      :disabled="files.length === 0 || downloading"
      @click="downloadPackage"
    >
      {{ downloading ? "Preparing package..." : "Download package (.zip)" }}
    </button>

    <p class="package-status" role="status">
      {{ status }}
    </p>
  </div>
</template>

<style scoped>
.package-download {
  margin-block: 1rem;
}

button {
  max-width: 100%;
  min-height: 44px;
  padding: 0.625rem 1rem;
  border: 1px solid #1d4ed8;
  border-radius: 0.375rem;
  background: #1d4ed8;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

button:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.package-status {
  min-height: 1.5rem;
  overflow-wrap: anywhere;
}
</style>