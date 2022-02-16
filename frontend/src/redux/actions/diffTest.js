import {
    SET_DIFF_TEST_SETTING,
    SET_DIFF_TEST_STATE,
    EMPTY_DIFF_TEST_RESULTS,
    APPEND_DIFF_TEST_RESULTS,
    APPEND_DIFF_TEST_SUSPECTS,
    SET_DIFF_TEST_SUFFICIENCY
} from 'redux/constant'

import axios from 'axios'
import PubSub from 'pubsub-js'

export const setSetting = data => ({ type: SET_DIFF_TEST_SETTING, data })
export const setState = data => ({ type: SET_DIFF_TEST_STATE, data })
export const emptyResults = () => ({ type: EMPTY_DIFF_TEST_RESULTS, data: undefined })
export const appendResults = data => ({ type: APPEND_DIFF_TEST_RESULTS, data })
export const appendSuspects = data => ({ type: APPEND_DIFF_TEST_SUSPECTS, data })
export const setSufficiency = data => ({ type: SET_DIFF_TEST_SUFFICIENCY, data })
export const appendResultsCycle = (time) => {
    return (dispatch) => {
        var flag = setInterval(() => {
            axios.post('/api/test_system/diff_test/fetch_results').then(
                response => {
                    const data = response.data.data
                    if (data.results.length != 0)
                        dispatch(appendResults(data.results))
                    if (data.suspects.length != 0)
                        dispatch(appendSuspects(data.suspects))
                    dispatch(setSufficiency(data.sufficiency))
                    if (data.end === true) {
                        clearInterval(flag)
                        PubSub.publish('DiffTest.Setting.props.state', 'stop')
                    }
                },
                error => {}
            )
        }, time);
    }
}