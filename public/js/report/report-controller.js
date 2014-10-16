angular.module('alumnance')
	.controller('ReportController', ['$scope', '$templateCache', function($scope, $templateCache) {
		$templateCache.remove('alumnance/report');
	}]);