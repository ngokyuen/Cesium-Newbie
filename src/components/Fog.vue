<template>
  <button
    :class="fog.enable ? 'enabled' : ''"
    @click="fog.enable ? detachFog() : attachFog()"
  >
    Fog
  </button>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {};
  },
  computed: {
    ...mapState({
      fog: (state) => state.layers.fog,
    }),
  },
  methods: {
    ...mapMutations(["setFogEnable"]),

    attachFog() {
      if (this.fog.enable) {
        return;
      }

      this.setFogEnable(true);
    },

    detachFog() {
      this.setFogEnable(false);
    },
  },
});
</script>
