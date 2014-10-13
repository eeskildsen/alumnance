angular.module('alumnance')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/report', {
				templateUrl: '/alumnance/report'
			});
	}]);