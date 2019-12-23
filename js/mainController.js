/* global EmojiPicker */
'use strict';

angular
  .module('retro')

  .controller('MainCtrl', [
    '$scope',
    '$filter',
    '$window',
    'Utils',
    'Auth',
    '$rootScope',
    'FirebaseService',
    'ModalService',
    'Features',
    function(
      $scope,
      $filter,
      $window,
      utils,
      auth,
      $rootScope,
      firebaseService,
      modalService,
      features
    ) {
      $scope.loading = true;
      $scope.messageTypes = utils.messageTypes;
      $scope.utils = utils;
      $scope.newBoard = {
        name: '',
        text_editing_is_private: true
      };
      $scope.newUser = {
        name: '',
        password: ''
      };
      $scope.user = {
        name: '',
        password: ''
      };
      $scope.features = features;
      $scope.userId = $window.location.hash.substring(1) || '';
      $scope.searchParams = {};
      $window.location.search
        .substr(1)
        .split('&')
        .forEach(function(pair) {
          var keyValue = pair.split('=');
          $scope.searchParams[keyValue[0]] = keyValue[1];
        });
      $scope.sortField = $scope.searchParams.sort || 'date_created';
      $scope.selectedType = 1;
      $scope.import = {
        data: [],
        mapping: []
      };

      $scope.droppedEvent = function(dragEl, dropEl) {
        var drag = $('#' + dragEl);
        var drop = $('#' + dropEl);
        var dragMessageRef = firebaseService.getMessageRef(
          $scope.userId,
          drag.attr('messageId')
        );

        dragMessageRef.once('value', function() {
          dragMessageRef.update({
            type: {
              id: drop.data('column-id')
            }
          });
        });
      };

      // function getBoardAndMessages(userData) {
      //   var tmpBoardId = $window.location.hash.substring(1);
      //   if(!tmpBoardId){
      //     return;
      //   }

      //   $scope.boardId = tmpBoardId;
      //   var messagesRef = firebaseService.getMessagesRef($scope.boardId);
      //   var boardRef = firebaseService.getBoardRef($scope.boardId);

      //   $scope.boardObject = firebaseService.getBoardObjectRef($scope.boardId);

      //   boardRef.on('value', function(board) {
      //     if (board.val() === null) {
      //       window.location.hash = '';
      //       location.reload();
      //     }
      //     $scope.board = board.val();
      //     $scope.maxVotes = board.val().max_votes ? board.val().max_votes : 6;
      //     $scope.boardId = $rootScope.boardId = board.val().boardId;
      //     $scope.boardContext = $rootScope.boardContext = board.val().boardContext;
      //     $scope.loading = false;
      //     $scope.hideVote = board.val().hide_vote;
      //     setTimeout(function() {
      //       new EmojiPicker();
      //     }, 100);
      //   });

      //   $scope.boardRef = boardRef;
      //   $scope.messagesRef = messagesRef;
      //   $scope.userUid = userData.uid;
      //   $scope.messages = firebaseService.newFirebaseArray(messagesRef);
      // }

      function loadBoards(userData) {
        $scope.boardId = '';
        $scope.userData = userData;
        $scope.boards = null;

          firebaseService.getBoardsRefByUser(userData.uid, function(boardsList){
            $scope.userId = userData.uid;
            $scope.boards = boardsList;
            $scope.loading = false;

            // safe apply
            if($scope.$$phase !== '$apply' && $scope.$$phase !== '$digest') {
              $scope.$apply();
            }
          });
      }

      function loadBoardMessages(boardRef){
        // $scope.userData = userData;
        var messagesRef = firebaseService.getMessagesRef($scope.boardId);
        $scope.boardObject = firebaseService.getBoardObjectRef($scope.boardId);

        boardRef.on('value', function(board) {
          if (board.val() === null) {
            window.location.hash = '';
            location.reload();
          }
          $scope.board = board.val();
          $scope.maxVotes = board.val().max_votes ? board.val().max_votes : 6;
          $scope.boardId = $rootScope.boardId = board.val().boardId;
          $scope.boardName = $rootScope.boardName = board.val().boardName;
          $scope.boardContext = $rootScope.boardContext = board.val().boardContext;
          $scope.loading = false;
          $scope.hideVote = board.val().hide_vote;
          setTimeout(function() {
            new EmojiPicker();
          }, 100);
        });

        $scope.boardRef = boardRef;
        $scope.messagesRef = messagesRef;
        // $scope.userUid = userData.uid;
        $scope.messages = firebaseService.newFirebaseArray(messagesRef);
      }

      function loadBoardAndMessages(boardId) {
        if(boardId){
          $scope.boardId = boardId;
          // $scope.userData = userData;
          var boardRef = firebaseService.getBoardRef($scope.boardId);
          loadBoardMessages(boardRef);
        }else{
          console.log('No board ID, here what needs to do??');
          // firebaseService.getBoardRefByUser(userData.uid, function(boardRef){
          //   $scope.userId = userData.uid;
          //   $scope.boardId = boardRef.val().boardId;
          //   loadBoardMessages(userData, boardRef);
          // });  
        }
      }

      if ($scope.userId !== '' && $scope.userData) {
        // auth.logUser($scope.userId, getBoardAndMessages);
        // getBoardAndMessages($scope.userData);
      } else {
        $scope.loading = false;
      }

      $scope.selectBoard = function() {
        $scope.boardId = $scope.selectedBoard;
        $scope.selectedBoard = '';
        loadBoardAndMessages($scope.boardId);
      };

      $scope.unselectBoard = function() {
        $scope.boardId = '';
      };

      $scope.isColumnSelected = function(type) {
        return parseInt($scope.selectedType) === parseInt(type);
      };

      $scope.isCensored = function(message, privateWritingOn) {
        return message.creating && privateWritingOn;
      };

      $scope.updatePrivateWritingToggle = function(privateWritingOn) {
        $scope.boardRef.update({
          text_editing_is_private: privateWritingOn
        });
      };

      $scope.updateEditingMessage = function(message, value) {
        message.creating = value;
        $scope.messages.$save(message);
      };

      $scope.getSortFields = function() {
        return $scope.sortField === 'votes' ? ['-votes', 'date_created'] : 'date_created';
      };

      $scope.saveMessage = function(message) {
        message.creating = false;
        $scope.messages.$save(message);
      };

      function redirectToBoard(boardRefId) {
        window.location.href =
          window.location.origin +
          window.location.pathname +
          '#' +
          boardRefId;
          $scope.newBoard.boardId = '';
      }

      function redirectToNewBoard() {
        window.location.href =
          window.location.origin +
          window.location.pathname +
          '#' +
          $scope.boardId;
      }

      $scope.isBoardNameInvalid = function() {
        return !$scope.newBoard.name;
      };

      $scope.isNewUserInvalid = function() {
        return (!$scope.newUser.name && !$scope.newUser.password);
      };

      $scope.isUserInvalid = function() {
        return (!$scope.user.name && !$scope.user.password);
      };

      $scope.isMaxVotesValid = function() {
        return Number.isInteger($scope.newBoard.max_votes);
      };

      $scope.createNewBoard = function() {
        $scope.loading = true;
        modalService.closeAll();

        var callback = function(userData) {
          $scope.newBoard.boardId = utils.createBoardId();
          var board = firebaseService.getBoardRef($scope.newBoard.boardId);
          board.set(
            {
              boardId: $scope.newBoard.boardId,
              boardName: $scope.newBoard.name,
              date_created: new Date().toString(),
              columns: $scope.messageTypes,
              user_id: userData.uid,
              max_votes: $scope.newBoard.max_votes || 6,
              text_editing_is_private: $scope.newBoard.text_editing_is_private
            },
            function(error) {
              if (error) {
                $scope.loading = false;
              } else {
                redirectToBoard($scope.newBoard.boardId);
              }
            }
          );

          $scope.newBoard.name = '';
        };

        if($scope.userData){
          callback($scope.userData);
        }else{
          // Todo: handle properly
          auth.createUserAndLog($scope.userId, callback);
        }
      };

      $scope.createNewUser = function() {
        $scope.loading = true;
        modalService.closeAll();

        var callback = function(userData) {
          $scope.userId = userData.uid;
          $scope.userData = userData;
          $scope.boardId = utils.createBoardId();
          var board = firebaseService.getBoardRef($scope.boardId);
          board.set(
            {
              boardId: 'Welcome board',
              date_created: new Date().toString(),
              columns: $scope.messageTypes,
              user_id: userData.uid,
              max_votes: 6,
              text_editing_is_private: true
            },
            function(error) {
              if (error) {
                $scope.loading = false;
              } else {
                redirectToNewBoard();
              }
            }
          );

          $scope.newBoard.name = '';
        };

        auth.signUp($scope.newUser.name, $scope.newUser.password, callback);
      };

      $scope.logUser = function() {
        $scope.loading = true;
        modalService.closeAll();

        auth.signIn($scope.user.name, $scope.user.password, loadBoards);
      };

      $scope.signOutUser = function() {
        auth.signOut(function(status){
          if(status){
            $scope.userData = null;
            $scope.boardId = '';
            $scope.userId = '';
            $scope.boardRef = null;
            $scope.messagesRef = null;
            $scope.userUid = '';
            $scope.messages = null;
            window.location.hash = '';
          }
        });
      };

      $scope.changeBoardContext = function() {
        $scope.boardRef.update({
          boardContext: $scope.boardContext
        });
      };

      $scope.changeBoardName = function(newBoardName) {
        $scope.boardRef.update({
          boardName: newBoardName
        });

        modalService.closeAll();
      };

      $scope.updateSortOrder = function() {
        var updatedFilter =
          $window.location.origin +
          $window.location.pathname +
          '?sort=' +
          $scope.sortField +
          $window.location.hash;
        $window.history.pushState({ path: updatedFilter }, '', updatedFilter);
      };

      $scope.addNewColumn = function(name) {
        if (typeof name === 'undefined' || name === '') {
          return;
        }

        $scope.board.columns.push({
          value: name,
          id: utils.getNextId($scope.board)
        });

        var boardColumns = firebaseService.getBoardColumns($scope.userId);
        boardColumns.set(utils.toObject($scope.board.columns));

        modalService.closeAll();
      };

      $scope.changeColumnName = function(id, newName) {
        if (typeof newName === 'undefined' || newName === '') {
          return;
        }

        $scope.board.columns.map(function(column, index, array) {
          if (column.id === id) {
            array[index].value = newName;
          }
        });

        var boardColumns = firebaseService.getBoardColumns($scope.userId);
        boardColumns.set(utils.toObject($scope.board.columns));

        modalService.closeAll();
      };

      $scope.deleteColumn = function(column) {
        $scope.board.columns = $scope.board.columns.filter(function(_column) {
          return _column.id !== column.id;
        });

        var boardColumns = firebaseService.getBoardColumns($scope.userId);
        boardColumns.set(utils.toObject($scope.board.columns));
        modalService.closeAll();
      };

      $scope.deleteMessage = function(message) {
        $scope.messages.$remove(message);

        modalService.closeAll();
      };

      function addMessageCallback(message) {
        var id = message.key;
        angular.element($('#' + id)).scope().isEditing = true;
        new EmojiPicker();
        $('#' + id)
          .find('textarea')
          .focus();
      }

      $scope.addNewMessage = function(type) {
        $scope.messages
          .$add({
            text: '',
            creating: true,
            user_id: $scope.userUid,
            type: {
              id: type.id
            },
            date: firebaseService.getServerTimestamp(),
            date_created: firebaseService.getServerTimestamp(),
            votes: 0
          })
          .then(addMessageCallback);
      };

      $scope.deleteCards = function() {
        $($scope.messages).each(function(index, message) {
          $scope.messages.$remove(message);
        });

        modalService.closeAll();
      };

      $scope.deleteBoard = function() {
        $scope.deleteCards();
        $scope.boardRef.ref.remove();

        modalService.closeAll();
        window.location.hash = '';
        location.reload();
      };

      $scope.submitOnEnter = function(event, method, data) {
        if (event.keyCode === 13) {
          switch (method) {
            case 'createNewBoard':
              if (!$scope.isBoardNameInvalid()) {
                $scope.createNewBoard();
              }

              break;
            case 'createNewUser':
              if (!$scope.isNewUserInvalid()) {
                $scope.createNewUser();
              }

              break;
            case 'logUser':
              if (!$scope.isUserInvalid()) {
                $scope.logUser();
              }
              
              break;
            case 'addNewColumn':
              if (data) {
                $scope.addNewColumn(data);
                $scope.newColumn = '';
              }

              break;
          }
        }
      };

      $scope.cleanImportData = function() {
        $scope.import.data = [];
        $scope.import.mapping = [];
        $scope.import.error = '';
      };

      /* globals ClipboardJS */
      new ClipboardJS('.import-btn');

      angular.element($window).bind('hashchange', function() {
        $scope.loading = true;
        // $scope.userId = $window.location.hash.substring(1) || '';
        var boardId = $window.location.hash.substring(1) || '';
        // handle login logic here if not logged in
        if($scope.userData && boardId !== ''){
          loadBoardAndMessages(boardId);
        }else{
          $scope.loading = false;
        }
        // auth.logUser($scope.userId, getBoardAndMessages);
      });
    }
  ]);
