(function (angular) {
  'use strict';
  var myApp = angular.module('app', ['ngRoute']);

  if (typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else if (typeof Web3 !== 'undefined') {
    console.log('No web3? You should consider trying MetaMask!')
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  myApp.config(function ($provide) {
    $provide.provider('ethClinet', function () {
      this.$get = function () {
        return web3;
      };
    });
  });

  myApp.service('Tufa', ['ethClinet', '$q', function (ethClinet, $q) {
    const tufaContract = ethClinet.eth.contract(contractABI).at(contractAddress);
    let account = null;
    $q((resolve, reject) => ethClinet.eth.getAccounts(function (e, r) {
      if (e) {
        reject(e);
      } else {
        account = r[0];
      }
    }));

    const callback = (resolve, reject) => {
      return (e, r) => {
        if (e) {
          reject(e);
        } else {
          resolve(r);
        }
      }
    };

    this.authenticate = (verifier, token) => $q((resolve, reject) => {
      tufaContract.authenticate(verifier, token, {
        from: account,
        value: 0
      }, callback(resolve, reject));
    });
  }]);

  myApp.factory('AuthService', ['$http', '$location', function ($http, $location) {
    const authService = {};
    let loggedUser = null;
    authService.userLoaded = false;
    authService.loadUser = () => $http.get('user').then(response => {
      console.log(response);
      loggedUser = response.data.user;
      authService.userLoaded = true;
      return loggedUser;
    });
    authService.verify = () => $http.get('verify').then(() => loggedUser.tokenVerification = true);
    authService.register = (userData) => $http.post('register', angular.toJson(userData));
    authService.login = (userData) => $http.post('login', angular.toJson(userData)).then((response) => {
      loggedUser = response.data.user;
      return loggedUser;
    });
    authService.getLoggedUser = () => loggedUser;
    authService.isAuthenticated = () => loggedUser && loggedUser.tokenVerification;
    authService.logout = () => $http.post('logout').then(() => {
      loggedUser = null
    });
    return authService;
  }]);

  myApp.controller('RegistrationCtrl', function ($scope, $location, AuthService) {
    $scope.registration = {};
    if (AuthService.isAuthenticated()) {
      AuthService.logout();
    }
    $scope.register = () => {
      return AuthService.register($scope.registration).then(() => $location.path('/login'));
    };
  });

  myApp.controller('MenuCtrl', function ($scope, $location, AuthService) {
    $scope.loginData = {};
    $scope.isAuthenticated = () => AuthService.isAuthenticated();
    $scope.login = () => {
      return $location.path('/login')
    };
    $scope.logout = () => {
      return $location.path('/login')
    };
    $scope.register = () => {
      return $location.path('/register')
    };
  });


  myApp.controller('LoginCtrl', function ($scope, $location, AuthService) {
    $scope.loginData = {};
    if (AuthService.isAuthenticated()) {
      AuthService.logout();
    }
    $scope.login = () => {
      $scope.error = null;
      return AuthService.login($scope.loginData).then(() => $location.path('/2fa')).catch(response => {
        console.log(response)
        $scope.error = response.data.error;
      });
    };
  });

  myApp.controller('2faCtrl', function ($scope, $location, $interval, AuthService, Tufa) {
    if (AuthService.isAuthenticated()) {
      $location.path('/success');
    }
    $scope.loggedUser = AuthService.getLoggedUser();
    $scope.status = 'NotAuthenticated';
    $scope.authenticate = () => {
      Tufa.authenticate($scope.loggedUser.verifier, $scope.loggedUser.token).then(_ => {
        $scope.status = 'InProgress';
        const stop = $interval(() => {
          console.log("Run!");
          $scope.verify().then(() => $interval.cancel(stop))
        }, 500);
      });
    };
    $scope.verify = () => {
      return AuthService.verify().then(() => $location.path('/success'));
    };
  });

  myApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'register.html',
        controller: 'RegistrationCtrl',
      })
      .when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
      })
      .when('/success', {
        templateUrl: 'success.html'
      })
      .when('/2fa', {
        templateUrl: '2fa.html',
        controller: '2faCtrl'
      })
      .when('/register', {
        templateUrl: 'register.html',
        controller: 'RegistrationCtrl',
      });
    $locationProvider.hashPrefix('');
  });

  myApp.run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event) {
      console.log($location.path());
      const checkAuthentication = () => {
        if ($location.path() === '/success' && !AuthService.isAuthenticated()) {
          console.log('DENY');
          event.preventDefault();
          $location.path('/login');
        }
      };
      if (!AuthService.userLoaded) {
        AuthService.loadUser().then(_ => {
          checkAuthentication();
        }).catch(() => {
          checkAuthentication();
        });
      } else {
        checkAuthentication();
      }
    });
  }]);

})(window.angular);
