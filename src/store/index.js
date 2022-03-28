import { createStore } from 'vuex'
import layers from './modules/layers'

export default createStore({
    modules: {
        layers
    }
})