'use strict';
// *****************************************************
// Graph Directive
// *****************************************************

module.directive('onboard', ['$rootScope', '$stateParams', '$RPC', '$timeout', 'socket',
    function($rootScope, $stateParams, $RPC, $timeout, socket) {
        return {
            restrict: 'E',
            templateUrl: '/directives/templates/onboard.html',
            link: function(scope, elem, attrs) {
                scope.actions = [
                    {key: 'user:addRepo', text: 'Add repo'},
                    {key: 'pullRequests:get', text: 'View pull request', elementclass: 'pullrequest', transition: 'scale'},
                    {key: 'issues:add', text: 'Create issue', elementclass: 'addissue', transition: 'rotate-scale'},
                    {key: 'issues:closed', text: 'Close issue', elementclass: 'closeissue', transition: 'scale-translate'},
                    {key: 'star:add', text: 'Star pull request', elementclass: 'addstar', transition: 'rotate-scale-translate'},
                    {key: 'pullRequests:merge', text: 'Merge code', elementclass: 'mergepull', transition: 'scale'}
                ];

                var getActions = function() {
                    $RPC.call('onboard', 'getactions', {
                        user: $stateParams.user,
                        repo: $stateParams.repo
                    }, function(err, actions) {
                        if(!err) {
                            var completed = 0;
                            scope.actions.forEach(function(action) {
                                action.val = actions.value[action.key];
                                if(action.val) {
                                    completed = completed + 1;
                                }
                            });
                            scope.completed = (scope.actions.length === completed);
                            if (scope.completed) {
                                $rootScope.$on('$locationChangeStart', function(){ 
                                    $rootScope.dismiss('taskbar');
                                });
                                fadeOutTaskbar();
                            }
                        }
                    });
                };

                var fadeOutTaskbar = function() {
                    $timeout(function() {
                        scope.destroyTasks = true;
                    }, 500);
                    $timeout(function() { 
                        scope.fadeInMessage = true;
                    }, 600);
                };

                scope.addClass = function(name, transition) {
                    for (var i = 0; i < document.getElementsByClassName(name).length; i++) {
                        document.getElementsByClassName(name)[i].className += (' ' + transition);
                    }
                };

                scope.removeClass = function(name, transition) {
                    for (var i = 0; i < document.getElementsByClassName(name).length; i++) {
                        document.getElementsByClassName(name)[i].className = document.getElementsByClassName(name)[i].className.replace(' ' + transition, '');
                        console.log(document.getElementsByClassName(name)[i].className);
                    }
                };

                // scope.fadeOutTasks = function() {
                //     scope.startFadeout = true;
                //     $timeout(function() {
                //         scope.tasksHidden = true;
                //         scope.fadeInMessage();
                //     }, 1000);
                // };

                // scope.fadeInMessage = function() {
                //     scope.messageShow = true;
                //     scope.startFadein = true;
                //     console.log('fadein started');
                //     $timeout(function() {
                //         scope.killHiddenDefault = true;
                //         $rootScope.dismiss('taskbar');
                //     }, 50);
                // };

                getActions();

                $rootScope.promise.then(function(user) {
                    socket.on('action:' + user.value.id, function() { 
                        getActions();
                    });
                });
            }
        };
    }
]);
