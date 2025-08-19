<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { WebSocketHandler } from "./modules/WebSocketHandler";
import LogCard from "./components/LogCard.vue";
import type { SocketMessage } from "@apps/common";
import type { LogExtended } from "./types";
import { convertLogExtened } from "./utils/convertLogExtended";
import { appConfig } from "./config/appConfig";

const apiHost = `http://${appConfig.loggingServer}`;
const webSocketHost = `ws://${appConfig.loggingServer}`;

const logs = ref<LogExtended[]>([]);
const search = ref("");
const showHidden = ref(false);
const allCollapseExpandState = ref(false);

const filteredRecords = computed(() => {
  const visibleLogs = showHidden.value
    ? logs.value
    : logs.value.filter((log) => !log.hidden);
  if (!search.value) {
    return visibleLogs;
  }
  const searchLowerCase = search.value.toLowerCase();
  return searchLowerCase
    ? visibleLogs.filter(
        (log) =>
          log.id === searchLowerCase ||
          JSON.stringify(log.data).toLowerCase().includes(searchLowerCase) ||
          log.timestamp.toLowerCase().includes(searchLowerCase)
      )
    : visibleLogs;
});

const pinnedRecords = computed(() => {
  return logs.value.filter((log) => log.pinned);
});

const hasPinnedRecords = computed(() => {
  return !!pinnedRecords.value.length;
});

const reloadData = async () => {
  try {
    const response = await fetch(apiHost, {
      headers: {
        "server-key": appConfig.serverKey,
      },
    });
    if (response.ok) {
      const data = await response.json();
      logs.value = data.map(convertLogExtened);
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
          logs.value.unshift(convertLogExtened(message));
          break;
        case "cleared":
          logs.value = [];
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

const clearAllRecords = async () => {
  await fetch(apiHost + "/clear", { method: "POST" });
};

const collapseAll = () => {
  logs.value.forEach((log) => {
    log.expanded = false;
  });
};

const expandAll = () => {
  logs.value.forEach((log) => {
    log.expanded = true;
  });
};

const toggleShowHidden = () => {
  showHidden.value = !showHidden.value;
};

const toggleCollapseExpandAll = () => {
  allCollapseExpandState.value = !allCollapseExpandState.value;
  if (allCollapseExpandState.value) {
    collapseAll();
  } else {
    expandAll();
  }
};
</script>
<template>
  <VContainer>
    <VRow>
      <VCol>
        <VTextField
          v-model="search"
          variant="solo"
          append-inner-icon="mdi-magnify"
          density="compact"
          single-line
          hide-details
          clearable
          placeholder="Search by ID, timestamp, or data"
        />
      </VCol>
    </VRow>
    <VRow>
      <VCol class="d-flex align-center ga-4 justify-space-between">
        <div class="d-flex align-center ga-4">
          <VBtn
            @click="toggleCollapseExpandAll"
            :icon="
              allCollapseExpandState ? 'mdi-arrow-expand' : 'mdi-arrow-collapse'
            "
          />
          <VBtn
            color="gray"
            @click="toggleShowHidden"
            :icon="showHidden ? 'mdi-eye-off' : 'mdi-eye'"
          />
        </div>
        <div>
          <VBtn color="red" @click="clearAllRecords" icon="mdi-delete" />
        </div>
      </VCol>
    </VRow>
    <VRow>
      <VCol class="d-flex flex-column ga-4" :cols="hasPinnedRecords ? 6 : 12">
        <LogCard :log="log" v-for="log in filteredRecords"></LogCard>
      </VCol>
      <VCol class="d-flex flex-column ga-4" cols="6" v-if="hasPinnedRecords">
        <LogCard :log="log" v-for="log in pinnedRecords"></LogCard>
      </VCol>
    </VRow>
  </VContainer>
</template>
