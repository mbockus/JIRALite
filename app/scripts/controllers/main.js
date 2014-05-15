/*global _,$,bootbox,toastr*/
'use strict';
var issueStoreReplacer = function(key, value) {
    if (key==='time'||key==='workDesc') {
        return undefined;
    }
    else return value;
};

angular.module('mbockus.Jiralite')

    .controller('JiraLiteCtrl', function JiraLiteCtrl($scope, $location, $routeParams, $filter, $http, jiraLiteStorage) {

        var issues = $scope.issues = jiraLiteStorage.get();

        $scope.queryTypes = [
            {name:'JQL', value:'jql'},
            {name:'Text', value:'text'},
            {name:'IssueId', value:'issueId'}
        ];
        $scope.selectedQueryType = $scope.queryTypes[0];
        $scope.issuesLoading = false;
        $scope.issueQuery=null;

        $scope.$watch('issues', function (newValue, oldValue) {
            $scope.totalIssues = issues.length;
            if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
                jiraLiteStorage.put(issues);
            }
        }, true);

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

        };

        $scope.searchIssues = function () {
            $scope.issuesLoading = true;
            $('#issueListModal').modal('show');
            var query;
            switch($scope.selectedQueryType.value) {
                case 'jql':
                    query =  $scope.issueQuery;
                    break;
                case 'text':
                    query = 'text~' + $scope.issueQuery;
                    break;
                case 'issueId':
                    query = 'key = ' + $scope.issueQuery;
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
    });

