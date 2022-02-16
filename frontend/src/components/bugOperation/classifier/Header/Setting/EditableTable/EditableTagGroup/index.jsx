import React, { Component } from 'react'
import { Tag, Input, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default class EditableTagGroup extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inputVisible: false,
            inputValue: '',
            editInputIndex: -1,
            editInputValue: '',
        };
    }


    handleClose = removedTag => {
        const tags = this.state.tags.filter(tag => tag.id !== removedTag.id);
        this.setState({ tags });
        this.props.onChange(tags)
    };

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    };

    handleInputChange = e => {
        this.setState({ inputValue: e.target.value });
    };

    handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { tags } = this.state;
        const tagsFiltered = tags.filter(tag => tag.keyword === inputValue)
        if (inputValue && tagsFiltered.length == 0) {
            tags = [...tags, { id: -1 * (tags.length + 1), keyword: inputValue }];//此处要修改！！！！！！！！！！！！1
        }
        // console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
        this.props.onChange(tags)
    };

    handleEditInputChange = e => {
        this.setState({ editInputValue: e.target.value });
    };

    handleEditInputConfirm = () => {
        this.setState(
            ({ tags, editInputIndex, editInputValue }) => {
                const newTags = [...tags];
                newTags[editInputIndex].keyword = editInputValue;
                this.props.onChange(newTags)
                return {
                    tags: newTags,
                    editInputIndex: -1,
                    editInputValue: '',
                };
            }
        );
    };

    saveInputRef = input => {
        this.input = input;
    };

    saveEditInputRef = input => {
        this.editInput = input;
    };

    static getDerivedStateFromProps(props) {
        return {
            tags: props.tags || props.value || [],
        }
    }

    render() {
        const { tags, inputVisible, inputValue, editInputIndex, editInputValue } = this.state;
        return (
            <>
                {tags.map((tag, index) => {
                    if (editInputIndex === index) {
                        return (
                            <Input
                                ref={this.saveEditInputRef}
                                key={tag.id}
                                size="small"
                                className="tag-input"
                                value={editInputValue}
                                onChange={this.handleEditInputChange}
                                onBlur={this.handleEditInputConfirm}
                                onPressEnter={this.handleEditInputConfirm}
                            />
                        );
                    }

                    const isLongTag = tag.keyword.length > 20;

                    const tagElem = (
                        <Tag
                            className="edit-tag"
                            key={tag.id}
                            closable={this.props.editable}
                            onClose={() => this.handleClose(tag)}
                        >
                            <span
                                onDoubleClick={e => {
                                    if (this.props.editable) {
                                        this.setState({ editInputIndex: index, editInputValue: tag.keyword }, () => {
                                            this.editInput.focus();
                                        });
                                        e.preventDefault();
                                    }
                                }}
                            >
                                {isLongTag ? `${tag.keyword.slice(0, 20)}...` : tag.keyword}
                            </span>
                        </Tag>
                    );
                    return isLongTag ? (
                        <Tooltip title={tag.keyword} key={tag.id}>
                            {tagElem}
                        </Tooltip>
                    ) : (
                        tagElem
                    );
                })}
                {this.props.editable && inputVisible && (
                    <Input
                        ref={this.saveInputRef}
                        type="text"
                        size="small"
                        className="tag-input"
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                )}
                {this.props.editable && !inputVisible && (
                    <Tag className="site-tag-plus" onClick={this.showInput}>
                        <PlusOutlined /> 添加关键字
                    </Tag>
                )}
            </>
        );
    }
}

