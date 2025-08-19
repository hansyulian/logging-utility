<script lang="ts" setup>
import { computed, onMounted } from "vue";
import type { LogExtended } from "../types";

const props = defineProps<{ log: LogExtended }>();

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.log.id);
};

onMounted(() => {
  console.log(props.log.data);
});

const preview = computed(() => {
  const data = props.log.data;
  if (!Array.isArray(data)) {
    return;
  }
  const firstData = data[0];
  return `${firstData}`;
});
</script>

<template>
  <VCard
    :class="{
      'bg-blue-lighten-5': !log.hidden,
      'bg-yellow-lighten-5': log.hidden,
    }"
  >
    <VCardText
      :class="{
        'bg-blue-lighten-4': !log.hidden,
        'bg-yellow-lighten-4': log.hidden,
      }"
    >
      <!-- Clickable header -->
      <div
        class="d-flex flex-row justify-space-between"
        @click="log.expanded = !log.expanded"
        style="cursor: pointer"
      >
        <div>
          <p class="font-weight-bold">
            {{ log.id }}
            <VIcon icon="mdi-content-copy" @click.stop="copyToClipboard" />
          </p>
          <p>{{ log.timestamp }}</p>
        </div>

        <div class="d-flex flex-row align-center ga-4">
          <VIcon
            @click.stop="log.hidden = !log.hidden"
            :icon="log.hidden ? 'mdi-restore' : 'mdi-close'"
            color="red"
          />
          <VIcon
            @click.stop="log.pinned = !log.pinned"
            :icon="log.pinned ? 'mdi-pin-off' : 'mdi-pin'"
            color="info"
          />
        </div>
      </div>
    </VCardText>

    <VCardText v-show="!log.expanded">
      <pre>{{ preview }}</pre>
    </VCardText>
    <VCardText v-show="log.expanded">
      <JsonViewer :value="log.data" copyable />
    </VCardText>
  </VCard>
</template>
