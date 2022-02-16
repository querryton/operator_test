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

export const setModel = data => ({ type: SET_CORPUS_SET_MODEL, data })
export const setModelLayers = data => ({ type: SET_CORPUS_SET_MODEL_LAYERS, data })
export const setModelSummary = data => ({ type: SET_CORPUS_SET_MODEL_SUMMARY, data })
export const setDataset = data => ({ type: SET_CORPUS_SET_DATASET, data })
export const setDatas = data => ({ type: SET_CORPUS_SET_DATAS, data })
export const setSelectedData = data => ({ type: SET_CORPUS_SET_SELECTED_DATA, data })
export const setSelectedImageBase64 = data => ({ type: SET_CORPUS_SET_SELECTED_IMAGE_BASE64, data })
export const setSearch = data => ({ type: SET_CORPUS_SET_SEARCH, data })
export const setPagination = data => ({ type: SET_CORPUS_SET_PAGINATION, data })