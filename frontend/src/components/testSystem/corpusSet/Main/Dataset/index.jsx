import React, { Component } from 'react'
import Header from './Header'
import Main from './Main'
import Footer from './Footer'

export default class Dataset extends Component {
    render() {
        const { name } = this.props
        return (
            <div>
                <Header datasetName={name} />
                <Main datasetName={name} />
                <Footer datasetName={name} />
            </div>
        )
    }
}
