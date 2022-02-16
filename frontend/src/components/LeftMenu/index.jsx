import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PubSub from 'pubsub-js'
import { Menu, Icon } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';

const { SubMenu } = Menu;

class LeftMenu extends Component {
  constructor(props) {
    super(props)
    let pathname = props.location.pathname
    if (pathname == '/') {
      pathname = '/bug-operation/spider'
      props.history.replace(pathname)
    }
    const rank = pathname.split('/')
    this.state = {
      selectedKeys: pathname,
      openKeys: ['/operator', '/' + rank[1]],
    }
  }

  handleClick = e => {
    // console.log('click ', e);
    /*
      {
        domEvent: SyntheticBaseEvent {_reactName: "onClick", _targetInst: null, type: "click", nativeEvent: MouseEvent, target: a.active, …}
        item: MenuItem {props: {…}, context: {…}, refs: {…}, updater: {…}, onKeyDown: ƒ, …}
        key: "/bugOperation/spider"
        keyPath: (2) ["/bugOperation/spider", "/bugOperation"]
      }
    */
    const pathname = e.key
    this.setState({ selectedKeys: pathname })
    this.props.history.push(pathname)
    PubSub.publish('app.pathname', pathname)
  };

  handleOpenChange = e => {
    if (e.length != 0) {
      this.setState({ openKeys: e })
    }
  }


  render() {
    const { selectedKeys, openKeys } = this.state
    return (
      <Menu
        // theme="dark"
        onClick={this.handleClick}
        onOpenChange={this.handleOpenChange}
        style={{ width: '100%' }}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        mode="inline"
      >
        <SubMenu key="/bug-operation" icon={<MailOutlined />} title="Bug信息收集与分类">
          <Menu.Item key="/bug-operation/spider">
            收集
          </Menu.Item>
          <Menu.Item key="/bug-operation/classifier">
            分类
          </Menu.Item>
        </SubMenu>
        <Menu.Item icon={<AppstoreOutlined />} key="/operator">
          算子信息管理
        </Menu.Item>
        <SubMenu key="/test-system" icon={<SettingOutlined />} title="测试管理">
          <Menu.Item key="/test-system/corpus-set">语料集配置</Menu.Item>
          <Menu.Item key="/test-system/mutate-method">数据变异方法配置</Menu.Item>
          <Menu.Item key="/test-system/diff-test">梯度计算差分测试</Menu.Item>
        </SubMenu>
      </Menu>
    )
  }
}

export default withRouter(LeftMenu)