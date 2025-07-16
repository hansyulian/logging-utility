<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { WebSocketHandler } from './modules/WebSocketHandler';
import type { Log, SocketMessage } from './types';
import LogCard from './components/LogCard.vue';

const apiHost = 'http://localhost:9952';
const webSocketHost = 'ws://localhost:9952';

const logs = ref<Log[]>([]);
const search = ref('');

const filteredRecords = computed(() => {
  if (!search.value) {
    return logs.value;
  }
  const searchLowerCase = search.value.toLowerCase();
  return logs.value.filter((log) => log.data.message.toLowerCase().includes(searchLowerCase) || log.timestamp.toLowerCase().includes(searchLowerCase));
})

const reloadData = async () => {
  try {
    const response = await fetch(apiHost);
    if (response.ok) {
      logs.value = await response.json();
    } else {
      console.error('Failed to fetch logs:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

const ws = ref(new WebSocketHandler<SocketMessage>({
  host: webSocketHost,
  handleMessage: (message) => {
    switch (message.type) {
      case 'newLog':
        logs.value.unshift({
          timestamp: message.timestamp,
          data: message.data
        });
        break;
      case 'cleared':
        logs.value = [];
        break;
    }
  },
  onConnect: () => {
    reloadData();
  }
}))

onMounted(async () => {
  ws.value.connect();
});

const clearSearch = () => {

}

const clearAllRecords = async () => {
  await fetch(apiHost + '/clear', { method: 'POST' });
  logs.value = [];
}


</script>
<template>
  <VContainer>
    <VRow>
      <VCol cols="10">
        <VTextField v-model="search" label="Search" variant="solo" append-inner-icon="mdi-magnify" density="compact"
          single-line hide-details />
      </VCol>
      <VCol cols="2" class="d-flex align-center">
        <VBtn @click="clearSearch" color="info" width="100%" >Clear</VBtn>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VBtn color="red" @click="clearAllRecords">Remove All Records</VBtn>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VExpansionPanels multiple>
          <LogCard :log="log" v-for="log in filteredRecords"></LogCard>
        </VExpansionPanels>
      </VCol>
    </VRow>
  </VContainer>
</template>
