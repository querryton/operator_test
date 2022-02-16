import {
    SET_DIFF_TEST_SETTING,
    SET_DIFF_TEST_STATE,
    EMPTY_DIFF_TEST_RESULTS,
    APPEND_DIFF_TEST_RESULTS,
    APPEND_DIFF_TEST_SUSPECTS,
    SET_DIFF_TEST_SUFFICIENCY
} from 'redux/constant'

const init = {
    setting: {
        library1: 'tensorflow',
        library2: 'pytorch',
        iterate_times: 500,
        batch_size: 128,
        diff_threshold: 0.0000001,
        active_value: 0.001,
    },
    state: 'stop',
    results: [],
    suspects: [],
    sufficiency: {
        'tensorflow': 0.0,
        'pytorch': 0.0
    }
}

export default function corpusSetReducer(pre = init, action) {
    const { type, data } = action
    switch (type) {
        case SET_DIFF_TEST_SETTING:
            return {
                ...pre,
                setting: data
            }
        case SET_DIFF_TEST_STATE:
            return {
                ...pre,
                state: data
            }
        case EMPTY_DIFF_TEST_RESULTS:
            return {
                ...pre,
                results: [],
                suspects: []
            }
        case APPEND_DIFF_TEST_RESULTS:
            return {
                ...pre,
                results: data.length == 0 ? pre.results : [...pre.results, ...data]
            }
        case APPEND_DIFF_TEST_SUSPECTS:
            return {
                ...pre,
                suspects: data.length == 0 ? pre.suspects : [...pre.suspects, ...data]
            }
        case SET_DIFF_TEST_SUFFICIENCY:
            return {
                ...pre,
                sufficiency: data
            }
        default:
            return pre
    }
}