import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Input, Select, Layout, Modal, Form, Button, message } from 'antd'
import { setMutateMethods, appendMutateMethod, setSearch, setPagination } from 'redux/actions/mutateMethod'
import './index.css'

const { Search } = Input;
const { Option } = Select;
const { Sider, Content } = Layout;

const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
};
const tailLayout = {
    wrapperCol: { offset: 3, span: 21 },
};

class Header extends Component {
    state = {
        searchLoading: false,
        field: 'name',
    }

    selectBefore = (
        <Form.Item name="protocol" rules={[{ required: true }]} initialValue="http://" noStyle>
            <Select className="protocol-select-before">
                <Option value="http://">http://</Option>
                <Option value="https://">https://</Option>
            </Select>
        </Form.Item>
    );

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
        PubSub.publish('mutateMethod.Main.state', { loading: true })
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
        PubSub.publish('mutateMethod.Main.state', {
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
        axios.post('/api/test_system/mutate_method/retrieve_page', {
            field_name: this.state.field,
            keywords: value,
            page_index: 1,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setMutateMethods(data.mutate_methods)
                if (data.mutate_methods.length !== 0) {
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

    onFinish = (values: any) => {
        values.url = values.protocol + values.pathname
        delete values.protocol
        delete values.pathname
        axios.post('/api/test_system/mutate_method/create', {
            mutate_method: values
        }).then(
            response => {
                const status = response.data.status
                console.log(status.code);
                if (status.code == 100007)
                    message.error('???URL??????????????????????????????');
                else {
                    const data = response.data.data
                    this.props.appendMutateMethod(data.mutate_method)
                    this.hideModal()
                    this.formRef.resetFields();
                    message.success('?????????????????????????????????');
                }
            },
            error => {
                message.error(`???????????????${error.response.statusText}`);
            }
        )
    };

    onFinishFailed = (errorInfo: any) => {
        // console.log('Failed:', errorInfo);
    };

    onReset = () => {
        this.formRef.resetFields();
    };


    render() {
        const { field, keywords } = this.props.search
        return (
            <div className="mutate-method-header">
                <Layout>
                    <Sider className="right" width="fit-content">
                        <Select defaultValue={field} style={{ width: "120px" }} onChange={this.onFieldNameChange}>
                            <Option value="name">????????????</Option>
                            <Option value="url">??????URL</Option>
                        </Select>
                    </Sider>
                    <Content className="center">
                        <Search
                            placeholder="??????????????????"
                            defaultValue={keywords}
                            enterButton
                            size="middle"
                            onSearch={this.onSearch}
                            allowClear
                            loading={this.state.searchLoading}
                        />
                    </Content>
                    <Sider className="left" width="fit-content">
                        <button className="add-button" onClick={this.showModal}>??? ???</button>
                    </Sider>
                </Layout>
                <Modal
                    title="????????????????????????"
                    width={'40%'}
                    visible={this.state.visible}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <Form
                        ref={e => this.formRef = e}
                        {...layout}
                        name="control-ref"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                    >
                        <Form.Item name="name" label="????????????" rules={[{ required: true, message: "?????????????????????" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="pathname" label="??????URL" rules={[{ required: true, message: "???????????????URL" }]}>
                            <Input addonBefore={this.selectBefore} />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Button type="primary" htmlType="submit">?????? </Button>
                            <Button htmlType="button" onClick={this.onReset}>?????? </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    }
}

export default connect(
    state => ({
        search: state.MutateMethod.search
    }),
    {
        setMutateMethods,
        appendMutateMethod,
        setSearch,
        setPagination
    }
)(Header)