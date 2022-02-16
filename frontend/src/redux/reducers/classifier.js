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

const init = {
    select: {
        library: undefined,
        taxonomy: undefined
    },
    taxonomys: [],
    categorys: [],
    results: {},
}

export default function classifierReducer(pre = init, action) {
    const { type, data } = action
    switch (type) {
        case SET_CLASSIFIER_SELECT:
            return {
                ...pre,
                select: data
            }
        case SET_CLASSIFIER_CATEGORYS:
            return {
                ...pre,
                categorys: data,
            }
        case SET_CLASSIFIER_RESULTS:
            return {
                ...pre,
                results: data
            }
        case SET_CLASSIFIER_TAXONOMYS:
            return {
                ...pre,
                taxonomys: data
            }
        case APPEND_CLASSIFIER_TAXONOMY:
            return {
                ...pre,
                taxonomys: [...pre.taxonomys, data]
            }
        case UPDATE_CLASSIFIER_TAXONOMY:
            var taxonomyIndex = pre.taxonomys.findIndex(taxonomy => data.id == taxonomy.id);
            var newTaxonomys = [...pre.taxonomys]
            newTaxonomys[taxonomyIndex] = {...newTaxonomys[taxonomyIndex], name: data.name }
            return {
                ...pre,
                taxonomys: newTaxonomys
            }
        case UPDATE_CLASSIFIER_TAXONOMY_CATEGORY:
            var taxonomyIndex = pre.taxonomys.findIndex(taxonomy => data.tid == taxonomy.id);
            var newTaxonomys = [...pre.taxonomys]
            newTaxonomys[taxonomyIndex].categorys = [...data.categorys]
            return {
                ...pre,
                taxonomys: newTaxonomys
            }
        case APPEND_CLASSIFIER_TAXONOMY_CATEGORY:
            var taxonomyIndex = pre.taxonomys.findIndex(taxonomy => data.tid == taxonomy.id);
            var newTaxonomys = [...pre.taxonomys]
            newTaxonomys[taxonomyIndex].categorys = [...newTaxonomys[taxonomyIndex].categorys, data.category]
            return {
                ...pre,
                taxonomys: newTaxonomys
            }
        case DELETE_CLASSIFIER_TAXONOMY_CATEGORY:
            var taxonomyIndex = pre.taxonomys.findIndex(taxonomy => data.tid == taxonomy.id);
            var newTaxonomys = [...pre.taxonomys]
            newTaxonomys[taxonomyIndex].categorys = newTaxonomys[taxonomyIndex].categorys.filter(category => category.id != data.cid)
            return {
                ...pre,
                taxonomys: newTaxonomys
            }
        default:
            return pre
    }
}