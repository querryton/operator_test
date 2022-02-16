import React,{Component} from "react"
import Header from "components/bugOperation/classifier/Header"
import Main from "components/bugOperation/classifier/Main"
export default class Classifier extends Component{
    render(){
        return(
            <div>
                <Header></Header>
                <Main></Main>
            </div>
        )
    }
}
