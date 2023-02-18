<template>
  <div id="MapContainers">
    <div id="CesiumContainer">
      <ul id="RightMenu">
        <li>
          <Layers ref="Layers" />
        </li>
        <li>
          <SplitLayers ref="SplitLayers" />
        </li>
        <li>
          <ViewShed ref="ViewShed" />
        </li>
        <li>
          <Measure ref="Measure" />
        </li>
        <li>
          <Fog ref="Fog" />
        </li>
        <li>
          <Spin ref="Spin" />
        </li>
      </ul>

      <ul id="LeftTopFloat">
        <li>
          <LocationPanel ref="LocationPanel" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import Layers from "./components/Layers.vue";
import SplitLayers from "./components/SplitLayers.vue";
import ViewShed from "./components/ViewShed.vue";
import Measure from "./components/Measure.vue";
import Fog from "./components/Fog.vue";
import Spin from "./components/Spin.vue";
import LocationPanel from "./components/LocationPanel.vue";

export default {
  setup() {
    const cesiumViewer = null;
    const clickedPositionC3 = new Cesium.Cartesian3()

    return {
      cesiumViewer,
      clickedPositionC3
    };
  },
  mounted() {
    this.enableCesiumViewer();
    window.app = this;
  },
  methods: {
    ...mapMutations(["addLayers", "addSplitLayersLeft", "addSplitLayersRight"]),

    enableCesiumViewer() {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0M2VjZmNiYy04YWU3LTRlZjItOTVmOC03MDllZDk0NTRkYzciLCJpZCI6MTc2MTUsImlhdCI6MTY3NjYzMTExNX0.dXg_fT85Vf5TddG0X65XYdHEMUC4HfsKVK7fBAOM7Cs";
      this.cesiumViewer = new Cesium.Viewer("CesiumContainer", {});
      window.cesiumViewer = this.cesiumViewer;
      //point cloud
      let tileset = this.cesiumViewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: Cesium.IonResource.fromAssetId(43978),
        })
      );
      this.addLayers(tileset);
      this.addSplitLayersLeft(tileset);
      //building model
      tileset = this.cesiumViewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: Cesium.IonResource.fromAssetId(69380),
        })
      );
      this.addLayers(tileset);
      this.addSplitLayersRight(tileset);
      // tileset.debugShowBoundingVolume = true;
      this.cesiumViewer.zoomTo(tileset);

      //add point
      const clickedPosition = window.cesiumViewer.entities.add({
          name: "clickedPosition",
          position: new Cesium.CallbackProperty(()=>{
            return this.clickedPositionC3
          }),
          point: {
            pixelSize: 10,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1
          }
        })

      const handler = new Cesium.ScreenSpaceEventHandler(
        window.cesiumViewer.canvas
      );
      handler.setInputAction((event) => {
        console.group()
        console.log("window position: ", event.position);

        const pickedPosition = window.cesiumViewer.scene.pickPosition(event.position);
        console.log("picked position: ", pickedPosition)

        const pickedItem = window.cesiumViewer.scene.pick(event.position);
        console.log("picked Item: ", pickedItem);

        this.clickedPositionC3 = pickedPosition

        console.groupEnd()
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
  },
  components: {
    Layers,
    SplitLayers,
    ViewShed,
    Measure,
    Fog,
    Spin,
    LocationPanel,
  },
};
</script>

<style>
body,
#app {
  padding: 0;
  margin: 0;
}
</style>

<style>
#MapContainers {
  width: 100%;
  height: 100%;
  display: flex;
  position: absolute;
}

#CesiumContainer {
  flex: 1;
}

#RightMenu {
  position: absolute;
  right: 15px;
  top: 50%;
  z-index: 999;
  list-style: none;
}

#RightMenu li {
  margin-top: 5px;
}

#RightMenu li button {
  width: 100%;
  padding: 5px;
  font-weight: bold;
}

#RightMenu li button.enabled {
  background-color: #000;
  color: #fff;
}

#LeftTopFloat {
  position: absolute;
  left: 15px;
  top: 0px;
  z-index: 999;
  list-style: none;
  background-color: #fff;
  color: #000;
  padding: 3px 5px;
}
</style>
