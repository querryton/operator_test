import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Input, Select, Layout } from 'antd'
import { setDatas, setSearch, setPagination } from 'redux/actions/corpusSet'
import './index.css'

const { Search } = Input;
const { Option } = Select;
const { Sider, Content } = Layout;

class Header extends Component {

    state = {
        searchLoading: false,
        field: 'filename'
    }

    onFieldNameChange = value => {
        this.setState({ field: value })
    }

    beforeLoading = () => {
        this.setState({ searchLoading: true })
        PubSub.publish('Dataset.Main.state', { loading: true })
        this.props.setPagination({
            pageIndex: 0,
            totalPages: 0
        })
        this.props.setSearch({
            field: 'filename',
            keywords: ''
        })
    }

    afterLoading = (response) => {
        PubSub.publish('Dataset.Main.state', {
            loading: false,
            status: {
                statusCode: response.status,
                statusText: response.statusText
            }
        })
        this.setState({ searchLoading: false })
    }

    onSearch = value => {
        this.beforeLoading()
        axios.post('/api/test_system/corpus_set/retrieve_page', {
            dataset_name: this.props.datasetName,
            field_name: this.state.field,
            keywords: value,
            page_index: 1,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setDatas(data.datas)
                if (data.datas.length !== 0) {
                    this.props.setSearch({
                        field: this.state.field,
                        keywords: value
                    })
                }
                this.props.setPagination({
                    pageIndex: 1,
                    totalPages: data.total_pages
                })
                this.afterLoading(response)
            },
            error => this.afterLoading(error.response)
        )
    }

    render() {
        const { field, keywords } = this.props.search
        return (
            <div className="dataset-header-bar">
                <Layout>
                    <Sider className="right" width="fit-content">
                        <Select defaultValue={field} onChange={this.onFieldNameChange} style={{ width: 120 }}>
                            <Option value="filename">文件名</Option>
                            <Option value="labelDescription">标签</Option>
                        </Select>
                    </Sider>
                    <Content className="center">
                        <Search
                            placeholder="请输入关键词"
                            defaultValue={keywords}
                            enterButton
                            size="middle"
                            onSearch={this.onSearch}
                            allowClear
                            loading={this.state.searchLoading}
                        />
                    </Content>
                </Layout>
            </div>
        )
    }
}

export default connect(
    state => ({
        search: state.CorpusSet.search
    }),
    {
        setDatas,
        setSearch,
        setPagination,
    }
)(Header)