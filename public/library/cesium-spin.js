(function (namespace) {
  if (namespace == null) {
    alert("Cesium is not loaded");
    return;
  }

  class Spin {
    constructor(targetCesiumViewer) {
      this._viewer = targetCesiumViewer;

      this._centerPoint = null;

      this._spinListener = null;

      this._isRotating = false;

      // console.log(this._viewer)

      /*
      this._pinTimer = null;
      this._defaultRequestRender = false;
      */
    }

    start({
      degree = null,
      slowMode = false,
      addDegreePerTime = 2,
      slowAddDegreePerTime = 1,
    }) {
      const _ = this;
      const camera = this._viewer.camera;
      const scene = this._viewer.scene;
      const container = this._viewer.container;

      this._isRotating = true;

      // //store requestRender Mode and changed
      // this._defaultRequestRender = scene.requestRenderMode;
      scene.requestRenderMode = false;

      //get global coordinate of screen center
      const windowPosition = new Cesium.Cartesian2(
        container.clientWidth / 2,
        container.clientHeight / 2
      );

      const pickPosition = camera.pickEllipsoid(windowPosition);

      // const pickPosition = this._viewer.scene.globe.pick(scene.camera.getPickRay(new Cesium.Cartesian2(
      //   container.clientWidth / 2,
      //   container.clientHeight / 2
      // )),  this._viewer.scene);

      // console.log(pickPosition)

      const heading = camera.heading;
      const pitch = camera.pitch;

      const distance = Math.sqrt(
        Math.pow(camera.positionWC.x - pickPosition.x, 2) +
          Math.pow(camera.positionWC.y - pickPosition.y, 2) +
          Math.pow(camera.positionWC.z - pickPosition.z, 2)
      );

      console.group("spin");
      console.log("pick position:", pickPosition);
      console.log("camera position:", camera.positionWC);
      console.log("distance:", distance);
      console.groupEnd();

      let tmpDegree = 0;

      this._spinListener = () => {
        // offset = new Cesium.HeadingPitchRange(
        //   Cesium.Math.toRadians(heading),
        //   -Cesium.Math.toRadians(30),
        //   1000
        // );
        // this._viewer.zoomTo(entity, offset);

        // console.log(tmpDegree);

        if (degree != null && tmpDegree >= Math.abs(degree)) {
          // console.log(tmpDegree, Math.abs(degree));
          _.stop();
          return
        }

        let tmpDifference = Math.abs(tmpDegree - Math.abs(degree))

        // console.log(tmpDifference)

        if (slowMode) {
          tmpDegree += degree != null && tmpDifference < slowAddDegreePerTime ? tmpDifference: slowAddDegreePerTime;
        } else {
          tmpDegree += degree != null && tmpDifference < addDegreePerTime ? tmpDifference: addDegreePerTime;
        }

        camera.lookAt(
          pickPosition,
          new Cesium.HeadingPitchRange(
            heading +
              ((degree > 0 || degree == null ? tmpDegree : -tmpDegree) *
                Math.PI) /
                180,
            pitch,
            distance
          )
        );
      };

      scene.screenSpaceCameraController.enableInputs = false;
      this._viewer.clock.onTick.addEventListener(this._spinListener);
    }

    stop() {
      const scene = this._viewer.scene;
      const clock = this._viewer.clock;

      this._isRotating = false;

      clock.onTick.removeEventListener(this._spinListener);
      scene.screenSpaceCameraController.enableInputs = true;
    }

    /*
    stopPin() {
      console.warn("---stop pin---");

      //recover requestRender Mode
      this._viewer.scene.requestRenderMode = this._defaultRequestRender;

      clearInterval(this._pinTimer);
    }

    startPin(
      options = { direction: true, pin_rate: 0.00001, pin_render_time: 10 }
    ) {
      //options:
      //direction(boolean): left / right
      //pin_rate(float): pin speed
      //pin_render_time(float):

      console.warn("---start pin---");
      // console.log(targetCesiumViewer)

      var camera = this._viewer.camera;
      var scene = this._viewer.scene;
      var container = this._viewer.container;

      //store requestRender Mode and changed
      this._defaultRequestRender = scene.requestRenderMode;
      scene.requestRenderMode = false;

      //get global coordinate of screen center
      var windowPosition = new Cesium.Cartesian2(
        container.clientWidth / 2,
        container.clientHeight / 2
      );

      var pickPosition = camera.pickEllipsoid(windowPosition);

      var distance = Math.sqrt(
        Math.pow(camera.position.x - pickPosition.x, 2) +
          Math.pow(camera.position.y - pickPosition.y, 2) +
          Math.pow(camera.position.z - pickPosition.z, 2)
      );

      var origial_angle =
        (Math.acos((camera.position.x - pickPosition.x) / distance) * 180) /
        Math.PI;

      console.group();
      console.log("camera coordinate:", camera.position);
      console.log("center Position:", pickPosition);
      console.log("camera heading", camera.heading);
      console.log("camera roll:", camera.roll);
      console.log("camera pitch:", camera.pitch);
      console.log("distance:", distance);
      console.log("origial_angle:", origial_angle);
      console.groupEnd();

      // for (var i = 0; i <= 360; i++) {
      //   let new_angle = origial_angle + i;

      //   let new_camera_x = Math.cos(new_angle) * distance + pickPosition.x

      //   let new_camera_y = Math.sin(new_angle) * distance+ pickPosition.y

      //   camera.lookAt(pickPosition, new Cesium.HeadingPitchRange(camera.heading +  i * Math.PI / 180, camera.pitch, distance))
      // }

      // cesiumViewer.clock.onTick.addEventListener(camera.lookAt(pickPosition, new Cesium.HeadingPitchRange(camera.heading +  i * Math.PI / 180, camera.pitch, distance))

      var i = 0;
      this._pinTimer = setInterval(() => {
        camera.lookAt(
          pickPosition,
          new Cesium.HeadingPitchRange(
            camera.heading + ((options.direction ? i : -i) * Math.PI) / 180,
            camera.pitch,
            distance
          )
        );

        if (i >= 360) {
          i = 0;
        } else {
          i += options.pin_rate * (Math.abs(Math.cos(i)) + options.pin_rate);
        }
      }, options.pin_render_time);
    }

    */
  }

  namespace.Spin = Spin;
})(Cesium);
