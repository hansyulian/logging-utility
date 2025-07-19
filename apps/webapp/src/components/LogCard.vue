<script lang="ts" setup>
import type { Log } from "@apps/common";

defineProps<{ log: Log }>();
</script>

<template>
  <VExpansionPanel>
    <VExpansionPanelTitle class="bg-blue-lighten-4">{{
      log.timestamp
    }}</VExpansionPanelTitle>
    <VExpansionPanelText class="bg-blue-lighten-5">
      <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
    </VExpansionPanelText>
  </VExpansionPanel>
</template>
