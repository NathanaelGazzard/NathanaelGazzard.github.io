<?php
include 'util/cv.php';

$blurb = getBlurb();
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>About Me</title>
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/home.css" />
  <script src="js/home.js"></script>
</head>

<body>
  <header>
    <?php include 'header.php'; ?>
  </header>

  <main>
    <p>
      I am a husband, and a father to two. I am studying IT and I develop
      video games in my spare time. I am deeply invested in politics and
      aspire to help create a future that prioritizes human well-being.
    </p>

    <br /><br />

    <h2>CV</h2>

    <p>
      <? $blurb ?>
    </p>

    <h3>Professional Skills:</h3>

  </main>

  <footer>
    <p>Email: nathanael.gazzard@gmail.com</p>
    <p>Contact Number: 0472 602 363</p>
  </footer>
</body>

</html>