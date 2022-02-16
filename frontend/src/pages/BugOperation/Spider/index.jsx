import React,{Component} from 'react'
import Header from 'components/bugOperation/spider/Header'
import Main from 'components/bugOperation/spider/Main'
import Footer from 'components/bugOperation/spider/Footer'
export default class Spider extends Component{
    render(){
        return(
            <div>
                <Header></Header>
                <Main></Main>
                <Footer></Footer>
            </div>
        )
    }
}
