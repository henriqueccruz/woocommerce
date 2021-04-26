<?php
/*
 * MundiAPILib
 *
 * This file was automatically generated by APIMATIC v2.0 ( https://apimatic.io ).
 */

namespace MundiAPILib\Models;

use JsonSerializable;
use MundiAPILib\Utils\DateTimeHelper;

/**
 * @todo Write general description for this model
 */
class CreatePeriodRequest implements JsonSerializable
{
    /**
     * @todo Write general description for this property
     * @maps end_at
     * @factory \MundiAPILib\Utils\DateTimeHelper::fromRfc3339DateTime
     * @var \DateTime|null $endAt public property
     */
    public $endAt;

    /**
     * Constructor to set initial or default values of member properties
     * @param \DateTime $endAt Initialization value for $this->endAt
     */
    public function __construct()
    {
        if (1 == func_num_args()) {
            $this->endAt = func_get_arg(0);
        }
    }


    /**
     * Encode this object to JSON
     */
    public function jsonSerialize()
    {
        $json = array();
        $json['end_at'] = isset($this->endAt) ?
            DateTimeHelper::toRfc3339DateTime($this->endAt) : null;

        return $json;
    }
}
