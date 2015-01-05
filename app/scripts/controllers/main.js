/*global _,$,bootbox,toastr*/
'use strict';
var issueStoreReplacer = function(key, value) {
    if (key==='time'||key==='workDesc') {
        return undefined;
    }
    else return value;
};

angular.module('mbockus.Jiralite')

    .controller('JiraLiteCtrl', function JiraLiteCtrl($scope, $location, $routeParams, $filter, $http, jiraLiteStorage, jiraLiteServer) {

        var issues = $scope.issues = jiraLiteStorage.get();
        $scope.server = jiraLiteServer.get();

        $scope.queryTypes = [
            {name:'JQL', value:'jql'},
            {name:'Text', value:'text'},
            {name:'IssueId', value:'issueId'}
        ];

        $scope.selectedQueryType = $scope.queryTypes[0];
        $scope.issuesLoading = false;

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

        $scope.addIssue = function (issue) {
            if (!issue) {
                return;
            }

            if(!_.findWhere(issues, {id: issue.key})) {
                issues.push({
                    id: issue.key,
                    desc: issue.fields.summary
                });
                toastr.success('Issue ' + issue.key + ' has been added!');
            } else {
                toastr.warning('Issue ' + issue.key + ' is already in your list.');
            }
        };

        $scope.removeIssue = function (issue) {
            issues.splice(issues.indexOf(issue), 1);
        };

        $scope.logWork = function(issue) {
            if(!issue) {
                return;
            }
            if(!issue.time) {
                toastr.error('Specify the time to log against that issue.');
            }
            var worklog = {comment: issue.workDesc, timeSpent: issue.time};
            if(issue.startTime) {
                worklog.started = moment(issue.startTime).format('YYYY-MM-DDThh:mm:ss.SSSZZ');
            }
            var jsonWorkLog = JSON.stringify(worklog);
            var url = '/rest/api/2/issue/' + issue.id + '/worklog';
            $http.post(url, jsonWorkLog).
                success(function(data,status) {
                    toastr.success('Logged work for ' + issue.id);
                    issue.workDesc='';
                    issue.time='';
                    issue.startTime='';
            }).
                error(function(data,status) {
                    toastr.error('Failed to log work for ' + issue.id);
            });

        };

        $scope.searchIssues = function () {
            $scope.issuesLoading = true;
            $('#issueListModal').modal('show');
            var query;
            switch(this.selectedQueryType.value) {
                case 'jql':
                    query =  this.issueQuery;
                    break;
                case 'text':
                    query = 'text~' + this.issueQuery;
                    break;
                case 'issueId':
                    query = 'key = ' + this.issueQuery;
                    break;

            }
            var url = '/rest/api/2/search?jql=' + query + '&fields=key,summary';

            $http.get(url).success(function(data) {
                    $scope.issuesFound = data;
                    $scope.issuesLoading = false;
                }).error(function(data,status,headers,config) {
                    $scope.issuesLoading = false;
                    toastr.error('Failed to search for issues.');
                });

        };
    })
    .factory('jiraLiteStorage', function () {
        var STORAGE_ID = 'jiraLiteIssues';

        return {
            get: function () {
                return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
            },

            put: function (issues) {
                localStorage.setItem(STORAGE_ID, JSON.stringify(issues, issueStoreReplacer));
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

