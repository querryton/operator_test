import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Spin, Button, message } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import Pagination from 'components/common/Pagination'
import { appendBugs, setPage, setBugs, setPagination } from 'redux/actions/spider'

class Footer extends Component {
    state = {
        loading: false,
    }

    afterLoading = (response, current) => {
        PubSub.publish('spider.Main.state', {
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
        PubSub.publish('spider.Main.state', { loading: true })
        axios.post("/api/bug_operation/get_bugs_from_database", {
            library: this.props.library,
            page_index: current,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setBugs(data.bugs)
                this.afterLoading(response, current)
            },
            error => this.afterLoading(error.response, current)
        )
    }

    getMore = () => {
        this.setState({ loading: true })
        axios.post('/api/bug_operation/get_bugs', {
            library: this.props.library,
            page: this.props.page
        }).then(
            response => {
                const data = response.data.data
                this.props.appendBugs(data.bugs)
                this.props.setPage(data.next_page)
                this.setState({ loading: false })
            },
            error => message.error(`无法获取更多，${error.response.statusText}`)
        )
    }

    componentDidMount() {
        PubSub.subscribe('spider.Footer.state', (msg, data) => {
            this.setState(data)
        })
    }

    render() {
        const { loading } = this.state
        const { page, pagination } = this.props
        return (
            <div className="footer-pagination" style={{ 'display': page == 0 && pagination.totalPages == 0 ? 'none' : 'block' }}> {
                pagination.totalPages != 0 ?
                    <Pagination {...this.props.pagination} setCurrentPage={this.setCurrentPage} /> :
                    <Button
                        type="link"
                        block
                        onClick={this.getMore}
                        loading={loading ? true : false}
                        icon={<DownOutlined />}
                    >
                        获取更多
                    </Button>
            }
            </div >
        )
    }
}

export default connect(
    state => ({
        library: state.Spider.library,
        page: state.Spider.page,
        pagination: state.Spider.pagination,
    }),
    {
        appendBugs,
        setBugs,
        setPage,
        setPagination
    }
)(Footer)