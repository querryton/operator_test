import React, { Component } from 'react'
import { connect } from 'react-redux'
import PubSub from "pubsub-js"
import axios from 'axios'
import { message, Button, Select } from 'antd'
import './index.css'
import {
  setBugs,
  setLibrary,
  setPage,
  setPagination,
} from 'redux/actions/spider'

const { Option } = Select;

class Header extends Component {

  constructor(props) {
    super(props)
    this.state = {
      library: props.library
    }
  }

  beforeCrawl() {
    this.props.setLibrary(this.state.library)
    if (this.state.library == undefined) {
      message.error('请选择一个库！');
      return false
    }
    PubSub.publish('spider.Main.state', { loading: true, })
    this.props.setPage(0)
    this.props.setPagination({
      pageIndex: 0,
      totalPages: 0
    })
    this.props.setBugs([])
    return true
  }

  afterCrawl(response) {
    const data = response.data.data
    PubSub.publish('spider.Main.state',
      {
        loading: false,
        status: {
          statusCode: response.status,
          statusText: response.statusText
        }
      }
    )
  }

  crawling = () => {
    const choosed = this.beforeCrawl()
    if (choosed == false) return false
    axios.post('/api/bug_operation/get_bugs', {
      library: this.state.library,
      page: 1
    }).then(
      response => {
        const data = response.data.data
        this.props.setBugs(data.bugs)
        this.props.setPage(data.next_page)
        this.afterCrawl(response)
      },
      error => this.afterCrawl(error.response)
    )
  }

  crawlingAll = () => {
    const choosed = this.beforeCrawl()
    if (choosed == false) return false
    axios.post('/api/bug_operation/get_all_bugs', {
      library: this.props.library,
    }).then(
      response => {
        const data = response.data.data
        this.props.setBugs(data.bugs)
        this.afterCrawl(response)
      },
      error => this.afterCrawl(error.response)

    )
  }

  getFromDatabase = () => {
    const choosed = this.beforeCrawl()
    if (choosed == false) return false
    axios.post('/api/bug_operation/get_bugs_from_database', {
      library: this.props.library,
      page_index: 1,
      page_size: 25
    }).then(
      response => {
        const data = response.data.data
        this.props.setBugs(data.bugs)
        this.afterCrawl(response)
        this.props.setPagination({
          pageIndex: 1,
          totalPages: data.total_pages
        })
      },
      error => this.afterCrawl(error.response)
    )
  }


  onChange = (value) => {
    this.setState({ library: value })
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

  render() {
    return (
      <div className="spider-header-bar">
        <div className="spider-select-bar">
          <Select
            showSearch
            value={this.state.library}
            style={{ width: '100%' }}
            placeholder="选择或搜索一个库"
            optionFilterProp="children"
            onChange={this.onChange}
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
        </div>
        <div className="spider-pri">
          <Button type="primary" onClick={this.crawling} size="middle" shape="round" block>爬&nbsp;&nbsp;&nbsp;&nbsp;取</Button>
        </div>
        <div className="spider-sub">
          <a onClick={this.crawlingAll}>爬取全部</a>
          <a onClick={this.getFromDatabase}>从数据库中获取</a>
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({ library: state.Spider.library }),
  {
    setBugs,
    setLibrary,
    setPage,
    setPagination
  }

)(Header)