/*global bootbox*/
'use strict';

angular.module('mbockus.Jiralite')

    .controller('JiraLiteCtrl', function JiraLiteCtrl($scope, $location, $routeParams, $filter, jiraLiteStorage, jiraLiteServer) {

        var issues = $scope.issues = jiraLiteStorage.get();

        $scope.newIssue = '';
        $scope.newIssueDesc = '';
        $scope.server = jiraLiteServer.get();

        $scope.$watch('issues', function (newValue, oldValue) {
            $scope.totalIssues = issues.length;
            if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
                jiraLiteStorage.put(issues);
            }
        }, true);

        $scope.settings = function() {
            var settingsBox = bootbox.prompt('Specify the JIRA server (e.g. https://jira.atlassian.com/):', function(result) {
                if (result) {
                    bootbox.hideAll();
                    $scope.server = result;
                    jiraLiteServer.put(result);
                }
            });
            settingsBox.find('.modal-title').addClass('bootbox-title');
            settingsBox.find('.bootbox-input').val($scope.server);
        };

        $scope.addIssue = function () {
            var newIssue = $scope.newIssue.trim();
            if (!newIssue.length) {
                return;
            }

            var newIssueDesc = $scope.newIssueDesc.trim();
            if (!newIssueDesc.length) {
                return;
            }

            issues.push({
                id: newIssue,
                desc: newIssueDesc
            });

            $scope.newIssue = '';
            $scope.newIssueDesc = '';
        };

        $scope.removeTodo = function (issue) {
            issues.splice(issues.indexOf(issue), 1);
        };

        if(jiraLiteServer.get() === '') {
            $scope.settings();
        }

    })
    .factory('jiraLiteStorage', function () {
        var STORAGE_ID = 'jiraLiteIssues';

        return {
            get: function () {
                return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
            },

            put: function (issues) {
                localStorage.setItem(STORAGE_ID, JSON.stringify(issues));
            }
        };
    })
    .factory('jiraLiteServer',  function () {
        var STORAGE_ID = 'jiraLiteServer';

        return {
            get: function () {
                return localStorage.getItem(STORAGE_ID) || '';
            },

            put: function (jiraLiteServer) {
                localStorage.setItem(STORAGE_ID, jiraLiteServer);
            }
        };
    });
