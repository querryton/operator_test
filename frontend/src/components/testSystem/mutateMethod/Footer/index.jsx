import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import Pagination from 'components/common/Pagination'
import { setMutateMethods, setPagination } from 'redux/actions/mutateMethod'

class Footer extends Component {

    afterLoading = (response, current) => {
        PubSub.publish('mutateMethod.Main.state', {
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
        PubSub.publish('mutateMethod.Main.state', { loading: true })
        axios.post("/api/test_system/mutate_method/get_page", {
            page_index: current,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setMutateMethods(data.mutate_methods)
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
        pagination: state.MutateMethod.pagination
    }),
    {
        setMutateMethods,
        setPagination,
    }
)(Footer)
