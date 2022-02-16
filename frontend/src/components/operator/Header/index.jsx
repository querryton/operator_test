import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Input, Select, Layout, Modal } from 'antd'
import CreateOperator from './CreateOperator'
import { setOperators, setSearch, setPagination } from 'redux/actions/RUDoperator'
import './index.css'

const { Search } = Input;
const { Option } = Select;
const { Sider, Content } = Layout;

class Header extends Component {
    state = {
        searchLoading: false,
        field: 'name'
    }

    showModal = () => {
        this.setState({ visible: true });
    };

    hideModal = () => {
        this.setState({ visible: false });
    };

    onFieldNameChange = value => {
        this.setState({ field: value })
    }

    beforeLoading = () => {
        this.setState({ searchLoading: true })
        PubSub.publish('RUDOperation.Main.state', { loading: true })
        this.props.setPagination({
            pageIndex: 0,
            totalPages: 0
        })
        this.props.setSearch({
            field: 'name',
            keywords: ''
        })
    }

    afterLoading = (response) => {
        PubSub.publish('RUDOperation.Main.state', {
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
        axios.post('/api/operator_management/retrieve_operator_page', {
            field_name: this.state.field,
            keywords: value,
            page_index: 1,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setOperators(data.operators)
                if (data.operators.length !== 0) {
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
            <div className="operator-header-bar">
                <Layout>
                    <Sider className="right" width="fit-content">
                        <Select defaultValue={field} onChange={this.onFieldNameChange} style={{ width: 120 }}>
                            <Option value="name">算子名称</Option>
                            <Option value="library">库名称</Option>
                        </Select>
                    </Sider>
                    <Content className="center">
                        <Search
                            defaultValue={keywords}
                            placeholder="请输入关键词"
                            enterButton
                            size="middle"
                            onSearch={this.onSearch}
                            allowClear
                            loading={this.state.searchLoading}
                        />
                    </Content>
                    <Sider className="left" width="fit-content">
                        <button className="add-button" onClick={this.showModal} >添 加</button>
                    </Sider>
                </Layout>
                <Modal
                    title="添加算子"
                    width={'73%'}
                    visible={this.state.visible}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <CreateOperator hideModal={this.hideModal} />
                </Modal>
            </div>
        )
    }
}

export default connect(
    state => ({
        search: state.RUDOperator.search
    }),
    {
        setOperators,
        setSearch,
        setPagination
    }
)(Header)
