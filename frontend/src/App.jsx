import React, { Component } from 'react'
import { Route, withRouter } from 'react-router-dom'
import PubSub from 'pubsub-js'
import { BackTop, Layout, Divider, Breadcrumb } from 'antd';
import LeftMenu from "./components/LeftMenu"
import BugOperation from 'pages/BugOperation'
import Operator from 'pages/Operator'
import TestSystem from 'pages/TestSystem'
import logoImage from './images/logo.png';
import "./App.css"

const { Header, Content, Footer, Sider } = Layout;

const positionName = {
  'bug-operation': 'Bug信息收集与分类',
  'operator': '算子信息管理',
  'test-system': '测试系统',
  'spider': '收集',
  'classifier': '分类',
  'mutate-method': '数据变异方法配置',
  'corpus-set': '语料集配置',
  'diff-test': '梯度计算差分测试'
}

function getPositionArray(pathname) {
  const rank = pathname.split('/')
  let position = new Array()
  rank.map((item) => {
    if (item != '')
      position.push(positionName[item])
  })
  return position
}

class App extends Component {

  constructor(props) {
    super(props)
    let pathname = props.location.pathname
    if (pathname == '/') {
      pathname = '/bug-operation/spider'
      props.history.replace(pathname)
    }
    this.state = {
      position: getPositionArray(pathname),
      collapsed: false
    }
  }

  componentDidMount() {
    PubSub.subscribe('app.pathname', (_, data) => {
      this.setState({ position: getPositionArray(data) })
    })
  }

  render() {
    return (
      // <div>
      //   <nav>
      //     <LeftMenu />
      //   </nav>
      //   <main>
      //     <Route path="/bug-operation" component={BugOperation} />
      //     <Route path="/operator" component={Operator} />
      //     <Route path="/test-system" component={TestSystem} />
      //   </main>
      //   <BackTop />
      // </div>

      <Layout>
        <Header style={{ padding: "0 20px", color: "white", fontSize: '18px', position: 'fixed', zIndex: 1, width: '100%' }}>
          <img src={logoImage} style={{ height: 32, marginRight: 20 }} />
          深度学习算子梯度计算差分测试系统
        </Header>
        <Layout style={{ marginTop: 64 }}>
          <Sider
            className='site-layout-background'
            style={{
              // overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
            }}
            width={220}
            breakpoint="lg"
            collapsedWidth="0"
            // onBreakpoint={broken => { console.log(broken); }}
            onCollapse={(collapsed, type) => {
              // console.log(collapsed, type);
              this.setState({ collapsed })
            }}
          >
            <LeftMenu />
          </Sider>
          <Layout style={this.state.collapsed == false ? { marginLeft: 220, padding: '0 24px ' } : { marginLeft: 0, padding: '0 24px ' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              {this.state.position.map(item => <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>)}
            </Breadcrumb>
            <Content style={{ backgroundColor: 'white', padding: 24, margin: 0, minHeight: 390, }}>
              <Route path="/bug-operation" component={BugOperation} />
              <Route path="/operator" component={Operator} />
              <Route path="/test-system" component={TestSystem} />
            </Content>
            <Footer style={{ textAlign: 'center' }}>Deep Learning Operator Gradient Calculation Differential Test System ©2021 Created by Querry</Footer>
          </Layout>
        </Layout>
      </Layout >
    )
  }
}

export default withRouter(App)