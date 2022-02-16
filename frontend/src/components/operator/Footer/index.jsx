import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import Pagination from 'components/common/Pagination'
import { setOperators, setPagination } from 'redux/actions/RUDoperator'

class Footer extends Component {

    afterLoading = (response, current) => {
        PubSub.publish('RUDOperation.Main.state', {
            loading: false,
            status: {
                statusCode: response.status,
                statusText: response.statusText
            }
        })
        this.props.setPagination({
            pageIndex: current,
            totalPages: this.props.pagination.totalPages
        })
        window.scrollTo(0, 0)
    }

    setCurrentPage = current => () => {
        PubSub.publish('RUDOperation.Main.state', { loading: true })
        axios.post("/api/operator_management/get_operator_page", {
            page_index: current,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setOperators(data.operators)
                this.afterLoading(response, current)
            },
            error => this.afterLoading(error.response, current)
        )
    }


    render() {
        const { totalPages } = this.props.pagination
        return (
            <div className='footer-pagination'
                style={{ 'display': totalPages == 0 ? 'none' : 'block' }}
            >
                <Pagination {...this.props.pagination} setCurrentPage={this.setCurrentPage} />
            </div >
        )
    }
}

export default connect(
    state => ({
        pagination: state.RUDOperator.pagination
    }),
    {
        setOperators,
        setPagination
    }
)(Footer)