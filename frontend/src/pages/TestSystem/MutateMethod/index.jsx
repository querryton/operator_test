import React, { Component } from 'react'
import Header from 'components/testSystem/mutateMethod/Header'
import Main from 'components/testSystem/mutateMethod/Main'
import Footer from 'components/testSystem/mutateMethod/Footer'

export default class MutateMethod extends Component {
    render() {
        return (
            <div>
                <Header/>
                <Main/>
                <Footer/>
            </div>
        )
    }
}
