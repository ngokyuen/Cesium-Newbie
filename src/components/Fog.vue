<template>
  <button
    :class="fog.enable ? 'enabled' : ''"
    @click="fog.enable ? detachFog() : attachFog()"
  >
    Fog
  </button>

  <template v-if="fog.enable">
    <div class="panel">
      Visibility:
      <input
        type="range"
        min="0.0"
        max="1.0"
        step="0.1"
        v-model="fogVisibility"
      />
    </div>
  </template>

  <template v-if="fog.enable">
    <div class="panel">
      Distance:
      <div>
        Near: <input type="text" v-model="fogStartDistance" /> Far:
        <input type="text" v-model="fogEndDistance" />
      </div>
    </div>
  </template>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    let fogPostProcessStage = null;

    let fogVisibility = ref(0.0);
    let fogColor = new Cesium.Color(1.0, 1.0, 1.0, 1.0);

    let fogStartDistance = ref(10);
    let fogEndDistance = ref(1500);

    return {
      fogPostProcessStage,

      fogVisibility,
      fogColor,

      fogStartDistance,
      fogEndDistance,
    };
  },
  computed: {
    ...mapState({
      fog: (state) => state.features.fog,
    }),
  },
  methods: {
    ...mapMutations(["setFogEnable"]),

    attachFog() {
      if (this.fog.enable) {
        return;
      }

      this.setFogEnable(true);
      this.attachPostProcessStage();
    },

    detachFog() {
      this.setFogEnable(false);
      this.detachPostProcessStage();
    },

    attachPostProcessStage() {
      const cesiumViewer = window.cesiumViewer;
      const scene = cesiumViewer.scene;

      if (this.fogPostProcessStage == null) {
        this.fogPostProcessStage = new Cesium.PostProcessStage({
          fragmentShader: this.generateFragmentShader(),
          uniforms: {
            fogVisibility: () => {
              return this.fogVisibility;
            },
            fogColor: this.fogColor,

            fogByDistance: () => {
              new Cesium.Cartesian2(this.fogStartDistance, this.fogEndDistance);
            },

            u_time: () => {
              return Date.now();
            },
          },
        });

        scene.postProcessStages.add(this.fogPostProcessStage);
      }
    },

    detachPostProcessStage() {
      const cesiumViewer = window.cesiumViewer;
      const scene = cesiumViewer.scene;
      if (this.fogPostProcessStage) {
        scene.postProcessStages.remove(this.fogPostProcessStage);
        this.fogPostProcessStage = null;
      }
    },

    generateFragmentShader() {
      return `
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        uniform float fogVisibility;
        uniform vec4 fogColor;
        varying vec2 v_textureCoordinates;
        void main(void)
        {
          //texture2D(sampler2D sampler, vec2 coord) : Retrieves texels from a texture
          vec4 origcolor = texture2D(colorTexture, v_textureCoordinates);
          float depth = czm_readDepth(depthTexture, v_textureCoordinates);
          vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates);
          float f = fogVisibility * (depthcolor.r - 0.3) / 0.5;
          f = clamp(f, 0.0, 1.0);
          gl_FragColor = mix(origcolor, fogColor, f);
        }
        `;
    },

    generateFragmentShaderByDistance() {
      return `
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        varying vec2 textureCoordinate;

        void main() {
          vec2 st = gl_FragCoord.xy/1024.0;
          gl_FragColor = vec4(1.0,1.0, 0.0,1.0);
        }
        `;
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
