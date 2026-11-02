<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Rosary</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css'])
    <style>
        body {
            background-color: #ffbe5f;
            color: #7b3f00;
            font-family: "Quicksand", sans-serif;
            font-optical-sizing: auto;
            font-weight: 500;
            font-style: normal;
            overflow: hidden;
        }

    </style>
</head>
<body class="antialiased flex">
<div class="max-h-100-svh min-h-svh flex items-center max-w-screen-xl mx-auto text-6xl">
    <p>@yield('message')</p>
</div>
</body>
</html>
