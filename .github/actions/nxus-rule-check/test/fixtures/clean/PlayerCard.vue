<template>
  <div class="bg-surface-card text-body p-6 rounded-[20px] gap-4">
    <h2 class="type-h2 font-heading text-heading">{{ name }}</h2>
    <span class="px-2 py-[2px] type-micro text-muted">{{ club }}</span>
    <a href="https://example.com/x">link</a>
  </div>
</template>

<style scoped lang="scss">
.card {
  background: var(--surface-card);
  color: var(--text-body);
  padding: 8px 24px;
  gap: 1rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: var(--type-body);
  --kit-colour: #c8102e;
}
</style>
