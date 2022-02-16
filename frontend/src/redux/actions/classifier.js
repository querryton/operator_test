import {
    SET_CLASSIFIER_SELECT,
    SET_CLASSIFIER_CATEGORYS,
    SET_CLASSIFIER_RESULTS,
    SET_CLASSIFIER_TAXONOMYS,
    APPEND_CLASSIFIER_TAXONOMY,
    UPDATE_CLASSIFIER_TAXONOMY,
    UPDATE_CLASSIFIER_TAXONOMY_CATEGORY,
    APPEND_CLASSIFIER_TAXONOMY_CATEGORY,
    DELETE_CLASSIFIER_TAXONOMY_CATEGORY
} from 'redux/constant'

export const setSelect = data => ({ type: SET_CLASSIFIER_SELECT, data })
export const setCategorys = data => ({ type: SET_CLASSIFIER_CATEGORYS, data })
export const setResults = data => ({ type: SET_CLASSIFIER_RESULTS, data })
export const setTaxonomys = data => ({ type: SET_CLASSIFIER_TAXONOMYS, data })
export const appendTaxonomy = data => ({ type: APPEND_CLASSIFIER_TAXONOMY, data })
export const updateTaxonomy = data => ({ type: UPDATE_CLASSIFIER_TAXONOMY, data })
export const updateTaxonomyCategory = data => ({ type: UPDATE_CLASSIFIER_TAXONOMY_CATEGORY, data })
export const appendTaxonomyCategory = data => ({ type: APPEND_CLASSIFIER_TAXONOMY_CATEGORY, data })
export const deleteTaxonomyCategory = data => ({ type: DELETE_CLASSIFIER_TAXONOMY_CATEGORY, data })