import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Table, Input, Popconfirm, Form, Typography, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import EditableTagGroup from './EditableTagGroup'
import { setTaxonomys, updateTaxonomyCategory, appendTaxonomyCategory, deleteTaxonomyCategory } from 'redux/actions/classifier'

interface Item {
    id: number;
    name: string;
    keywords: Array;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'editableTagGroup' | 'text';
    record: Item;
    index: number;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = inputType === 'editableTagGroup' ? <EditableTagGroup editable={true} /> : <Input />;
    const message = inputType === 'editableTagGroup' ? "请添加关键字" : "请输入类别名称";
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: message,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

class EditableTable extends Component {
    state = {
        editingId: undefined,
    }

    isEditing = (record: Item) => record.id === this.state.editingId;

    onDelete = (id: React.Key) => {
        axios.post("/api/bug_operation/delete_category", {
            id
        }).then(
            response => {
                axios.post("/api/bug_operation/get_classifier_setting").then(
                    response => {
                        this.props.setTaxonomys(response.data.data.classifier_setting)
                        message.success(`类别删除成功。`)
                    },
                    error => { }
                )
            },
            error => message.error(`删除失败${error.response.statusText}`)
        )
    }

    onAddCategory = () => {
        this.props.appendTaxonomyCategory({
            tid: this.props.taxonomyId,
            category: {
                id: -1,
                keywords: Array(),
                name: '',
            }
        })
        this.form.setFieldsValue({ name: '', keywords: Array() });
        this.setState({ editingId: -1 })
    }

    save = async (id: React.Key) => {
        try {
            let row: Item = (await this.form.validateFields());

            if (this.state.editingId == -1) {
                let response = await axios.post('/api/bug_operation/create_category', {
                    tid: this.props.taxonomyId,
                    category: { ...row }
                })
                row = response.data.data.category
            }
            else {
                let response = await axios.post('/api/bug_operation/update_category', {
                    category:  { ...row, id: this.state.editingId }
                })
                row = response.data.data.category
            }

            const newCategorys = [...this.props.categorys]
            const index = newCategorys.findIndex(item => id === item.id);

            if (index > -1) {
                const item = newCategorys[index];
                newCategorys.splice(index, 1, {
                    ...item,
                    ...row,
                });

                this.setState({ editingId: undefined });
                this.props.updateTaxonomyCategory({ tid: this.props.taxonomyId, categorys: newCategorys })
            } else {
                newCategorys.push(row);
                this.setState({ editingId: undefined });
                this.props.updateTaxonomyCategory({ tid: this.props.taxonomyId, categorys: newCategorys })
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    edit = (record: Partial<Item> & { id: React.Key }) => {
        this.form.setFieldsValue({ name: '', ...record });
        this.setState({ editingId: record.id });
    };

    cancel = () => {
        if (this.state.editingId == -1)
            this.props.deleteTaxonomyCategory({ tid: this.props.taxonomyId, cid: -1 })
        this.setState({ editingId: undefined })
    }

    columns = [
        {
            title: '类别',
            key: 'name',
            dataIndex: 'name',
            editable: true,
            width: 200,
        },
        {
            title: '关键词',
            key: 'keywords',
            dataIndex: 'keywords',
            editable: true,
            render: (tags, record) => (<EditableTagGroup tags={tags} />),
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 200,
            render: (_: any, record: Item) => {
                const editable = this.isEditing(record);
                return editable ? (
                    <Space>
                        <a onClick={() => this.save(record.id)}>
                            保存
                        </a>
                        <Popconfirm title="确定取消?" okText="是" cancelText="否" onConfirm={this.cancel}>
                            <a>取消</a>
                        </Popconfirm>
                    </Space>
                ) : (
                    <Space>
                        <Typography.Link onClick={() => this.edit(record)} disabled={this.state.editingId !== undefined}>
                            编辑
                        </Typography.Link>
                        {/* onConfirm={this.cancel} */}
                        <Popconfirm title="确定删除?" okText="是" cancelText="否" onConfirm={() => this.onDelete(record.id)} >
                            <a>删除</a>
                        </Popconfirm>
                    </Space >
                );
            },
        },
    ];

    mergedColumns = this.columns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: Item) => ({
                record,
                inputType: col.dataIndex === 'keywords' ? 'editableTagGroup' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: this.isEditing(record),
            }),
        };
    });

    componentDidMount() {
        PubSub.subscribe('classifier.Header.Setting.EditableTable.cancel', (_, data) => {
            const tid = data || this.props.taxonomyId
            if (this.state.editingId == -1)
                this.props.deleteTaxonomyCategory({ tid, cid: -1 })
            this.setState({ editingId: undefined })
        })
    }

    render() {
        // const newCategorys = [...this.props.categorys]
        return (
            <Form ref={e => this.form = e} component={false}>
                <Table
                    rowKey="id"
                    pagination={false}
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    dataSource={this.props.categorys}
                    columns={this.mergedColumns}
                    rowClassName="editable-row"
                />
                <Typography.Link
                    style={{ display: "block", margin: "14px auto 0", width: "fit-content", }}
                    onClick={this.onAddCategory}
                    disabled={this.state.editingId == undefined ? false : true}>
                    <PlusOutlined />添加一个类别
                </Typography.Link>
            </Form>
        )
    }
}

export default connect(
    state => ({
        taxonomys: state.Classifier.taxonomys
    }),
    {
        setTaxonomys,
        updateTaxonomyCategory,
        appendTaxonomyCategory,
        deleteTaxonomyCategory
    }
)(EditableTable)