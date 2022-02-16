import React, { Component } from 'react'
import Header from 'components/operator/Header'
import Main from 'components/operator/Main'
import Footer from 'components/operator/Footer'

export default class RUDOperator extends Component {
    render() {
        return (
            <div>
                <Header />
                <Main />
                <Footer />
            </div>
        )
    }
}
