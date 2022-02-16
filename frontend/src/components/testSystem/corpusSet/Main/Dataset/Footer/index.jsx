import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import Pagination from 'components/common/Pagination'
import { setDatas, setPagination } from 'redux/actions/corpusSet'

class Footer extends Component {
    afterLoading = (response, current) => {
        PubSub.publish('Dataset.Main.state', {
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
        PubSub.publish('Dataset.Main.state', { loading: true })
        axios.post("/api/test_system/corpus_set/get_page", {
            dataset_name: this.props.datasetName,
            page_index: current,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setDatas(data.datas)
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
                <Pagination {...this.props.pagination} setCurrentPage={this.setCurrentPage} count={5} />
            </div >
        )
    }
}

export default connect(
    state => ({
        pagination: state.CorpusSet.pagination
    }),
    {
        setDatas,
        setPagination,
    }
)(Footer)