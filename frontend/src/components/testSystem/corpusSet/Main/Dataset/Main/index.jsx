import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Row, Col, Skeleton, Result, Empty, Button } from 'antd'
import DataItem from './DataItem'
import { setDatas, setPagination } from 'redux/actions/corpusSet'

class Main extends Component {

    state = {
        loading: false,
        status: {
            statusCode: 200,
            statusText: 'OK'
        }
    }

    afterLoading = (response) => {
        this.setState({
            loading: false,
            status: {
                statusCode: response.status,
                statusText: response.statusText
            }
        })
    }

    loadData = () => {
        this.setState({ loading: true })
        axios.post('/api/test_system/corpus_set/get_page', {
            dataset_name: this.props.datasetName,
            page_index: 1,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setDatas(data.datas)
                this.props.setPagination({
                    pageIndex: 1,
                    totalPages: data.total_pages
                })
                this.afterLoading(response)
            },
            error => this.afterLoading(error.response)
        )
    }

    componentDidMount() {
        const datas = this.props.datas
        if (datas.length == 0)
            this.loadData()
        PubSub.subscribe('Dataset.Main.state', (_, data) => {
            this.setState(data)
        })
    }

    render() {
        const { datas, selectedData } = this.props
        const { loading } = this.state
        const { statusCode, statusText } = this.state.status

        if (loading == true) {
            return (
                <div>
                    <Skeleton active />
                    <Skeleton active />
                    <Skeleton active />
                    <Skeleton active />
                </div>)
        }
        if (statusCode != 200) {
            return (
                <Result
                    status="error"
                    title={statusCode + ''}
                    subTitle={statusText}
                    extra={<Button type="primary" type="link" onClick={this.loadData}>重新加载</Button>}
                />
            )
        }
        if (datas.length == 0) {
            return (
                <Empty description="暂无数据" />
            )
        }
        return (
            <>
                <div className="item-header">
                    <Row>
                        <Col span={18}><div className='item-description-line'>文件名</div></Col>
                        <Col span={6}><div className='item-description-line'>标签</div></Col>
                    </Row>
                </div>
                {
                    datas.map((data) => {
                        return (<DataItem item={data} key={data.id} />)
                    })
                }
            </>
        )
    }
}

export default connect(
    state => ({
        datas: state.CorpusSet.datas,
    }),
    {
        setDatas,
        setPagination,
    }
)(Main)
