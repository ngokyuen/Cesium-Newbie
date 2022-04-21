<template>
  <button
    :class="viewShed.enable ? 'enabled' : ''"
    @click="viewShed.enable ? detachViewshed() : attachViewshed()"
  >
    Viewshed
  </button>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const mouseHandler = null;
    const startPosition = null;
    const lightCameraPoint = null;
    const lightCamera = null;
    const frustum = null;
    // const shadowMap = null;

    return {
      mouseHandler,
      startPosition,
      lightCameraPoint,
      lightCamera,
      frustum,
      // shadowMap,
    };
  },
  computed: {
    ...mapState({
      viewShed: (state) => state.features.viewShed,
    }),
  },
  methods: {
    ...mapMutations(["setViewshedEnable"]),
    attachViewshed() {
      if (this.viewShed.enable) {
        return;
      }

      this.setViewshedEnable(true);
      this.attachViewshedListener();
    },

    detachViewshed() {
      this.setViewshedEnable(false);

      this.clearPoint({ clearStartPosition: true });
      this.clearSpotLightCamera();
      this.clearFrustum();
      this.clearShadowMap();

      this.detachViewshedListener();
    },

    attachViewshedListener() {
      const cesiumViewer = window.cesiumViewer;
      const scene = cesiumViewer.scene;
      const canvas = scene.canvas;
      let endPosition = null;

      // this.buildPoint();

      this.mouseHandler = new Cesium.ScreenSpaceEventHandler(canvas);

      this.mouseHandler.setInputAction((movement) => {
        const cartesian = scene.pickPosition(movement.position);
        // console.log("LEFT_CLICK:", movement);

        // this.clearPoint();
        this.clearSpotLightCamera();
        this.clearFrustum();
        this.clearShadowMap();

        if (this.startPosition == null) {
          this.startPosition = cartesian;
        } else if (endPosition == null) {
          endPosition = cartesian;

          this.buildPoint();
          this.buildSpotLightCamera(endPosition);
          this.buildFrustum();
          this.buildShadowMap();
        } else {
          this.startPosition = cartesian;
          endPosition = null;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      this.mouseHandler.setInputAction((movement) => {},
      Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    detachViewshedListener() {
      this.mouseHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      this.mouseHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    },

    buildPoint() {
      const cesiumViewer = window.cesiumViewer;

      //add start point about the camera
      this.lightCameraPoint = cesiumViewer.entities.add({
        position: new Cesium.CallbackProperty(() => {
          return this.startPosition;
        }),
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
      });
    },

    // object {clearStartPosition: boolean}
    clearPoint(object) {
      const cesiumViewer = window.cesiumViewer;
      if (this.lightCameraPoint) {
        cesiumViewer.entities.remove(this.lightCameraPoint);
        if (object && object.clearStartPosition) {
          this.startPosition = null;
        }
      }
    },

    buildSpotLightCamera(endPosition) {
      // const camera = window.cesiumViewer.camera;
      // const scene = window.cesiumViewer.scene;

      this.clearSpotLightCamera();

      // const direction = Cesium.Cartesian3.normalize(
      //   Cesium.Cartesian3.subtract(
      //     endPosition,
      //     startPosition,
      //     new Cesium.Cartesian3()
      //   ),
      //   new Cesium.Cartesian3()
      // );
      // this.lightCamera.up = Cesium.Cartesian3.clone(camera.up);
      // this.lightCamera.up =  Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_Z);
      // this.lightCamera.position = startPosition;
      // this.lightCamera.direction = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_Z);
      // this.lightCamera.up = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_X);

      //camera setting
      this.lightCamera.frustum.fov = Cesium.Math.PI_OVER_THREE;
      this.lightCamera.frustum.near = 0.1;
      this.lightCamera.frustum.far = Cesium.Cartesian3.distance(
        this.startPosition,
        endPosition
      );

      //calculate heading & pitch
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(
        this.startPosition
      );
      const inverseTransform = Cesium.Matrix4.inverse(
        transform,
        new Cesium.Matrix4()
      );
      const toLocalPosition = Cesium.Matrix4.multiplyByPoint(
        inverseTransform,
        endPosition,
        new Cesium.Cartesian3()
      );
      Cesium.Cartesian3.normalize(toLocalPosition, toLocalPosition);

      const heading = Cesium.Math.toDegrees(
        Math.atan2(toLocalPosition.x, toLocalPosition.y)
      );
      const pitch = Cesium.Math.toDegrees(Math.asin(toLocalPosition.z));

      this.lightCamera.setView({
        destination: this.startPosition,
        orientation: {
          heading: Cesium.Math.toRadians(heading),
          pitch: Cesium.Math.toRadians(pitch),
          roll: 0,
        },
      });

      // console.log("lightCamera:", lightCamera);
    },

    clearSpotLightCamera() {
      const scene = window.cesiumViewer.scene;
      if (this.lightCamera == null) {
        this.lightCamera = new Cesium.Camera(scene);
      }
    },

    buildFrustum() {
      const scene = window.cesiumViewer.scene;

      this.clearFrustum();

      //  //way 1 failed
      // const transform4 = Cesium.Transforms.eastNorthUpToFixedFrame(lightCamera.position);
      // const transform3 = new Cesium.Matrix3();
      // Cesium.Matrix3.getRotation(transform4, transform3);
      // const transformQ = Cesium.Quaternion.fromRotationMatrix(transform3);

      // // Convert the h/p/r values to a (local-reference) Quaternion
      // const localHpr = Cesium.HeadingPitchRoll.fromDegrees(lightCamera.heading, lightCamera.pitch, lightCamera.roll);
      // const localQ = Cesium.Quaternion.fromHeadingPitchRoll(localHpr);

      // const orientation = Cesium.Quaternion.multiply(
      //   localQ,
      //   transformQ,
      //   new Cesium.Quaternion()
      // );

      // const orientation = Cesium.Quaternion.fromHeadingPitchRoll(
      //   new Cesium.HeadingPitchRoll(
      //     this.lightCamera.heading,
      //     this.lightCamera.pitch,
      //     this.lightCamera.roll
      //   ),
      //   new Cesium.Quaternion()
      // );

      // // way 2 failed
      // // transform relateive hpr to absolute rotation quaternion
      // const hpr = new Cesium.HeadingPitchRoll(
      //   this.lightCamera.heading,
      //   this.lightCamera.pitch,
      //   this.lightCamera.roll
      // );

      // const localQ = Cesium.Quaternion.fromHeadingPitchRoll(hpr);

      // let enu = Cesium.Transforms.eastNorthUpToFixedFrame(this.lightCamera.position);

      // let transform3 = new Cesium.Matrix3();
      // Cesium.Matrix4.getMatrix3(enu, transform3);
      // let transformQ = Cesium.Quaternion.fromRotationMatrix(transform3);

      // let orientation = new Cesium.Quaternion();
      // Cesium.Quaternion.multiply(localQ, transformQ, orientation);

      //way 3: correct
      const right = Cesium.Cartesian3.negate(
        this.lightCamera.rightWC,
        new Cesium.Cartesian3()
      );

      let rotationMatrix3 = new Cesium.Matrix3();
      // console.log(Object.assign(rotationMatrix3, {}))

      Cesium.Matrix3.setColumn(rotationMatrix3, 0, right, rotationMatrix3);
      Cesium.Matrix3.setColumn(
        rotationMatrix3,
        1,
        this.lightCamera.upWC,
        rotationMatrix3
      );
      Cesium.Matrix3.setColumn(
        rotationMatrix3,
        2,
        this.lightCamera.directionWC,
        rotationMatrix3
      );

      let orientationQuaternion = Cesium.Quaternion.fromRotationMatrix(
        rotationMatrix3,
        new Cesium.Quaternion()
      );

      const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.FrustumOutlineGeometry({
          frustum: this.lightCamera.frustum,
          origin: this.lightCamera.position,
          orientation: orientationQuaternion,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            // new Cesium.Color(1.0, 1.0, 0.0, 1.0)
            Cesium.Color.YELLOWGREEN
          ),
          show: new Cesium.ShowGeometryInstanceAttribute(true),
        },
      });

      // console.log(primitive)

      this.frustum = scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: [instance],
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
          }),
        })
      );

      // console.log(this.frustum);
      // console.log(this.lightCamera);

      // this.frustum.modelMatrix = this.lightCamera.modelMatrix
    },

    clearFrustum() {
      if (this.frustum) {
        this.frustum.destroy();
      }
    },

    buildShadowMap() {
      const scene = window.cesiumViewer.scene;
      const shadowMap = new Cesium.ShadowMap({
        context: scene.context,
        lightCamera: this.lightCamera,
        cascadesEnabled: false,
        softShadows: true,
        // isPointLight: true,
        // darkness: 0.5,
      });

      // shadowMap.enabled = true;
      // shadowMap.size = 1024
      // shadowMap.debugShow = true;

      scene.shadowMap = shadowMap;

      // console.log("shadowMap:", shadowMap);
    },

    clearShadowMap() {
      const scene = window.cesiumViewer.scene;
      scene.shadowMap = null;
    },
  },
});
</script>
