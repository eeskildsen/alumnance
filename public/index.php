<?php
require '../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver'    => 'sqlite',
    'host'      => 'localhost',
    'database'  => implode(DIRECTORY_SEPARATOR, [__DIR__, '..', 'data', 'alumnance.db']),
    'username'  => '',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

// Set the event dispatcher used by Eloquent models... (optional)
use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;
$capsule->setEventDispatcher(new Dispatcher(new Container));

// Make this Capsule instance available globally via static methods... (optional)
$capsule->setAsGlobal();

// Setup the Eloquent ORM... (optional; unless you've used setEventDispatcher())
$capsule->bootEloquent();

$app = new \Slim\Slim();

$app->get('/', function() use ($app) {
    readfile('index.html');
    $app->stop();
});

$app->post('/alumnance/upload', function() use($app) {

	// Make sure that a file was received and that it's really a CSV file
	if (!isset($_FILES['file'])) {
		$app->response->status(500);
		echo json_encode(array('error' => 'The file didn\'t make it to the server.'));
	} elseif (substr(strtolower($_FILES['file']['name']), -3) !== 'csv') {
		$app->response->status(500);
		echo json_encode(array('error' => 'That doesn\'t look like the right type of file. Please upload a CSV file.'));
	} else {
		
		// Make sure the CSV file has the required number of columns
		$rows = file($_FILES['file']['tmp_name']);
		$firstRow = str_getcsv(array_shift($rows));
		if (count($firstRow) < 4) {
			$app->response->status(500);
			echo json_encode(array('error' => 'That file doesn\'t have the right number of columns. Please upload a CSV file with 4 columns.'));
		} else {
			
			$existingSchools = [];
			
			
			// Remove all old alums, schools, attendance records, and alum-to-school relations
			Capsule::beginTransaction();
			Alum::truncate();
			AlumSchool::truncate();
			School::truncate();
			Attendance::truncate();
			Capsule::commit();

			Capsule::beginTransaction();
			foreach ($rows as $row) {
				
				// Get the current alum's attributes and schools from this row's CSV fields
				$csv = str_getcsv($row);
				if (strlen($csv[0]) > 0) {
				
					$alum = new Alum;
					$alum->name = $csv[0];
					$alum->maiden_name = $csv[1];
					$alum->class_of = $csv[3];
					$schools = explode(', ', $csv[2]);
					$alum->save();
					
					// Update or create the alum's school(s) in the database
					if (count($schools) > 0) {
						foreach ($schools as $school) {
							if (!array_key_exists($school, $existingSchools)) {
								$newSchool = new School;
								$newSchool->name = $school;
								$newSchool->save();
								$existingSchools[$school] = $newSchool->id;
							}
							$alum->schools()->attach($existingSchools[$school]);
						}
						$alum->save();
						
					}
					
				}
			}
			Capsule::commit();
		}
	}
});

 
$app->get('/alumnance/schools', function() {
    $schools = School::orderBy('name')->get();
    echo $schools->toJson();
});

$app->get('/alumnance/schools/:id', function($id) use($app) {
    $school = School::find($id);
    if (is_null($school)) {
        $app->response->status(404);
        $app->stop();
    }
    echo $school->toJson();    
});

$app->post('/alumnance/schools', function() use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $school = new School;
    
    $school->name = $obj->{'name'};
    $school->save();
    $app->response->status(201);
    echo $school->toJson();    
});

$app->put('/alumnance/schools/:id', function($id) use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $school = School::find($id);
    if (is_null($school)) {
        $app->response->status(404);
        $app->stop();
    }
    
    $school->name = $obj->{'name'};
    $school->save();
    echo $school->toJson();    
});

$app->delete('/alumnance/schools/:id', function($id) use($app) {
    $school = School::find($id);
    if (is_null($school)) {
        $app->response->status(404);
        $app->stop();
    }
    $school->delete();
    $app->response->status(204);
});


$app->get('/alumnance/alums', function() use($app) {
	$sql = 'SELECT alums.id, alums.name, alums.maiden_name, alums.class_of, GROUP_CONCAT(schools.name, ", ") AS schools FROM alums LEFT JOIN alum_school ON alum_school.alum_id = alums.id LEFT JOIN schools ON schools.id = alum_school.school_id GROUP BY alums.name ORDER BY alums.name';
	$statement = Capsule::connection()->getPdo()->query($sql);
	$rows = $statement->fetchAll(PDO::FETCH_ASSOC);
	echo json_encode($rows, JSON_NUMERIC_CHECK);
});

$app->get('/alumnance/alums/:id', function($id) use($app) {

	// Get the alum with the specified ID
	$sql = 'SELECT alums.name, alums.maiden_name, alums.class_of, GROUP_CONCAT(schools.name, ", ") AS schools FROM alums LEFT JOIN alum_school ON alum_school.alum_id = alums.id LEFT JOIN schools ON schools.id = alum_school.school_id WHERE alums.id = :id GROUP BY alums.name';
	$statement = Capsule::connection()->getPdo()->prepare($sql);
	$statement->bindValue(':id', $id);
	$statement->execute();
	$alum = $statement->fetch(PDO::FETCH_ASSOC);

	// 404 if an alum with the specified ID wasn't found
    if ($alum === false) {
        $app->response->status(404);
        $app->stop();
    }
	
    echo json_encode($alum, JSON_NUMERIC_CHECK);
});

$app->post('/alumnance/alums', function() use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $alum = new Alum;
    
    $alum->name = $obj->{'name'};
    $alum->maiden_name = $obj->{'maiden_name'};
    $alum->schools()->attach($obj->schoolIds);
    $alum->class_of = $obj->{'class_of'};
    $alum->save();
    $app->response->status(201);
    echo $alum->toJson();    
});

$app->put('/alumnance/alums/:id', function($id) use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $alum = Alum::with('schools')->find($id);
    if (is_null($alum)) {
        $app->response->status(404);
        $app->stop();
    }
    
    $alum->name = $obj->{'name'};
    $alum->maiden_name = $obj->{'maiden_name'};
    $alum->schools()->sync($obj->schoolIds);
    $alum->class_of = $obj->{'class_of'};
    $alum->save();
    echo $alum->toJson();    
});

$app->delete('/alumnance/alums/:id', function($id) use($app) {
    $alum = Alum::find($id);
    if (is_null($alum)) {
        $app->response->status(404);
        $app->stop();
    }
    $alum->delete();
    $app->response->status(204);
});


$app->get('/alumnance/attendances', function() {
    $attendances = Attendance::all();
    echo $attendances->toJson();
});

$app->get('/alumnance/attendances/:id', function($id) use($app) {
    $attendance = Attendance::find($id);
    if (is_null($attendance)) {
        $app->response->status(404);
        $app->stop();
    }
    echo $attendance->toJson();    
});

$app->post('/alumnance/attendances', function() use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $attendance = new Attendance;
    
    $attendance->alum_id = $obj->{'alum_id'};
    $attendance->present = $obj->{'present'};
    $attendance->save();
    $app->response->status(201);
    echo $attendance->toJson();    
});

$app->put('/alumnance/attendances/:id', function($id) use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $attendance = Attendance::find($id);
    if (is_null($attendance)) {
        $app->response->status(404);
        $app->stop();
    }
    
    $attendance->alum_id = $obj->{'alum_id'};
    $attendance->present = $obj->{'present'};
    $attendance->save();
    echo $attendance->toJson();    
});

$app->delete('/alumnance/attendances/:id', function($id) use($app) {
    $attendance = Attendance::find($id);
    if (is_null($attendance)) {
        $app->response->status(404);
        $app->stop();
    }
    $attendance->delete();
    $app->response->status(204);
});



$app->run();
