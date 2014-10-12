'use strict';

angular.module('alumnance')
  .controller('AlumController', ['$scope', '$modal', '$http', 'resolvedAlum', 'resolvedSchools', 'Alum',
    function ($scope, $modal, $http, resolvedAlum, resolvedSchools, Alum) {

      $scope.alums = resolvedAlum.items;
	  $scope.totalAlums = 0;
	  getResultsPage(1);
	  
	  $scope.pagination = { current: 1 };
	  
	  $scope.pageChanged = function(newPage) {
		getResultsPage(newPage);
		$scope.pagination.current = newPage;
	  }
	  
	  function getResultsPage(pageNumber) {
		$http.get('/alumnance/alums?page=' + pageNumber).then(function(result) {
			$scope.alums = result.data.items;
			$scope.totalAlums = result.data.count;
		});
	  };
	  
	  $scope.getSchools = function(alum) {
		if (typeof alum.schoolsString === 'undefined') {
			var result = [];
			angular.forEach(alum.schools, function(school) {
				result.push(school.name);
			});
			alum.schoolsString = result.join(', ');
		}
		return alum.schoolsString;
	  };

      $scope.create = function () {
        $scope.clear();
        $scope.open();
      };

      $scope.update = function (id) {
        $scope.alum = Alum.get({id: id});
        $scope.open(id);
      };

      $scope.delete = function (id) {
        Alum.delete({id: id},
          function () {
            getResultsPage($scope.pagination.current);
          });
      };

      $scope.save = function (id) {
        if (id) {
          Alum.update({id: id}, $scope.alum,
            function () {
              getResultsPage($scope.pagination.current);
              $scope.clear();
            });
        } else {
          Alum.save($scope.alum,
            function () {
			  getResultsPage($scope.pagination.current);
              $scope.clear();
            });
        }
      };

      $scope.clear = function () {
        $scope.alum = {
          
          "name": "",
          
          "maiden_name": "",
          
          "class_of": "",
          
          "id": "",
		  
		  "schools": []
        };
      };

      $scope.open = function (id) {
        var alumSave = $modal.open({
          templateUrl: 'alum-save.html',
          controller: AlumSaveController,
          resolve: {
            alum: function () {
              return $scope.alum;
            },
			resolvedSchools: function() { return resolvedSchools; }
          }
        });

        alumSave.result.then(function (entity) {
          $scope.alum = entity;
          $scope.save(id);
        });
      };
    }]);

var AlumSaveController =
  function ($scope, $modalInstance, alum, resolvedSchools) {
    $scope.alum = alum;
	$scope.resolvedSchools = resolvedSchools;
	
	$scope.schoolIndex = function(id) {
		if (typeof $scope.alum.schools !== 'undefined') {
			for (var i = 0; i < $scope.alum.schools.length; i++) {
				if ($scope.alum.schools[i].id === id) {
					return i;
				}
			}
		}
		return -1;
	}

    $scope.toggleSchool = function(school) {
		var schoolIndex = $scope.schoolIndex(school.id);
		if (schoolIndex > -1) {
			$scope.alum.schools.splice(schoolIndex, 1);
		} else {
			$scope.alum.schools.push(school);
		}
	}

    $scope.ok = function () {
      $modalInstance.close($scope.alum);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };
