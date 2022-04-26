<template>
  <div>
    <div>Ellipsoid(Center):</div>
    <template v-if="centerC3">
      <div>{{ `x: ${centerC3.x} y: ${centerC3.y} z: ${centerC3.z}` }}</div>
    </template>
    <template v-if="centerCartographic">
      <div>
        {{
          `lat: ${Cesium.Math.toDegrees(centerCartographic.latitude)} lon: ${Cesium.Math.toDegrees(centerCartographic.longitude)}`
        }}
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from "vue";

export default defineComponent({
  setup() {
    return {
      Cesium,
      centerC3: ref(null),
      centerCartographic: ref(null),
    };
  },

  mounted() {
    this.attachListeners();
  },

  methods: {
    attachListeners() {
      const timer = setInterval(() => {
        const cesiumViewer = window.cesiumViewer;
        if (cesiumViewer) {
          this.getCenter();
          const camera = cesiumViewer.camera;
          camera.percentageChanged = 0.1;
          camera.changed.addEventListener(() => {
            this.getCenter();
          });
          clearTimeout(timer);
        }
      }, 1000);
    },

    getCenter() {
      const cesiumViewer = window.cesiumViewer;

      const camera = cesiumViewer.camera;

      const width = cesiumViewer.canvas.width;
      const height = cesiumViewer.canvas.height;

      this.centerC3 = camera.pickEllipsoid(
        new Cesium.Cartesian2(width / 2, height / 2)
      );
      this.centerCartographic = Cesium.Cartographic.fromCartesian(
        this.centerC3
      );
    },
  },
});
</script>

<style scoped></style>
