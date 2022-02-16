import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import Spider from './Spider'
import Classifier from './Classifier'   

export default class BugOperation extends Component {
    render() {
        return (
            <div>
                <Route path="/bug-operation/spider" component={Spider} />
                <Route path="/bug-operation/classifier" component={Classifier} />
            </div>
        )
    }
}