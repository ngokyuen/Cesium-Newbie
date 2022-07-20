<template>
  <button
    @mouseup="releaseRotateBtn"
    @mousedown="pressRotateBtn"
    @touchstart="pressRotateBtn"
    @touchend="releaseRotateBtn"
  >
    Spin (press once/ long press)
  </button>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    return {
      spin: ref(null),
      isLongPress: ref(false),
      longPressTimer: ref(null),
    };
  },
  computed: {
    // ...mapState({
    //   fog: (state) => state.features.fog,
    // }),
  },

  mounted() {},

  methods: {
    pressRotateBtn() {
      //build spin
      if (this.spin == null) {
        this.spin = new Cesium.Spin(window.cesiumViewer);
      }

      this.isLongPress = false;
      this.longPressTimer = setTimeout(() => {
        this.isLongPress = true;

        this.spin.stop();
        this.spin.start({ slow: true });
      }, 500);
    },

    releaseRotateBtn() {
      clearTimeout(this.longPressTimer);

      this.spin.stop();
      if (this.isLongPress) {
        // this.spin.start({ slow: true });
      } else {
        this.spin.start({ degree: 90 });
      }
    },
  },
});
</script>

<style scoped>
.panel {
  background-color: white;
  padding: 3px 5px;
}
</style>
