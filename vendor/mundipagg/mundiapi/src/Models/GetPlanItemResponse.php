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
 *Response object for getting a plan item
 */
class GetPlanItemResponse implements JsonSerializable
{
    /**
     * @todo Write general description for this property
     * @required
     * @var string $id public property
     */
    public $id;

    /**
     * @todo Write general description for this property
     * @required
     * @var string $name public property
     */
    public $name;

    /**
     * @todo Write general description for this property
     * @required
     * @var string $status public property
     */
    public $status;

    /**
     * @todo Write general description for this property
     * @required
     * @maps created_at
     * @factory \MundiAPILib\Utils\DateTimeHelper::fromRfc3339DateTime
     * @var \DateTime $createdAt public property
     */
    public $createdAt;

    /**
     * @todo Write general description for this property
     * @required
     * @maps updated_at
     * @factory \MundiAPILib\Utils\DateTimeHelper::fromRfc3339DateTime
     * @var \DateTime $updatedAt public property
     */
    public $updatedAt;

    /**
     * @todo Write general description for this property
     * @required
     * @maps pricing_scheme
     * @var \MundiAPILib\Models\GetPricingSchemeResponse $pricingScheme public property
     */
    public $pricingScheme;

    /**
     * @todo Write general description for this property
     * @required
     * @var string $description public property
     */
    public $description;

    /**
     * @todo Write general description for this property
     * @required
     * @var \MundiAPILib\Models\GetPlanResponse $plan public property
     */
    public $plan;

    /**
     * @todo Write general description for this property
     * @var integer|null $quantity public property
     */
    public $quantity;

    /**
     * @todo Write general description for this property
     * @var integer|null $cycles public property
     */
    public $cycles;

    /**
     * @todo Write general description for this property
     * @maps deleted_at
     * @factory \MundiAPILib\Utils\DateTimeHelper::fromRfc3339DateTime
     * @var \DateTime|null $deletedAt public property
     */
    public $deletedAt;

    /**
     * Constructor to set initial or default values of member properties
     * @param string                    $id            Initialization value for $this->id
     * @param string                    $name          Initialization value for $this->name
     * @param string                    $status        Initialization value for $this->status
     * @param \DateTime                 $createdAt     Initialization value for $this->createdAt
     * @param \DateTime                 $updatedAt     Initialization value for $this->updatedAt
     * @param GetPricingSchemeResponse  $pricingScheme Initialization value for $this->pricingScheme
     * @param string                    $description   Initialization value for $this->description
     * @param GetPlanResponse           $plan          Initialization value for $this->plan
     * @param integer                   $quantity      Initialization value for $this->quantity
     * @param integer                   $cycles        Initialization value for $this->cycles
     * @param \DateTime                 $deletedAt     Initialization value for $this->deletedAt
     */
    public function __construct()
    {
        if (11 == func_num_args()) {
            $this->id            = func_get_arg(0);
            $this->name          = func_get_arg(1);
            $this->status        = func_get_arg(2);
            $this->createdAt     = func_get_arg(3);
            $this->updatedAt     = func_get_arg(4);
            $this->pricingScheme = func_get_arg(5);
            $this->description   = func_get_arg(6);
            $this->plan          = func_get_arg(7);
            $this->quantity      = func_get_arg(8);
            $this->cycles        = func_get_arg(9);
            $this->deletedAt     = func_get_arg(10);
        }
    }


    /**
     * Encode this object to JSON
     */
    public function jsonSerialize()
    {
        $json = array();
        $json['id']             = $this->id;
        $json['name']           = $this->name;
        $json['status']         = $this->status;
        $json['created_at']     = DateTimeHelper::toRfc3339DateTime($this->createdAt);
        $json['updated_at']     = DateTimeHelper::toRfc3339DateTime($this->updatedAt);
        $json['pricing_scheme'] = $this->pricingScheme;
        $json['description']    = $this->description;
        $json['plan']           = $this->plan;
        $json['quantity']       = $this->quantity;
        $json['cycles']         = $this->cycles;
        $json['deleted_at']     = isset($this->deletedAt) ?
            DateTimeHelper::toRfc3339DateTime($this->deletedAt) : null;

        return $json;
    }
}
