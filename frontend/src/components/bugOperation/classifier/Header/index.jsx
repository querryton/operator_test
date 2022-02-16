import React, { Component } from 'react'
import { connect } from 'react-redux'
import PubSub from "pubsub-js"
import axios from 'axios'
import { Button, Select, Modal, message } from 'antd'
import Setting from './Setting'
import './index.css'
import {
  setSelect,
  setCategorys,
  setResults,
  setTaxonomys,
} from 'redux/actions/classifier'

const { Option } = Select;


class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      select: props.select
    }
  }


  classify = () => {
    if (this.state.select.library == undefined) {
      if (this.state.select.taxonomy == undefined)
        message.error('请选择一个库和一个分类字典！')
      else message.error('请选择一个库！');
      return false
    }
    else if (this.state.select.taxonomy == undefined) {
      message.error('请选择一个分类字典！')
      return false
    }
    this.props.setSelect(this.state.select)
    PubSub.publish('classifier.Main.state', { classifying: true })
    axios.post('/api/bug_operation/classify', {
      taxonomy_id: this.state.select.taxonomy
    }).then(
      response => {
        const data = response.data.data
        const result_list = data.results

        var results = new Object()
        for (var i = 0; i < result_list.length; i++) {
          var result = result_list[i]
          if (result['bug'].library != this.state.select.library)
            continue
          if (!results.hasOwnProperty(result['category']))
            results[result['category']] = new Array()
          results[result['category']].push(result['bug'])
        }

        var categorys = Object.keys(results)
        for (var i = 0; i < categorys.length; i++) {
          if (categorys[i] == "null") {
            categorys.splice(i, 1)
            categorys.push("null")
            break
          }
        }

        this.props.setCategorys(categorys)
        this.props.setResults(results)

        PubSub.publish('classifier.Main.state', {
          classifying: false,
          status: {
            statusCode: response.status,
            statusText: response.statusText
          }
        })
      },
      error => {
        const response = error.response
        PubSub.publish('classifier.Main.state', {
          classifying: false,
          status: {
            statusCode: response.status,
            statusText: response.statusText
          }
        })
      }
    )
  }

  showModal = () => {
    this.setState({ visible: true });
  };

  hideModal = () => {
    this.setState({ visible: false });
    PubSub.publish('classifier.Header.Setting.EditableTable.cancel', undefined)
  };


  onLibraryChange = (value) => {
    this.setState({ select: { ...this.state.select, library: value } })
  }

  onTaxonomyChange = (value) => {
    this.setState({ select: { ...this.state.select, taxonomy: value } })
  }


  onBlur() {
    // console.log('blur');
  }

  onFocus() {
    // console.log('focus');
  }

  onSearch(val) {
    // console.log('search:', val);
  }

  componentDidMount() {
    axios.post('/api/bug_operation/get_classifier_setting').then(
      response => {
        this.props.setTaxonomys(response.data.data.classifier_setting)
      },
      error => { }
    )
  }

  render() {
    return (
      <div className="classifier-header-bar">
        <div className="classifier-select-bar">
          <Select
            showSearch
            value={this.state.select.library}
            style={{ width: '50%' }}
            placeholder="选择或搜索一个库"
            optionFilterProp="children"
            onChange={this.onLibraryChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onSearch={this.onSearch}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="tensorflow">Tensorflow</Option>
            <Option value="pyTorch">PyTorch</Option>
          </Select>
          <Select
            showSearch
            value={this.state.select.taxonomy}
            style={{ width: '50%' }}
            placeholder="选择或搜索一个分类字典"
            optionFilterProp="children"
            onChange={this.onTaxonomyChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onSearch={this.onSearch}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {
              this.props.taxonomys.map((item) => {
                return (<Option key={item.id}>{item.name}</Option>)
              })
            }
          </Select>
        </div>
        <div className="classifier-pri">
          <Button type="primary" onClick={this.classify} size="middle" shape="round" block>分&nbsp;&nbsp;&nbsp;&nbsp;类</Button>
        </div>
        <div className="classifier-sub">
          <Button type="link" onClick={this.showModal}>配置分类字典</Button>
        </div>
        <Modal
          title="配置分类字典"
          width={'73%'}
          visible={this.state.visible}
          onCancel={this.hideModal}
          footer={null}
        >
          <Setting />
        </Modal>
      </div>
    )
  }
}

export default connect(
  state => ({
    select: state.Classifier.select,
    taxonomys: state.Classifier.taxonomys
  }),
  {
    setSelect,
    setCategorys,
    setResults,
    setTaxonomys
  }
)(Header)