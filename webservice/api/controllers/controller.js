'use strict';

module.exports = (web3) => {
  var tufa = require('../models/tufa')(web3);
  const users = [];
  const register = (req, res) => {
    console.log('Register');
    console.log(req.body);
    const user = req.body;
    user.token = 0;
    users.push(user);
    res.json({
      status: 'OK'
    });
  };

  class SessionUser {
    constructor(user, verifier){
      this.email = user.email;
      this.address = user.address;
      this.token = user.token;
      this.verifier = verifier;
      this.tokenVerification = false;
    }
  }

  const nextToken = (previous) => {
    const min = 1;
    //it will provide big and save integer for JS
    const max = Math.pow(10, 15);
    function getRandomInt() {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    let newToken = getRandomInt();
    while(previous == newToken) {
      newToken = getRandomInt();
    }
    return newToken;
  }


  const login = (req, res) => {
    console.log('Login');
    console.log(req.body);
    const loginData = req.body;
    const user = users.find(u => u.email == loginData.email);
    if (req.session.user) {
      console.log('Existing session...');
      res.json({
        status: 'OK',
        user: req.session.user
      });
    } else if (user && user.password === loginData.password) {
      console.log('New session');
      user.token = nextToken(user.token);
      req.session.user = new SessionUser(user, tufa.account);
      res.json({
        status: 'OK',
        user: req.session.user
      });
    } else {
      res.status(401).send({ error: 'Login unsuccessful' })
    }
  };

  const getUser = (req, res) => {
    if (req.session.user) {
      res.json({
        status: 'OK',
        user: req.session.user
      });
    } else {
      res.status(404).send();
    }    
  }; 

  const verify = (req, res) => {
    console.log(req.body);
    if (!req.session.user) {
      res.status(401).send({ error: 'Login with password first' })
    } else {
      console.log('Verify...');
      console.log(req.session.user);
      if (req.session.user && req.session.user.tokenVerification) {
        res.json({
          status: 'OK'
        });
      } else {
        const user = req.session.user;
        console.log(tufa);
        tufa.getAuthenticationToken(user.address).then(token => {      
          if (token.toString() === user.token.toString()) {
            req.session.user.tokenVerification = true;
            res.json({
              status: 'OK'
            });
          } else {
            res.status(401).send({ error: 'Token does`t match' })
          }
        }).catch(e => {
          res.status(500).send();
        });
      }
    }
  };

  const logout = (req, res) => {
    delete req.session.user;
    res.json({
      status: 'OK'
    });
  };

  return {
    register: register,
    verify: verify,
    login: login,
    logout: logout,
    getUser: getUser
  };
};
