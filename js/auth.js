'use strict';

angular
  .module('retro')
  .service('Auth', ['$firebaseAuth', function ($firebaseAuth) {
    var mainAuthRef = $firebaseAuth();

    function logUser(user, callback) {
      var email = user + '@retro.com';
      var password = user;

      mainAuthRef.$signOut();
      mainAuthRef.$signInWithEmailAndPassword(email, password).then(function(userData) {
        callback(userData);
      }, function(error) {
        console.log('Logged user failed: ', error);
        window.location.hash = '';
        location.reload();
      });
    }

    function signInUser(email, password, callback) {
      mainAuthRef.$signOut();
      mainAuthRef.$signInWithEmailAndPassword(email, password).then(function(userData) {
        callback(userData);
      }, function(error) {
        console.log('Logged user failed: ', error);
        window.location.hash = '';
        location.reload();
      });
    }

    function signOutUser(callback) {
      mainAuthRef.$signOut().then(function() {
        callback(true);
      }).catch(function(error) {
        callback(false);
        console.log('User sign out failed: ', error);
      });
    }

    function createUserAndLog(newUser, callback) {
      var email = newUser + '@retro.com';
      var password = newUser;

      mainAuthRef.$createUserWithEmailAndPassword(email, password).then(function() {
        logUser(newUser, callback);
      }, function(error) {
        console.log('Create user failed: ', error);
      });
    }

    function signUpNewUser(email, password, callback) {
      mainAuthRef.$createUserWithEmailAndPassword(email, password)
      .then(function() {
        signInUser(email, password, callback);
      })
      .catch(function(error) {
        return error;
      });
    }

    return {
      createUserAndLog: createUserAndLog,
      logUser: logUser,
      signIn: signInUser,
      signOut: signOutUser,
      signUp: signUpNewUser
    };
  }]);
