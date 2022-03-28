<template>
  <button
    :class="splitLayers.enable ? 'enabled' : ''"
    @click="splitLayers.enable ? detachSplitLayers() : attachSplitLayers()"
  >
    Split Layers
  </button>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    let swipeHandler = null;
    let cameraChangedListener = null;

    return {
      swipeHandler,
      cameraChangedListener,
    };
  },

  computed: {
    ...mapState({
      splitLayers: (state) => state.layers.splitLayers,
    }),
  },

  methods: {
    ...mapMutations(["setSplitLayersEnable"]),

    getInverseTransform(tileSet) {
      let transform;
      transform =
        tileSet && tileSet.root && tileSet.root.transform
          ? tileSet.root.transform
          : Cesium.Transforms.eastNorthUpToFixedFrame(
              tileSet.boundingSphere.center
            );
      return Cesium.Matrix4.inverseTransformation(
        transform,
        new Cesium.Matrix4()
      );
    },

    getLocalCoordinatePoint(longitude, latitude, inverseTransform) {
      let val = Cesium.Cartesian3.fromDegrees(
        (longitude * 180) / Math.PI,
        (latitude * 180) / Math.PI
      );
      return Cesium.Matrix4.multiplyByPoint(
        inverseTransform,
        val,
        new Cesium.Cartesian3(0, 0, 0)
      );
    },

    createPlaneByLonLatTransform(p1, p2, inverseTransform) {
      // transform to local coordinate
      let localCoordP1 = this.getLocalCoordinatePoint(
        p1.longitude,
        p1.latitude,
        inverseTransform
      );
      let localCoordP2 = this.getLocalCoordinatePoint(
        p2.longitude,
        p2.latitude,
        inverseTransform
      );

      // calculate normal vector of p1
      //  right : from p1 to p2 vector
      let up = new Cesium.Cartesian3(1, 0, 120);
      let right = Cesium.Cartesian3.subtract(
        localCoordP2,
        localCoordP1,
        new Cesium.Cartesian3()
      );

      let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
      normal = Cesium.Cartesian3.normalize(normal, normal);
      //create plane using a point and a vector
      let tmpPlane = Cesium.Plane.fromPointNormal(localCoordP1, normal);
      return Cesium.ClippingPlane.fromPlane(tmpPlane);
    },

    updateSplitLayers() {
      //define variables
      const scene = window.cesiumViewer.scene;
      const camera = window.cesiumViewer.camera;
      const canvas = window.cesiumViewer.canvas;

      //get client's screen top & bottom point

      const sliderContainer = document.getElementById("sliderContainer");

      const width =
        canvas.clientWidth *
        ((parseFloat(sliderContainer.style.left)
          ? parseFloat(sliderContainer.style.left)
          : 50) /
          100);

      const clientTopCenterPoint =
        scene.globe.ellipsoid.cartesianToCartographic(
          camera.pickEllipsoid(
            new Cesium.Cartesian2(width, canvas.clientHeight / 2)
          )
        );

      const clientBottomCenterPoint =
        scene.globe.ellipsoid.cartesianToCartographic(
          camera.pickEllipsoid(
            new Cesium.Cartesian2(width, canvas.clientHeight / 2.01)
          )
        );

      //clipping right
      for (let i = 0; i < this.splitLayers.clippingRightList.length; i++) {
        const tileset = this.splitLayers.clippingRightList[i];
        if (tileset.clippingPlanes) {
          tileset.clippingPlanes.removeAll();
        } else {
          tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: [],
          });
        }
        const rightClippingPlane = this.createPlaneByLonLatTransform(
          clientBottomCenterPoint,
          clientTopCenterPoint,
          this.getInverseTransform(tileset)
        );
        tileset.clippingPlanes.add(rightClippingPlane);
      }

      //clipping left
      for (let i = 0; i < this.splitLayers.clippingLeftList.length; i++) {
        const tileset = this.splitLayers.clippingLeftList[i];
        if (tileset.clippingPlanes) {
          tileset.clippingPlanes.removeAll();
        } else {
          tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: [],
          });
        }
        const leftClippingPlane = this.createPlaneByLonLatTransform(
          clientTopCenterPoint,
          clientBottomCenterPoint,
          this.getInverseTransform(tileset)
        );
        tileset.clippingPlanes.add(leftClippingPlane);
      }
    },

    attachSplitLayers() {
      if (this.splitLayers.enable) {
        return;
      }

      this.setSplitLayersEnable(true);
      //define variables
      const me = this;
      const camera = window.cesiumViewer.camera;

      this.attachSlider();

      this.updateSplitLayers();
      camera.percentageChanged = 0.001;

      this.cameraChangedListener = function () {
        me.updateSplitLayers();
      };

      this.splitLayers.clippingLeftList.forEach((tileset) => {
        if (tileset.clippingPlanes) {
          tileset.clippingPlanes.enabled = true;
        }
      });

      this.splitLayers.clippingRightList.forEach((tileset) => {
        if (tileset.clippingPlanes) {
          tileset.clippingPlanes.enabled = true;
        }
      });

      camera.changed.addEventListener(this.cameraChangedListener);
    },

    detachSplitLayers() {
      this.setSplitLayersEnable(false);

      const camera = window.cesiumViewer.camera;
      camera.percentageChanged = 0.5;
      camera.changed.removeEventListener(this.cameraChangedListener);

      this.splitLayers.clippingLeftList.forEach((tileset) => {
        if (tileset.clippingPlanes) {
          tileset.clippingPlanes.enabled = false;
        }
      });

      this.splitLayers.clippingRightList.forEach((tileset) => {
        if (tileset.clippingPlanes) {
          tileset.clippingPlanes.enabled = false;
        }
      });

      this.detachSlider();
    },

    attachSlider() {
      const sliderContainer = document.getElementById("sliderContainer");

      if (sliderContainer) {
        document.getElementById("sliderContainer").style.visibility = "visible";
      } else {
        const div = document.createElement("div");
        div.id = "sliderContainer";

        const CesiumContainer = document.getElementById("CesiumContainer");
        CesiumContainer.append(div);
      }

      this.attachSliderListener();
    },

    detachSlider() {
      // document.getElementById("sliderContainer").remove();
      document.getElementById("sliderContainer").style.visibility = "hidden";

      this.detachSliderListener();
    },

    attachSliderListener() {
      const sliderContainer = document.getElementById("sliderContainer");

      const me = this;

      let move = false;

      this.swipeHandler = new Cesium.ScreenSpaceEventHandler(sliderContainer);

      this.swipeHandler.setInputAction(function () {
        move = true;
        // console.log("Cesium.ScreenSapveEventType.LEFT_DOWN")
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      this.swipeHandler.setInputAction(function () {
        move = false;
        // console.log("Cesium.ScreenSapveEventType.LEFT_DOWN")
      }, Cesium.ScreenSpaceEventType.LEFT_UP);

      this.swipeHandler.setInputAction(function ($event) {
        if (move) {
          const relativeOffset = $event.endPosition.x;
          let splitPosition =
            (sliderContainer.offsetLeft + relativeOffset) /
            sliderContainer.parentElement.offsetWidth;

          if (splitPosition > 0.99) {
            splitPosition = 0.99;
          }
          if (splitPosition < 0.01) {
            splitPosition = 0.01;
          }
          sliderContainer.style.left = 100.0 * splitPosition + "%";
        }

        me.updateSplitLayers();
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    detachSliderListener() {
      this.swipeHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
      this.swipeHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOWN
      );
      this.swipeHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    },
  },
});
</script>

<style>
#sliderContainer {
  position: fixed;
  left: 50%;
  height: 100%;
  top: 0;
  width: 5px;
  z-index: 999;
  background-color: grey;
  cursor: w-resize;
}
</style>
