<template>
  <div class="bg-white text-gray-500 p-[13px] rounded-2xl">
    <h2 class="text-[28px] font-['Inter']">{{ name }}</h2>
    <span :style="{ color: '#304151', fontSize: '13px' }">{{ club }}</span>
    <p class="text-foreground gap-2.5">Scout notes</p>
    <template #add>slot shorthand is not a colour</template>
  </div>
</template>

<script setup>
// a comment that mentions #ff0000 and bg-white is ignored
const chart = { stroke: 'rgba(0, 0, 0, 0.4)' }
</script>

<style scoped lang="scss">
.card {
  background: #F4FAFF;
  color: white;
  padding: 10px 16px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  --kit-colour: #c8102e;
}
.medal { color: #ffd700; } // nxus-ignore — colour that is data (L-G2)
</style>
