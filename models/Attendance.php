<?php

class Attendance extends Illuminate\Database\Eloquent\Model {

    protected $table = "attendances";
    public $timestamps = false;
    
    public function getIdAttribute($value)
	{
		return (integer) $value;
	}
    
    public function getAlumIdAttribute($value)
    {
        return (integer) $value;
    }
    
    public function getPresentAttribute($value)
    {
        return (integer) $value;
    }
    
}
