<?php

return [

    'api_base_url' => env('APISUNAT_API_BASE_URL', 'https://back.apisunat.com'),
    'persona_id' => env('APISUNAT_PERSONA_ID', ''),
    'persona_token' => env('APISUNAT_PERSONA_TOKEN', ''),
    'customer_email' => env('APISUNAT_CUSTOMER_EMAIL', ''),
    'default_pdf_format' => env('APISUNAT_PDF_FORMAT', 'ticket80mm'),

];
