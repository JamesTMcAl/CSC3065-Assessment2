<?php
echo "Test Script Starting\n";
require('functions.inc.php');

$t = "there are four words";
$expect = 4;
$answer = wordcount($t);
echo "Local Test Result: '$t' = $answer (expected: $expect)\n";

if ($answer == $expect) {
    echo "Local Test Passed\n";
} else {
    echo "Local Test Failed\n";
    exit(1); // Exit with failure
}

if (getenv('SKIP_ENDPOINT_TESTS') == 'true') {
    echo "Skipping endpoint tests.\n";
    exit(0);
}

$tests = [
    ["input" => "there are four words", "expected" => 4],
    ["input" => "", "expected" => "Text cannot be empty."],
    ["input" => "one", "expected" => 1],
    ["input" => "this is a test case", "expected" => 5]
];

foreach ($tests as $test) {
    $input = $test['input'];
    $expected = $test['expected'];
    $url = "http://localhost:8000/index.php?text=" . urlencode($input);
    $response = file_get_contents($url);

    echo "Input: '$input'\n";
    echo "Expected: $expected, Got: $response\n";

    if (strpos($response, (string)$expected) !== false) {
        echo "Test Passed\n";
    } else {
        echo "Test Failed\n";
        exit(1);
    }
}

