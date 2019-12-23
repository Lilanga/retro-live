'use strict';

angular
  .module('retro')
  .service('FirebaseService', ['firebase', '$firebaseArray', '$firebaseObject', function (firebase, $firebaseArray, $firebaseObject) {
    function newFirebaseArray(messagesRef) {
      return $firebaseArray(messagesRef);
    }

    function getServerTimestamp() {
      return firebase.database.ServerValue.TIMESTAMP;
    }

    function getMessagesRef(userId) {
      return firebase.database().ref('/messages/' + userId);
    }

    function getMessageRef(userId, messageId) {
      return firebase.database().ref('/messages/' + userId + '/' + messageId);
    }

    function getBoardRef(boardId) {
      return firebase.database().ref('/boards/' + boardId);
    }

    function getBoardRefByRefId(boardId, callback) {
      return firebase.database().ref('/boards/' + boardId).on('value', function (snapshot) {
        callback(snapshot);
      });
    }

    function getBoardRefByUser(userId, callback) {
      // var ref = firebase.database().ref('boards').orderByChild("user_id").equalTo(userId);
      return firebase.database().ref('/boards/').orderByChild('user_id').equalTo(userId).on('value', function (snapshot) {
        //snapshot would have list of NODES that satisfies the condition
        console.log(snapshot.val());
        console.log('-----------');
  
        //go through each item found and print out the emails
        snapshot.forEach(function(childSnapshot) {
 
        var childData = childSnapshot.val();
     
          console.log(childData.boardId);
          callback(childSnapshot);
        });
      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });
    }

    function getBoardsRefByUser(userId, callback) {
      firebase.database().ref('/boards/').orderByChild('user_id').equalTo(userId).on('value', function (snapshot) {
        var boards = [];
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          boards.push({boardId: childData.boardId, boardName: childData.boardName, boardContext: childData.boardContext});
        });

        callback(boards);
      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });
    }

    function getBoardObjectRef(boardId) {
      return $firebaseObject(firebase.database().ref('/boards/' + boardId));
    }

    function getBoardColumns(boardId) {
      return firebase.database().ref('/boards/' + boardId + '/columns');
    }

    return {
      newFirebaseArray: newFirebaseArray,
      getServerTimestamp: getServerTimestamp,
      getMessagesRef: getMessagesRef,
      getMessageRef: getMessageRef,
      getBoardRef: getBoardRef,
      getBoardRefByUser: getBoardRefByUser,
      getBoardsRefByUser: getBoardsRefByUser,
      getBoardObjectRef: getBoardObjectRef,
      getBoardRefByRefId: getBoardRefByRefId,
      getBoardColumns: getBoardColumns
    };
  }]);
