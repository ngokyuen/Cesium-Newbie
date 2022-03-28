const state = () => ({
  layers: [],

  splitLayers: {
    enable: false,
    clippingRightList: [],
    clippingLeftList: [],
  },

  viewShed: {
    enable: false,
  },

  viewShed2: {
    enable: false,
  },
});

const mutations = {
  //layers
  addLayers(state, tileset) {
    state.layers.push(tileset);
  },

  //SplitLayers
  setSplitLayersEnable(state, enable) {
    state.splitLayers.enable = enable;
  },

  addSplitLayersLeft(state, tileset) {
    state.splitLayers.clippingRightList.push(tileset);
  },

  addSplitLayersRight(state, tileset) {
    state.splitLayers.clippingLeftList.push(tileset);
  },

  //Viewshed
  setViewshedEnable(state, enable) {
    state.viewShed.enable = enable;
  },
};

export default {
  state,
  // getters,
  // actions,
  mutations,
  // modules: {

  // }
};
