import {
    SET_CORPUS_SET_MODEL,
    SET_CORPUS_SET_MODEL_LAYERS,
    SET_CORPUS_SET_MODEL_SUMMARY,
    SET_CORPUS_SET_DATASET,
    SET_CORPUS_SET_DATAS,
    SET_CORPUS_SET_SELECTED_DATA,
    SET_CORPUS_SET_SELECTED_IMAGE_BASE64,
    SET_CORPUS_SET_SEARCH,
    SET_CORPUS_SET_PAGINATION,
} from 'redux/constant'

const init = {
    model: {
        name: 'AlexNet',
        layers: ['conv2d', 'conv2d_1', 'conv2d_2', 'conv2d_3', 'conv2d_4', 'dense', 'dense_1', 'dense_2'],
        summary: 'Model: \"sequential\"\n_________________________________________________________________\nLayer (type)                 Output Shape              Param #   \n=================================================================\nconv2d (Conv2D)              (None, 96, 55, 55)        34944     \n_________________________________________________________________\nre_lu (ReLU)                 (None, 96, 55, 55)        0         \n_________________________________________________________________\nmax_pooling2d (MaxPooling2D) (None, 96, 27, 27)        0         \n_________________________________________________________________\nconv2d_1 (Conv2D)            (None, 256, 27, 27)       614656    \n_________________________________________________________________\nre_lu_1 (ReLU)               (None, 256, 27, 27)       0         \n_________________________________________________________________\nmax_pooling2d_1 (MaxPooling2 (None, 256, 13, 13)       0         \n_________________________________________________________________\nconv2d_2 (Conv2D)            (None, 384, 13, 13)       885120    \n_________________________________________________________________\nre_lu_2 (ReLU)               (None, 384, 13, 13)       0         \n_________________________________________________________________\nconv2d_3 (Conv2D)            (None, 384, 13, 13)       1327488   \n_________________________________________________________________\nre_lu_3 (ReLU)               (None, 384, 13, 13)       0         \n_________________________________________________________________\nconv2d_4 (Conv2D)            (None, 256, 13, 13)       884992    \n_________________________________________________________________\nre_lu_4 (ReLU)               (None, 256, 13, 13)       0         \n_________________________________________________________________\nmax_pooling2d_2 (MaxPooling2 (None, 256, 6, 6)         0         \n_________________________________________________________________\nflatten (Flatten)            (None, 9216)              0         \n_________________________________________________________________\ndense (Dense)                (None, 4096)              37752832  \n_________________________________________________________________\nre_lu_5 (ReLU)               (None, 4096)              0         \n_________________________________________________________________\ndense_1 (Dense)              (None, 4096)              16781312  \n_________________________________________________________________\nre_lu_6 (ReLU)               (None, 4096)              0         \n_________________________________________________________________\ndense_2 (Dense)              (None, 10)                40970     \n=================================================================\nTotal params: 58,322,314\nTrainable params: 58,322,314\nNon-trainable params: 0\n_________________________________________________________________',
    },
    dataset: 'CIFAR-10',
    datas: [],
    selectedData: {},
    selectedImageBase64: '',
    search: {
        field: 'filename',
        keywords: ''
    },
    pagination: {
        pageIndex: 0,
        totalPages: 0,
    }
}

export default function corpusSetReducer(pre = init, action) {
    const { type, data } = action
    switch (type) {
        case SET_CORPUS_SET_MODEL:
            return {
                ...pre,
                model: data
            }
        case SET_CORPUS_SET_MODEL_LAYERS:
            return {
                ...pre,
                layers: data
            }
        case SET_CORPUS_SET_MODEL_SUMMARY:
            return {
                ...pre,
                modelSummary: data
            }
        case SET_CORPUS_SET_DATASET:
            return {
                ...pre,
                dataset: data
            }
        case SET_CORPUS_SET_DATAS:
            return {
                ...pre,
                datas: data
            }
        case SET_CORPUS_SET_SELECTED_DATA:
            return {
                ...pre,
                selectedData: data
            }
        case SET_CORPUS_SET_SELECTED_IMAGE_BASE64:
            return {
                ...pre,
                selectedImageBase64: data
            }
        case SET_CORPUS_SET_SEARCH:
            return {
                ...pre,
                search: data
            }
        case SET_CORPUS_SET_PAGINATION:
            return {
                ...pre,
                pagination: data
            }
        default:
            return pre
    }
}