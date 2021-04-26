<?php
/*
 * MundiAPILib
 *
 * This file was automatically generated by APIMATIC v2.0 ( https://apimatic.io ).
 */

namespace MundiAPILib\Models;

use JsonSerializable;

/**
 *Request for creating a new Access Token
 */
class CreateAccessTokenRequest implements JsonSerializable
{
    /**
     * Minutes to expire the token
     * @maps expires_in
     * @var integer|null $expiresIn public property
     */
    public $expiresIn;

    /**
     * Constructor to set initial or default values of member properties
     * @param integer $expiresIn Initialization value for $this->expiresIn
     */
    public function __construct()
    {
        if (1 == func_num_args()) {
            $this->expiresIn = func_get_arg(0);
        }
    }


    /**
     * Encode this object to JSON
     */
    public function jsonSerialize()
    {
        $json = array();
        $json['expires_in'] = $this->expiresIn;

        return $json;
    }
}
