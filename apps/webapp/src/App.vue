<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { WebSocketHandler } from "./modules/WebSocketHandler";
import LogCard from "./components/LogCard.vue";
import type { Log, SocketMessage } from "@apps/common";

const loggingServer = import.meta.env.VITE_LOGGING_SERVER;
const apiHost = `http://${loggingServer}`;
const webSocketHost = `ws://${loggingServer}`;

const logs = ref<Log[]>([]);
const search = ref("");
const expandedPanels = ref<number[]>([]);

const filteredRecords = computed(() => {
  if (!search.value) {
    return logs.value;
  }
  const searchLowerCase = search.value.toLowerCase();
  return logs.value.filter(
    (log) =>
      JSON.stringify(log.data).toLowerCase().includes(searchLowerCase) ||
      log.timestamp.toLowerCase().includes(searchLowerCase)
  );
});

const reloadData = async () => {
  try {
    const response = await fetch(apiHost);
    if (response.ok) {
      logs.value = await response.json();
      expandedPanels.value = logs.value.map((_, index) => index);
    } else {
      console.error("Failed to fetch logs:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
};

const ws = ref(
  new WebSocketHandler<SocketMessage>({
    host: webSocketHost,
    handleMessage: (message) => {
      switch (message.type) {
        case "newLog":
          logs.value.unshift({
            timestamp: message.timestamp,
            data: message.data,
          });
          const newExpandedPanels = [
            0,
            ...expandedPanels.value.map((i) => i + 1),
          ];
          expandedPanels.value = newExpandedPanels;
          break;
        case "cleared":
          logs.value = [];
          expandedPanels.value = [];
          break;
      }
    },
    onConnect: () => {
      reloadData();
    },
  })
);

onMounted(async () => {
  ws.value.connect();
});

const clearSearch = () => {};

const clearAllRecords = async () => {
  await fetch(apiHost + "/clear", { method: "POST" });
};

const collapseAll = () => {
  expandedPanels.value = [];
};
</script>
<template>
  <VContainer>
    <VRow>
      <VCol cols="10">
        <VTextField
          v-model="search"
          label="Search"
          variant="solo"
          append-inner-icon="mdi-magnify"
          density="compact"
          single-line
          hide-details
        />
      </VCol>
      <VCol cols="2" class="d-flex align-center">
        <VBtn @click="clearSearch" color="info" width="100%">Clear</VBtn>
      </VCol>
    </VRow>
    <VRow>
      <VCol class="d-flex align-center ga-4">
        <VBtn color="blue" @click="collapseAll">Collapse All</VBtn>
        <VBtn color="red" @click="clearAllRecords">Remove All Records</VBtn>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VExpansionPanels multiple v-model="expandedPanels">
          <LogCard :log="log" v-for="log in filteredRecords"></LogCard>
        </VExpansionPanels>
      </VCol>
    </VRow>
  </VContainer>
</template>
