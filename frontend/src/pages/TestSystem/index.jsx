import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import MutateMethod from './MutateMethod'
import CorpusSet from './CorpusSet'
import DiffTest from './DiffTest'

export default class TestSystem extends Component {
    render() {
        return (
            <div>
                <Route path="/test-system/mutate-method" component={MutateMethod} />
                <Route path="/test-system/corpus-set" component={CorpusSet} />
                <Route path="/test-system/diff-test" component={DiffTest} />
            </div>
        )
    }
}
