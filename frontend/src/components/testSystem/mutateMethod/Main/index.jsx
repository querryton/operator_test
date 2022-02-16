import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Skeleton, Result, Empty, Button, List, Checkbox, Row, Col, message } from 'antd';
import MutateMethodItem from './MutateMethodItem'
import { setMutateMethods, setAllMutateMethodsChecked, setPagination } from 'redux/actions/mutateMethod'

const CheckboxGroup = Checkbox.Group;

class Main extends Component {
    state = {
        loading: false,
        status: {
            statusCode: 200,
            statusText: 'OK'
        },
        modalContent: ''
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

    indeterminate = () => {
        const { mutateMethods } = this.props
        var ownTrue, ownFalse = false
        for (var i = 0; i < mutateMethods.length; i++) {
            if (mutateMethods[i].checked == false)
                ownFalse = true
            else ownTrue = true
            if (ownFalse && ownTrue) break
        }
        return ownTrue && ownFalse
    }

    checked = () => {
        const { mutateMethods } = this.props
        for (var i = 0; i < mutateMethods.length; i++) {
            if (mutateMethods[i].checked == false)
                return false
        }
        return true
    }

    handleClickChecked = (event) => {
        const { mutateMethods } = this.props
        axios.post('/api/test_system/mutate_method/set_checkeds', {
            mutate_methods: mutateMethods.map((mutateMethod) => {
                return { ...mutateMethod, checked: !event.target.checked }
            })
        }).then(
            response => this.props.setAllMutateMethodsChecked(!event.target.checked),
            error => message.error(`选中失败,${error.response.statusText}`)
        )
        event.stopPropagation()
    }

    componentDidMount() {
        const mutateMethods = this.props.mutateMethods
        if (mutateMethods.length == 0) {
            this.setState({ loading: true })
            axios.post('/api/test_system/mutate_method/get_page', {
                page_index: 1,
                page_size: 25
            }).then(
                response => {
                    const data = response.data.data
                    this.props.setMutateMethods(data.mutate_methods)
                    this.props.setPagination({
                        pageIndex: 1,
                        totalPages: data.total_pages
                    })
                    this.afterLoading(response)
                },
                error => this.afterLoading(error.response)
            )
        }
        PubSub.subscribe('mutateMethod.Main.state', (_, data) => {
            this.setState(data)
        })
    }

    render() {
        const { mutateMethods } = this.props
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
                <div style={{ minHeight: 600, width: '100%', display: 'table' }}>
                    <Result
                        style={{ display: 'table-cell', verticalAlign: 'middle' }}
                        status="error"
                        title={statusCode + ''}
                        subTitle={statusText}
                    />
                </div>
            )
        }
        if (mutateMethods.length == 0) {
            return (
                <div style={{ minHeight: 600, width: '100%', display: 'table' }}>
                    <Empty style={{ position: 'relative', display: 'table-cell', verticalAlign: 'middle' }} description="暂无数据" />
                </div>
            )
        }
        return (
            <>
                <div className="item-header">
                    <Row>
                        <Col span={2}>
                            <Checkbox
                                onClick={this.handleClickChecked}
                                indeterminate={this.indeterminate()}
                                checked={this.checked()}
                            />
                        </Col>
                        <Col span={4}>
                            <div className='item-description-line'>方法名称</div>
                        </Col>
                        <Col span={15}>
                            <div className='item-description-line'>接口URL</div>
                        </Col>
                        <Col span={3}>
                            <div className='item-description-line'>操作</div>
                        </Col>
                    </Row>
                </div>
                { mutateMethods.map(mutateMethod => (<MutateMethodItem item={mutateMethod} key={mutateMethod.id} />))}
                {/* <Button type="primary">保存</Button>
                <Button>取消</Button> */}
            </>
        )
    }
}

export default connect(
    state => ({ mutateMethods: state.MutateMethod.mutateMethods }),
    {
        setMutateMethods,
        setAllMutateMethodsChecked,
        setPagination
    }
)(Main)
