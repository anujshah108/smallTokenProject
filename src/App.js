import React, { Component } from 'react'
import AnujTokenContract from '../build/contracts/AnujToken.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      instance:{},
      accounts:[],
      totalSupply:0,
      buyPrice:0,
      yourTokens:0,
      ownerTokens:0,
      purchaseAmount:0
    }

    this.purchaseToken = this.purchaseToken.bind(this)
  }

  componentWillMount() {

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
  
    const contract = require('truffle-contract')
    const AnujToken = contract(AnujTokenContract)
    AnujToken.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    let AnujTokenInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
       AnujToken.deployed()
       .then((instance) => {
          AnujTokenInstance = instance
          this.setState({instance, accounts})
          return AnujTokenInstance.totalSupply()
       })
       .then((totalSupply) => {
          this.setState({ totalSupply: (totalSupply.toNumber()/Math.pow(10,18))})
          return AnujTokenInstance.buyPrice()
       })
       .then((buyPrice) => {
          this.setState({ buyPrice: buyPrice.toNumber()})
          return AnujTokenInstance.owner()
       })
        .then((owner) => {
          return AnujTokenInstance.balanceOf(owner)
       })
        .then((ownerTokens) => {
          this.setState({ ownerTokens: (ownerTokens.toNumber()/Math.pow(10,18)).toFixed(18)})
          return AnujTokenInstance.balanceOf(accounts[0])
       })
        .then((yourTokens) => {
          this.setState({ yourTokens: (yourTokens.toNumber()/Math.pow(10,18)).toFixed(18)})
        // return AnujTokenInstance.balanceOf(accounts[0])
       })
    })
  }

  purchaseToken(event){
    event.preventDefault()
    this.state.instance.buy({from:this.state.accounts[0], value:this.state.purchaseAmount})
    .then(tx =>{
      alert(`You just purchased ${(this.state.purchaseAmount/(this.state.buyPrice*Math.pow(10,18))).toFixed(18)} AnujTokens!`)
      let tokenUser = ((this.state.yourTokens*Math.pow(10,18) + this.state.purchaseAmount/this.state.buyPrice)/Math.pow(10,18)).toFixed(18)
      let tokensLeft = ((this.state.ownerTokens*Math.pow(10,18) - this.state.purchaseAmount/this.state.buyPrice)/Math.pow(10,18)).toFixed(18)
      this.setState({yourTokens:tokenUser, ownerTokens:tokensLeft, purchaseAmount:0})
    })
    .catch(error => {
      alert("There was an error with your transaction!")
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">AnujToken Sale</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Welcome to the AnujToken Sale!</h1>
              <h2>AnujToken Address: {this.state.instance.address}</h2>
              <h3>Total Supply of AnujToken: {this.state.totalSupply}</h3>
              <h3>Buy Price of AnujToken: {this.state.buyPrice} Ether (10^18 Wei)</h3>
              <h3>Amount of Available AnujTokens: {this.state.ownerTokens} </h3>
              <h3>Amount of Your Current AnujTokens: {this.state.yourTokens} </h3>
              <hr/>
              <h2>Purchase Some Tokens Here! </h2>
              <h3>You must enter at least {this.state.buyPrice} Wei. With the current amount entered you will receive {(this.state.purchaseAmount/(this.state.buyPrice*Math.pow(10,18))).toFixed(18)} AnujTokens! </h3>
              <form onSubmit={this.purchaseToken}>            
              <h4> Enter Amount of Wei Here: </h4>
              <input value={this.state.purchaseAmount} onChange={e => this.setState({purchaseAmount: e.target.value })}/>
              <br/>
              <br/>
              <button type="submit"> SUBMIT </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
