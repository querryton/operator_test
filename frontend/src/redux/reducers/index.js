import { combineReducers } from 'redux'
import Spider from 'redux/reducers/spider'
import Classifier from 'redux/reducers/classifier'
import RUDOperator from 'redux/reducers/RUDoperator'
import MutateMethod from 'redux/reducers/mutateMethod'
import CorpusSet from 'redux/reducers/corpusSet'
import DiffTest from 'redux/reducers/diffTest'

export default combineReducers({
    Spider,
    Classifier,
    RUDOperator,
    MutateMethod,
    CorpusSet,
    DiffTest,
})