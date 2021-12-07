<template>
  <div class="view">
    <div class="view-title">Dataset</div>
    <div id="dataset-select">
      <a-select
        placeholder="Select Example Data"
        style="width: 100%"
        :allowClear="true"
        @change="loadExampleData"
      >
        <a-select-option
          v-for="data in EXAMPLE_DATA"
          :key="data.id"
          :value="data.id"
        >
          {{ data.name }}
        </a-select-option>
      </a-select>
    </div>
    <div id="dataset-text">
      <a-textarea v-model="rawData" placeholder="Data" :rows="16" />
      <div id="extract">
        <a-button :loading="loading" @click="extract">Extract</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { EXAMPLE_DATA } from "@/CONSTANT";

export default {
  name: "DatasetView",
  data() {
    return {
      rawData: "",
      loading: false,
    };
  },
  computed: {
    EXAMPLE_DATA() {
      return EXAMPLE_DATA;
    },
  },
  methods: {
    ...mapActions(["extractRelationFromRawData"]),
    async loadExampleData(id) {
      const data = this.EXAMPLE_DATA.find((data) => data.id === id);
      if (data) {
        const resp = await fetch(data.url);
        if (resp.ok) this.rawData = await resp.text();
        else throw new Error(resp.statusText);
      } else this.rawData = "";
    },
    async extract() {
      this.loading = true;
      await this.extractRelationFromRawData(this.rawData);
      this.loading = false;
    },
  },
};
</script>

<style scoped>
#dataset-select {
  margin: 15px 0;
}

#dataset-text {
  margin: 15px 0;
  position: relative;
}

textarea {
  resize: none;
  scrollbar-width: none; /* Firefox */
}

.ant-input::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

#extract {
  position: absolute;
  right: 0px;
  bottom: 0px;
}
</style>
