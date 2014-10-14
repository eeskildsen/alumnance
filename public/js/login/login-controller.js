angular.module('alumnance')
	.controller('LoginController', ['$scope', 'Auth', function($scope, Auth) {
		$scope.auth = Auth;
		$scope.logIn = function() {
			Auth.logIn($scope.username, $scope.password);
		}
	}]);