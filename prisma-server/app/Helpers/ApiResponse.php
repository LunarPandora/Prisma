<?php

namespace App\Helpers;

class ApiResponse
{
    public static function success($data = null, $message = "Success!", $code = 200)
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    public static function failed($message = "Failed!", $code = 500)
    {
        return response()->json([
            'status'  => 'failed',
            'message' => $message,
            'data'    => null,
        ], $code);
    }
}