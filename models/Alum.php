<?php

require_once '../vendor/autoload.php';

class Alum extends Illuminate\Database\Eloquent\Model {

	protected $fillable = ['name', 'maiden_name', 'class_of'];
    protected $table = "alums";
    public $timestamps = false;
	protected $with = ['schools'];
    
    // need to explicitly cast attributes of type Integer, Float, Boolean 
    
    public function schools()
	{
		return $this->belongsToMany('School');
	}
	
	public function getIdAttribute($value)
	{
		return (integer) $value;
	}
    
    public function getSchoolIdAttribute($value)
    {
        return (integer) $value;
    }
    
    public function getClassOfAttribute($value)
    {
        return (isset($value)) ? (integer) $value : null;
    }
    
}
