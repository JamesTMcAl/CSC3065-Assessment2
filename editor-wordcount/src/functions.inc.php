<?php
function wordcount($text)
{
    return str_word_count($text);
}
function handleError($message)
{
    return json_encode([
        "error" => true,
        "message" => $message,
        "answer" => $message
    ]);
}

