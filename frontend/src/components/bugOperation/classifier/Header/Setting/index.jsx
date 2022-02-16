import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Select, Button, Divider, Input, Table, Tag, Space, Typography, Popconfirm, Tooltip, Popover, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import EditableTable from './EditableTable'
import {
    setTaxonomys,
    appendTaxonomy,
    updateTaxonomy,
} from 'redux/actions/classifier'
import './index.css'

const gridStyle = {
    width: '50%',
    textAlign: 'center',
};

const { Option } = Select;

class Setting extends Component {

    state = {
        addTaxonomyName: '',
        editTaxonomyName: '',
        taxonomyId: undefined,
        popoverVisible: false
    }


    hidePopover = () => {
        this.setState({
            popoverVisible: false,
        });
    };

    handlePopoverVisibleChange = visible => {
        this.setState({ popoverVisible: visible });
    };

    addTaxonomy = () => {
        const { addTaxonomyName } = this.state;
        if (addTaxonomyName == '') {
            message.error("请输入分类字典名称")
            return
        }
        const taxonomy = {
            name: addTaxonomyName,
        }
        axios.post('/api/bug_operation/create_taxonomy', {
            taxonomy
        }).then(
            response => {
                const data = response.data.data
                this.props.appendTaxonomy({ ...data.taxonomy, categorys: Array() })
                this.setState({
                    addTaxonomyName: '',
                });
            },
            error => { }
        )
    };

    onSelectChange = value => {
        PubSub.publish('classifier.Header.Setting.EditableTable.cancel', this.state.taxonomyId)
        this.setState({ taxonomyId: value })
    }

    onInputTaxonomyChange = event => {
        this.setState({
            addTaxonomyName: event.target.value,
        });
    };

    onEditTaxonomyNameChange = event => {
        this.setState({
            editTaxonomyName: event.target.value,
        })
    }

    onEditButton = () => {
        const name = this.props.taxonomys.filter(taxonomy => taxonomy.id == this.state.taxonomyId)[0].name
        this.setState({ editTaxonomyName: name })
    }

    onEditTaxonomyName = () => {
        const { editTaxonomyName } = this.state;
        if (editTaxonomyName == '') {
            message.error("请输入修改后的分类字典名称")
            return
        }
        const taxonomy = {
            id: this.state.taxonomyId,
            name: editTaxonomyName,
        }
        axios.post('/api/bug_operation/update_taxonomy', {
            taxonomy
        }).then(
            response => {
                const data = response.data.data
                this.props.updateTaxonomy(data.taxonomy)
                this.hidePopover()
                message.success("修改成功")
            },
            error => { }
        )
    }

    onDeleteTaxonomy = () => {
        const index = this.props.taxonomys.findIndex(taxonomy => taxonomy.id == this.state.taxonomyId)
        axios.post('/api/bug_operation/delete_taxonomy', {
            id: this.state.taxonomyId
        }).then(
            response => {
                axios.post("/api/bug_operation/get_classifier_setting").then(
                    response => {
                        this.props.setTaxonomys(response.data.data.classifier_setting)
                        if (index == 0) this.setState({ taxonomyId: undefined })
                        else if (index == this.props.taxonomys.length) this.setState({ taxonomyId: this.props.taxonomys[index - 1].id })
                        else this.setState({ taxonomyId: this.props.taxonomys[index].id })
                        message.success(`分类字典删除成功。`)
                    },
                    error => { }
                )
            },
            error => { }
        )
    }

    componentDidMount() {
        this.setState({
            taxonomyId: this.props.taxonomys[0].id
        })
        axios.post('/api/bug_operation/get_classifier_setting').then(
            response => {
                this.setState({
                    classifierSetting: response.data.data.classifier_setting
                })
            },
            error => { }
        )
    }

    render() {
        const taxonomysFiltered = this.props.taxonomys.filter(s => s.id == this.state.taxonomyId)
        const categorys = taxonomysFiltered.length == 0 ? [] : taxonomysFiltered[0].categorys
        return (
            <div>
                <div style={{ paddingLeft: 16, marginBottom: 14 }}>
                    分类字典：
                    <Select
                        showSearch
                        value={this.state.taxonomyId}
                        onChange={this.onSelectChange}
                        style={{ width: 200 }}
                        placeholder="选择或搜索一个分类字典"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                        }
                        dropdownRender={menu => (
                            <div>
                                {menu}
                                <Divider style={{ margin: '4px 0' }} />
                                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 4 }}>
                                    <Input style={{ flex: 'auto' }} value={this.state.addTaxonomyName} onChange={this.onInputTaxonomyChange} />
                                    <a
                                        style={{ flex: 'none', padding: '4px', display: 'block', cursor: 'pointer' }}
                                        onClick={this.addTaxonomy}
                                    >
                                        <PlusOutlined /> 添加
                                    </a>
                                </div>
                            </div>
                        )}
                    >
                        {
                            this.props.taxonomys.map((item) => {
                                return (
                                    <Option value={item.id} key={item.id}>
                                        {item.name}
                                    </Option>
                                )
                            })
                        }
                    </Select>
                    <Space style={{ marginLeft: 14 }}>

                        <Popover
                            visible={this.state.popoverVisible}
                            onVisibleChange={this.handlePopoverVisibleChange}
                            content={(
                                <Space>
                                    <Input onChange={this.onEditTaxonomyNameChange} value={this.state.editTaxonomyName} style={{ width: 150 }} />
                                    <Button type="primary" onClick={this.onEditTaxonomyName}>确定</Button>
                                </Space>
                            )}
                            trigger="click"
                        >
                            <Tooltip placement="bottom" title="修改此字典名称">
                                <Button
                                    size="small"
                                    shape="circle"
                                    icon={<EditOutlined />}
                                    onClick={this.onEditButton}
                                    disabled={this.props.taxonomys.length == 0 ? true : false}
                                />
                            </Tooltip>
                        </Popover>
                        <Popconfirm title="确定删除?" okText="是" cancelText="否" onConfirm={this.onDeleteTaxonomy} >
                            <Tooltip placement="bottom" title="删除此字典">
                                <Button
                                    size="small"
                                    shape="circle"
                                    icon={<DeleteOutlined
                                        disabled={this.props.taxonomys.length == 0 ? true : false}
                                    />} />
                            </Tooltip>
                            {/* <a style={{ marginLeft: 16 }} disable={this.props.taxonomys.length == 0 ? true : false}>删除此字典</a> */}
                        </Popconfirm>
                    </Space>
                </div>
                <EditableTable taxonomyId={this.state.taxonomyId} categorys={categorys} />
            </div >
        )
    }
}

export default connect(
    state => ({
        taxonomys: state.Classifier.taxonomys
    }),
    {
        setTaxonomys,
        appendTaxonomy,
        updateTaxonomy
    }
)(Setting)